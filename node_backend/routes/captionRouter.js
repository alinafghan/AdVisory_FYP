const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this ad image and summarize only the key elements relevant for marketing inspiration. Focus on:

- The main product or theme
- The target audience (if apparent)
- Visual style and layout
- Emotional tone or mood
- Any standout promotional hooks (like price tags, keywords, or slogans)

Return a short, 2–3 sentence summary. Do not include unnecessary details, repetitive price listings, or long catalogs. Prioritize what makes this ad engaging or successful.`},
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!data || !data.choices) {
  console.error("OpenRouter response missing expected fields:", JSON.stringify(data, null, 2));
}

    res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});


// 📢 New: Generate SEO Caption from image/text
router.post('/generate-caption', async (req, res) => {
  try {
    const { imageUrl, imageBase64, textPrompt } = req.body;

    const content = [];

    if (imageUrl) {
      content.push({ type: "text", text: "Write a creative SEO-optimized caption for this image with relevant hashtags and emojis. Just give me the caption, no explanation" });
      content.push({ type: "image_url", image_url: { url: imageUrl } });
    } else if (imageBase64) {
      content.push({ type: "text", text: "Write a creative SEO-optimized caption for this base64 image with relevant hashtags and emojis. Just give me the caption, no explanation" });
      content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } });
    } else if (textPrompt) {
      content.push({ type: "text", text: textPrompt });
      content.push({ type: "text", text: "Write an SEO-optimized caption for social media including relevant hashtags and emojis. Just give me the caption, no explanation" });
    } else {
      return res.status(400).json({ error: "You must provide either imageUrl, imageBase64, or textPrompt." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages: [{ role: "user", content }]
      })
    });

    const result = await response.json();

    const caption = result.choices?.[0]?.message?.content || "No caption generated.";
    res.json({ caption });

  } catch (error) {
    console.error("Error generating caption:", error);
    res.status(500).json({ error: "Failed to generate caption." });
  }
});

module.exports = router;
