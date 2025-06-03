const express = require("express");
const { ApifyClient } = require("apify-client");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const CACHE_DIR = path.join(__dirname, "../cache");
const CACHE_METADATA = path.join(CACHE_DIR, "cache_metadata.json");
const client = new ApifyClient({ token: APIFY_TOKEN });

fs.ensureDirSync(CACHE_DIR);
if (!fs.existsSync(CACHE_METADATA)) {
  fs.writeJsonSync(CACHE_METADATA, { keywords: {}, images: {} }, { spaces: 2 });
}
const loggedPages = new Set();

// Extract social links from ad body text
function extractSocialLinks(text) {
  if (!text) return [];
  const patterns = [
    /https?:\/\/(?:www\.)?facebook\.com\/\S+/g,
    /https?:\/\/(?:www\.)?instagram\.com\/\S+/g,
    /https?:\/\/(?:www\.)?twitter\.com\/\S+/g,
    /https?:\/\/(?:www\.)?linkedin\.com\/\S+/g,
    /https?:\/\/(?:www\.)?tiktok\.com\/\S+/g,
  ];
  return patterns.flatMap((p) => text.match(p) || []);
}

// Download image and save locally
async function downloadImage(url, filepath) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filepath, response.data);
    return true;
  } catch (err) {
    console.warn("Image download failed:", err.message);
    return false;
  }
}

// Helper: Process images for a single ad
async function processAdImages(ad, outputFolder) {
  const pageName = ad.page_name || "Unknown Page";
  const adId = ad.ad_id || uuidv4();
  const imageDir = path.join(outputFolder, adId);

  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

  const images = ad.images || [];
  if (!images.length) {
    if (!loggedPages.has(pageName)) {
      console.warn(`⚠️ No image array found for ad: ${pageName}`);
      loggedPages.add(pageName);
    }
    return [];
  }

  const imageInfos = await Promise.all(
    images.map(async (img, i) => {
      const imgUrl = img.resized_image_url || img.original_image_url;
      if (!imgUrl) {
        console.warn(`⛔ Skipping image ${i} for ${pageName}: no usable URL`);
        return null;
      }

      const filename = `${adId}_${i}_${Date.now()}.jpg`;
      const filepath = path.join(imageDir, filename);

      const success = await downloadImage(imgUrl, filepath);
      if (!success) {
        console.warn(`❌ Download failed for image: ${imgUrl}`);
        return null;
      }

      return {
        id: uuidv4(),
        ad_id: adId,
        page_name: pageName,
        url: imgUrl,
        filename,
        local_path: filepath,
        timestamp: new Date().toISOString(),
      };
    })
  );

  const validImages = imageInfos.filter(Boolean);

  if (!validImages.length && !loggedPages.has(pageName)) {
    console.warn(`⚠️ No valid images could be downloaded for ad: ${pageName}`);
    loggedPages.add(pageName);
  }

  return validImages;
}

router.post("/scrape-facebook-ads", async (req, res) => {
  const { keyword } = req.body;
  console.log(req.body);
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  try {
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&is_targeted_country=false&media_type=all&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;

    const run = await client.actor("XtaWFhbtfxyzqrFmd").call({
      urls: [{ url: searchUrl }],
      count: 100,
      "scrapePageAds.activeStatus": "all",
      period: "",
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const cacheData = fs.readJsonSync(CACHE_METADATA);
    if (!cacheData.keywords[keyword]) {
      cacheData.keywords[keyword] = {
        timestamp: new Date().toISOString(),
        ads: [],
      };
    }

    const ads = [];
    let count = 0;

    for (const item of items) {
      if (count >= 10) break;

      const snap = item.snapshot || {};
      const bodyText = snap.body?.text || "";
      const pageName = snap.page_name || "";
      const pageCategories = snap.page_categories || [];
      const wordCount = bodyText.split(/\s+/).length;

      // Extract images from cards array instead of images field
      const cards = snap.cards || [];
      const images = cards
        .map((card) => ({
          original_image_url: card.original_image_url,
          resized_image_url: card.resized_image_url,
          watermarked_resized_image_url: card.watermarked_resized_image_url,
          image_crops: card.image_crops || [],
        }))
        .filter((img) => img.original_image_url || img.resized_image_url);

      console.log(`\n🔍 Processing ad from: ${pageName}`);
      console.log(`📝 Body text length: ${wordCount} words`);
      console.log(`🃏 Cards found: ${cards.length}`);
      console.log(`📷 Images extracted: ${images.length}`);
      console.log(`🏷️ Categories: ${pageCategories.join(", ")}`);

      // FILTER CONDITIONS - Check each condition separately for better debugging
      let skipReason = null;

      if (pageName === "Random Reading") {
        skipReason = "Filtered out: Random Reading page";
      } else if (
        pageCategories.some((c) =>
          /movie|book|film|书籍|書籍|剧集|电影|娱乐网站/i.test(c)
        )
      ) {
        skipReason = "Filtered out: Movie/Book/Entertainment category";
      } else if (wordCount > 300) {
        skipReason = "Filtered out: Text too long (>300 words)";
      } else if (!images.length) {
        skipReason = "Filtered out: No images available";
      }

      if (skipReason) {
        console.log(`❌ ${skipReason}`);
        continue;
      }

      console.log(`✅ Ad passed filters, processing images...`);
      if (images.length > 0) {
        console.log(
          "First few images:",
          JSON.stringify(images.slice(0, 2), null, 2)
        );
      }

      // Create ad object
      const ad = {
        ad_id: uuidv4(),
        page_name: pageName,
        page_categories: pageCategories,
        body_text: bodyText,
        social_links: extractSocialLinks(bodyText),
        page_profile_picture_url: snap.page_profile_picture_url || "",
        cards: cards, // Include original cards data
        images: images, // Use extracted images
      };

      // Process images
      const imageDir = path.join(CACHE_DIR, "images", keyword);
      fs.ensureDirSync(imageDir);

      const processedImages = await processAdImages(ad, imageDir);

      if (!processedImages.length) {
        console.log(
          `⚠️ No images could be processed for ${pageName}, skipping ad`
        );
        continue;
      }

      console.log(`📸 Successfully processed ${processedImages.length} images`);

      // Save image metadata
      processedImages.forEach((img) => {
        cacheData.images[img.id] = img;
      });

      // Create final ad object
      const finalAd = { ...ad, images: processedImages };
      cacheData.keywords[keyword].ads.push(finalAd);
      ads.push(finalAd);
      count++;

      console.log(`✅ Ad #${count} successfully processed`);
    }

    // Save cache data
    fs.writeJsonSync(CACHE_METADATA, cacheData, { spaces: 2 });

    console.log(
      `\n🎯 Summary: Processed ${ads.length} ads out of ${items.length} total items`
    );
    res.json({ success: true, keyword, processed_ads_count: ads.length, ads });
  } catch (err) {
    console.error("❌ Error during scraping:", err);
    res.status(500).json({ error: "Failed to scrape ads" });
  }
});

module.exports = router;
