const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const AdIdea = require('../models/adIdea');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/get', async (req, res) => {
    console.log("Request body:", req.body);

  const { keyword, businessName, businessType, campaignName, campaignFocus } = req.body;

  if (!keyword || !businessName || !businessType || !campaignName || !campaignFocus) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log("no missing fields");

  try {
    // 1. SCRAPE COMPETITOR ADS
    console.log("trying to scrape");
    const scrapeRes = await axios.post('http://localhost:3000/competitor-ads/scrape-facebook-ads', { keyword });
    console.log("scraping");
    const ads = scrapeRes.data.ads || [];
    console.log("scraping");
    // console.log(scrapeRes.data);

    const imageUrls = [...new Set(
  ads
    .filter(ad => Array.isArray(ad.images))
    .flatMap(ad =>
      ad.images
        .filter(img => img.url)
        .map(img => img.url)
    )
)].slice(0, 5);


    console.log("image urls");

    if (imageUrls.length === 0) {
      return res.status(404).json({ error: 'No images found in competitor ads' });
    }

    // 3. Analyze each image using your local LLaMA image analyzer
    const analyzedDescriptions = await Promise.all(
      imageUrls.map(async (url) => {
        const analyzeRes = await axios.post(
          'http://localhost:3000/caption/analyze-image', // ← your LLaMA vision proxy
          { imageUrl: url }
        );
        return analyzeRes.data?.choices?.[0]?.message?.content || '';
      })
    );
    console.log("analyzed descriptions");

    // 4. Build prompt for GPT / LLaMA
    const fullPrompt = `
You are a social media marketing assistant. Based on the following competitor image descriptions:

${analyzedDescriptions.map((desc, i) => `Ad ${i + 1}: ${desc}`).join('\n')} and captions: ${ads.map((ad, i) => `Ad ${i + 1}: ${ad.body_text}`).join('\n')}

Generate 4 new ad ideas for a campaign by "${businessName}" in the "${businessType}" domain. The campaign is titled "${campaignName}" and focuses on "${campaignFocus}".

Each idea should include:
- An image description prompt (for AI image generation)
- A matching caption (engaging, with emojis and hashtags)

IMPORTANT: Respond with ONLY a valid JSON array. No additional text, explanations, or formatting. Start with [ and end with ].

Format:
[
  {
    "image_prompt": "...",
    "caption": "..."
  },
  {
    "image_prompt": "...",
    "caption": "..."
  },
  {
    "image_prompt": "...",
    "caption": "..."
  },
  {
    "image_prompt": "...",
    "caption": "..."
  }
]
`;
    // console.log("full prompt:", fullPrompt);
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "meta-llama/llama-4-maverick:free",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: fullPrompt }
        ]
      }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY2}`,
        "Content-Type": "application/json"
      }
    });

    console.log("🧠 Raw OpenRouter response object:", JSON.stringify(response.data, null, 2));
    const rawOutput = response.data?.choices?.[0]?.message?.content;
    console.log("Raw output received:", rawOutput);

    if (!rawOutput || rawOutput.trim().length === 0) {
      console.warn("⚠️ Raw output from scraping was empty or invalid.");
      console.log("🧠 Full response for debugging:", JSON.stringify(response.data, null, 2));
      return;
    }


    // Try to parse JSON with improved logic
    let ideas = [];
    try {
      // First, try to extract JSON from the response
      let jsonString = rawOutput;
      
      // Look for JSON array pattern
      const jsonMatch = rawOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
        console.log("Found JSON match:", jsonString.substring(0, 100) + "...");
      }
      
      // Clean up any potential formatting issues
      jsonString = jsonString.trim();
      
      ideas = JSON.parse(jsonString);
      
      // Validate that it's an array
      if (!Array.isArray(ideas)) {
        throw new Error('Response is not an array');
      }
      
      console.log("Successfully parsed", ideas.length, "ideas");
      
    } catch (e) {
      console.error('JSON parsing failed:', e.message);
      console.error('Raw output length:', rawOutput?.length);
      console.error('Raw output preview:', rawOutput?.substring(0, 200));
      console.error('Raw output end:', rawOutput?.substring(-200));
      
      // Try one more approach - look for the actual JSON content
      try {
        // Sometimes the JSON is embedded in markdown code blocks
        const codeBlockMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          ideas = JSON.parse(codeBlockMatch[1]);
          console.log("Successfully parsed from code block");
        } else {
          throw new Error('No JSON found in any format');
        }
      } catch (e2) {
        console.error('Secondary parsing also failed:', e2.message);
        // Fallback: try to extract at least some usable content
        ideas = [{
          image_prompt: 'Failed to parse JSON output - check logs',
          caption: rawOutput?.substring(0, 500) + '...' || 'No content received'
        }];
      }
    }

    // Generate images and store in database
    const commonMetadata = {
      keyword,
      businessName,
      businessType,
      campaignName,
      campaignFocus
    };

    const generationPromises = ideas.map(idea =>
      generateImageWithGPT(idea.image_prompt, idea.caption, commonMetadata)
    );

    const storedAds = (await Promise.all(generationPromises)).filter(Boolean);
    console.log("Generated and stored", storedAds.length, "ads");

    // Send response with both ideas and stored ads info
    res.json({ 
  ideas,
  competitorAds: ads,       // include scraped competitor ads
  generatedAds: storedAds,  // include stored/generated ads
  storedCount: storedAds.length,
  success: true 
});


  } catch (error) {
    console.error("Failed to generate inspired ads:", error.message);
    res.status(500).json({ error: 'Internal error generating ads' });
  }
});

const generateImagewithFlux = async (image_prompt, caption, metadata) => {
  try {
    console.log("🎨 Generating image with Flux for prompt:", image_prompt.substring(0, 50) + "...");
    
    const genRes = await axios.post('http://localhost:5000/flux', {
      prompt: image_prompt,
      seed: 0,
      randomize_seed: true,
      width: 576,
      height: 1024,
      num_inference_steps: 4
    });

    const imageBase64 = genRes.data?.GeneratedImage;
    if (!imageBase64) {
      console.log("⚠️ No image generated for prompt");
      return null;
    }

    const ad = new AdIdea({
      ...metadata,
      imagePrompt: image_prompt,
      caption,
      imageBase64,
      createdAt: new Date()
    });

    await ad.save();
    console.log("✅ Flux ad saved to database");
    return ad;
  } catch (err) {
    console.error(`❌ Flux image generation failed for prompt: "${image_prompt.substring(0, 50)}..."`, err.message);
    return null;
  }
};
const generateImageWithGPT = async (prompt, caption, metadata) => {
  try {
    console.log("🧠 Generating image with GPT-image-1 for prompt:", prompt.substring(0, 50) + "...");

    const result = await openai.images.generate({
      model: "gpt-image-1", // or "dall-e-3" if not yet approved for gpt-image-1
      prompt: prompt,
      n: 1,
      size: "1024x1024", // or "576x1024" if supported
      quality: "low"
    });

    const imageBase64 = result.data[0]?.b64_json;
    if (!imageBase64) {
      console.warn("⚠️ No image returned by GPT-image-1");
      return null;
    }

    // Optional: save image to file
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const filename = `gpt_generated_${Date.now()}.png`;
    const filepath = path.join(__dirname, 'outputs', filename);
    fs.writeFileSync(filepath, imageBuffer);

    // Optional: save to MongoDB
    const ad = new AdIdea({
      ...metadata,
      imagePrompt: prompt,
      caption,
      imageBase64,
      createdAt: new Date()
    });
    await ad.save();
    console.log("✅ GPT ad saved to MongoDB");

    return ad;

  } catch (err) {
    console.error("❌ GPT-image generation failed:", err.message);
    return null;
  }
};


module.exports = router;