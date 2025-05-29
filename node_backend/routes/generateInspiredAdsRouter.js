const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const AdIdea = require('../models/adIdea');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keep your original API but modify it to return competitor ads immediately
router.post('/get', async (req, res) => {
  console.log("Request body:", req.body);

  const { keyword, businessName, businessType, campaignName, campaignFocus } = req.body;

  if (!keyword || !businessName || !businessType || !campaignName || !campaignFocus) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get competitor ads using internal API call
    const competitorData = await getCompetitorAdsInternal(keyword);
    
    if (!competitorData.success) {
      return res.status(404).json({ error: 'No competitor ads found' });
    }

    // 2. Start background generation (don't await)
    const jobId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Fire and forget - start generation in background
    generateAdsInBackground(jobId, {
      keyword,
      businessName, 
      businessType,
      campaignName,
      campaignFocus,
      competitorData
    }).catch(err => {
      console.error(`Background generation failed for job ${jobId}:`, err.message);
    });

    // 3. Return competitor ads immediately with job ID for tracking
    res.json({
      ideas: [], // Empty for now, will be populated via polling
      competitorAds: competitorData.competitorAds,
      analyzedDescriptions: competitorData.analyzedDescriptions,
      jobId, // Frontend can use this to poll for generated ads
      generatedAds: [], // Empty initially
      storedCount: 0,
      success: true,
      status: 'competitor_ads_ready', // Let frontend know what's available
      message: 'Competitor ads loaded, generation in progress...'
    });

  } catch (error) {
    console.error("Failed to get competitor ads:", error.message);
    res.status(500).json({ error: 'Internal error getting competitor ads' });
  }
});

// Internal function to get competitor ads (extracted from your original code)
async function getCompetitorAdsInternal(keyword) {
  try {
    // 1. SCRAPE COMPETITOR ADS
    console.log("trying to scrape");
    const scrapeRes = await axios.post('http://localhost:3000/competitor-ads/scrape-facebook-ads', { keyword });
    console.log("scraping");
    const ads = scrapeRes.data.ads || [];

    // 2. Extract image URLs from top 5 ads
    const imageUrls = [...new Set(
      ads.flatMap(ad => ad.images?.map(img => img.url)).filter(Boolean)
    )].slice(0, 5);

    console.log("image urls");

    if (imageUrls.length === 0) {
      return { success: false, error: 'No images found in competitor ads' };
    }

    // 3. Analyze each image
    const analyzedDescriptions = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const analyzeRes = await axios.post(
            'http://localhost:3000/caption/analyze-image',
            { imageUrl: url }
          );
          return analyzeRes.data?.choices?.[0]?.message?.content || '';
        } catch (err) {
          console.warn('Image analysis failed for:', url);
          return '';
        }
      })
    );

    console.log("analyzed descriptions");

    return {
      success: true,
      competitorAds: ads,
      analyzedDescriptions,
      imageUrls
    };

  } catch (error) {
    console.error("Internal competitor ads fetch failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Add the polling endpoint (this is new but simple)
router.get('/generation-status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    // Check database for completed ads with this jobId
    const generatedAds = await AdIdea.find({ jobId }).sort({ createdAt: -1 });
    
    const status = generatedAds.length >= 4 ? 'completed' : 'generating';
    
    res.json({
      jobId,
      status,
      generatedAds,
      count: generatedAds.length,
      success: true
    });

  } catch (error) {
    console.error("Failed to check generation status:", error.message);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Your existing background generation function (slightly modified to use internal data)
async function generateAdsInBackground(jobId, params) {
  try {
    const { competitorData, businessName, businessType, campaignName, campaignFocus, keyword } = params;
    
    // Build prompt using competitor data  
    const fullPrompt = `
You are a social media marketing assistant. Based on the following competitor image descriptions:

${competitorData.analyzedDescriptions?.map((desc, i) => `Ad ${i + 1}: ${desc}`).join('\n')} and captions: ${competitorData.competitorAds?.map((ad, i) => `Ad ${i + 1}: ${ad.body_text || ''}`).join('\n')}

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

    // Generate ideas with LLM (your existing logic)
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "meta-llama/llama-4-maverick:free",
      messages: [{
        role: "user",
        content: [{ type: "text", text: fullPrompt }]
      }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY2}`,
        "Content-Type": "application/json"
      }
    });

    const rawOutput = response.data?.choices?.[0]?.message?.content;
    let ideas = [];
    
    // Parse JSON (your existing parsing logic)
    try {
      let jsonString = rawOutput;
      const jsonMatch = rawOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      ideas = JSON.parse(jsonString.trim());
      
      if (!Array.isArray(ideas)) {
        throw new Error('Response is not an array');
      }
      
    } catch (e) {
      console.error('JSON parsing failed in background generation:', e.message);
      
      // Try fallback generation (your existing fallback logic)
      const fallbackPrompt = `Create 4 advertising ideas for a campaign by "${businessName}" in the "${businessType}" industry. The campaign is called "${campaignName}" and focuses on "${campaignFocus}". For each ad, provide:
- An image description prompt
- A matching social media caption with emojis and hashtags.
Respond with a valid JSON array in the format:[{ "image_prompt": "...", "caption": "..." }, ...]`;
      
      try {
        const fallbackRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: "meta-llama/llama-4-maverick:free",
          messages: [{              
            role: "user",
            content: [{ type: "text", text: fallbackPrompt }]
          }]
        }, {
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY2}`,
            "Content-Type": "application/json"
          }
        });
        
        const fallbackOutput = fallbackRes.data?.choices?.[0]?.message?.content;
        const fallbackJson = fallbackOutput.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0]; 
        ideas = fallbackJson ? JSON.parse(fallbackJson) : [];
        console.log("✅ Fallback ideas generated from metadata.");
        
      } catch (fallbackErr) {
        console.warn("❌ Fallback generation failed:", fallbackErr.message);
        ideas = [{
          image_prompt: `Campaign: ${campaignName}, Focus: ${campaignFocus}`,
          caption: `Exciting updates from ${businessName} in the ${businessType} industry! 🚀`
        }];
      }
    }

    // Generate images for each idea (your existing logic)
    const commonMetadata = {
      keyword,
      businessName,
      businessType,
      campaignName,
      campaignFocus,
      jobId // Add jobId to track this generation batch
    };

    const generationPromises = ideas.map(idea =>
      generateImageWithGPT(idea.image_prompt, idea.caption, commonMetadata)
    );

    const storedAds = (await Promise.all(generationPromises)).filter(Boolean);
    console.log(`✅ Background generation completed for job ${jobId}:`, storedAds.length, "ads");

  } catch (error) {
    console.error(`❌ Background generation failed for job ${jobId}:`, error.message);
  }
}

// Keep your existing generateImageWithGPT function unchanged

const generateImagewithFlux = async (image_prompt, caption, metadata) => {
  try {
    console.log("Generating image for prompt:", image_prompt.substring(0, 50) + "...");
    
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
      console.log("No image generated for prompt");
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
    console.log("Saved ad to database");
    return ad;
  } catch (err) {
    console.error(`Image generation failed for prompt: "${image_prompt.substring(0, 50)}..."`, err.message);
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