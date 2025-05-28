const express = require('express');
const { ApifyClient } = require('apify-client');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const APIFY_TOKEN = process.env.APIFY_API_TOKEN2;
const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_METADATA = path.join(CACHE_DIR, 'cache_metadata.json');

// Ensure cache directory and metadata file exist
fs.ensureDirSync(CACHE_DIR);
if (!fs.existsSync(CACHE_METADATA)) {
  fs.writeJsonSync(CACHE_METADATA, { keywords: {}, images: {} }, { spaces: 2 });
}

const client = new ApifyClient({ token: APIFY_TOKEN });

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
  return patterns.flatMap(p => text.match(p) || []);
}

// Download image and save locally
async function downloadImage(url, filepath) {
  try {
    const res = await axios({ url, responseType: 'stream' });
    await fs.ensureFile(filepath);
    await new Promise((resolve, reject) => {
      res.data.pipe(fs.createWriteStream(filepath)).on('finish', resolve).on('error', reject);
    });
    return true;
  } catch {
    return false;
  }
}

router.post('/scrape-facebook-ads', async (req, res) => {
  const { keyword } = req.body;
  console.log(req.body);
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  try {
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&is_targeted_country=false&media_type=all&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;

    const run = await client.actor('XtaWFhbtfxyzqrFmd').call({
      urls: [{ url: searchUrl }],
      count: 100,
      'scrapePageAds.activeStatus': 'all',
      period: ''
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const cacheData = fs.readJsonSync(CACHE_METADATA);
    if (!cacheData.keywords[keyword]) {
      cacheData.keywords[keyword] = { timestamp: new Date().toISOString(), ads: [] };
    }


    const ads = [];

   let count = 0;
for (const item of items) {
  if (count >= 10) break;

  const snap = item.snapshot || {};
  const bodyText = snap.body?.text || '';
  const pageName = snap.page_name || '';
  const pageCategories = snap.page_categories || [];

  const wordCount = bodyText.split(/\s+/).length;

  // FILTER CONDITIONS
  if (
    pageName === 'Random Reading' ||
    pageCategories.some(c => /movie|book/i.test(c)) ||
    wordCount > 300
  ) {
    continue;
  }
  

  const images = snap.images || [];
  const adId = uuidv4();
  const imageDir = path.join(CACHE_DIR, 'images', keyword);
  fs.ensureDirSync(imageDir);
  if (!images.length) {
  console.warn(`No images found for ad: ${pageName}`);
  continue; // Optional: skip ad if no images
  }
  console.log("snap.images:", snap.images);

  const imageInfos = await Promise.all(
    images.map(async (img, i) => {
      const imgUrl = img.original_image_url;
      const filename = `${adId}_${i}_${Date.now()}.jpg`;
      const filepath = path.join(imageDir, filename);
      const success = await downloadImage(imgUrl, filepath);
      return success ? { id: uuidv4(), url: imgUrl, local_path: filepath, filename, ad_id: adId, timestamp: new Date().toISOString() } : null;
    })
  );

  const filteredImages = imageInfos.filter(Boolean);
  filteredImages.forEach(img => {
    cacheData.images[img.id] = img;
  });

  const ad = {
    id: adId,
    page_name: pageName,
    page_categories: pageCategories,
    body_text: bodyText,
    social_links: extractSocialLinks(bodyText),
    page_profile_picture_url: snap.page_profile_picture_url || '',
    images: filteredImages
  };

  cacheData.keywords[keyword].ads.push(ad);
  ads.push(ad);
  count++;
}


    // fs.writeJsonSync(CACHE_METADATA, cacheData, { spaces: 2 });
    res.json({ success: true, keyword, processed_ads_count: ads.length, ads });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to scrape ads' });
  }
});

module.exports = router;