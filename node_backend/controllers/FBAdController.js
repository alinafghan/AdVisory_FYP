const axios = require("axios");
const qs = require("qs"); // Import QueryString module
const FB_campaign = require("../models/fb_campaign");
const FB_adset = require("../models/fb_adset");
const FB_Ad = require("../models/fb_ad");

const createCampaign = async (req, res, next) => {
  const AD_ACC_ID = process.env.AD_ACC_ID;
  const url = `https://graph.facebook.com/v22.0/${AD_ACC_ID}/campaigns`;

  // Convert campaign data to x-www-form-urlencoded format
  const campaignData = qs.stringify({
    name: req.body.name,
    objective: req.body.objective,
    status: req.body.status,
    special_ad_categories: req.body.special_ad_categories || [],
    access_token: process.env.ACCESS_TOKEN, // Add access token here
  });

  try {
    const response = await axios.post(url, campaignData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      },
    });

    const campaign_id = response.data.id;

    // Save campaign in DB after successful creation
    const campaign = new FB_campaign({ ...req.body, campaign_id });
    await campaign.save();

    res.status(201).json({ campaign_id });
    console.log("✅ Successfully created campaign:", campaign_id);
  } catch (error) {
    console.error(
      "❌ Error creating campaign:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

const createAdSet = async (req, res, next) => {
  const AD_ACC_ID = process.env.AD_ACC_ID;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const BEARER_TOKEN = process.env.BEARER_TOKEN;

  const url = `https://graph.facebook.com/v22.0/${AD_ACC_ID}/adsets`;

  // Convert Ad Set data to x-www-form-urlencoded format
  const adSetData = qs.stringify({
    name: req.body.name,
    campaign_id: req.body.campaign_id,
    daily_budget: req.body.daily_budget,
    bid_amount: req.body.bid_amount,
    billing_event: req.body.billing_event || "IMPRESSIONS", // Default if not provided
    optimization_goal: req.body.optimization_goal || "REACH", // Default if not provided
    targeting: JSON.stringify(
      req.body.targeting || { geo_locations: { countries: ["US"] } }
    ), // Default targeting
    status: req.body.status || "PAUSED",
    access_token: ACCESS_TOKEN,
  });

  try {
    const response = await axios.post(url, adSetData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    const adset_id = response.data.id;

    const adSet = new FB_adset({ ...req.body, adset_id });
    await adSet.save();

    res.status(201).json({ adset_id });
    console.log("✅ Successfully created Ad Set:", adset_id);
  } catch (error) {
    console.error(
      "❌ Error creating Ad Set:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

const createAd = async (req, res, next) => {
  const AD_ACC_ID = process.env.AD_ACC_ID;
  const url = `https://graph.facebook.com/v22.0/${AD_ACC_ID}/ads`;

  // Prepare ad data for Facebook API
  const adData = qs.stringify({
    name: req.body.name,
    adset_id: req.body.adset_id,
    creative: JSON.stringify({ creative_id: req.body.creative_id }),
    status: req.body.status || "ACTIVE",
    access_token: process.env.ACCESS_TOKEN,
  });

  try {
    const response = await axios.post(url, adData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      },
    });

    const fb_ad_id = response.data.id;

    // Save the created ad in MongoDB
    const newAd = new FB_Ad({ ...req.body, fb_ad_id });
    await newAd.save();

    res.status(201).json({ fb_ad_id });
    console.log("✅ Successfully created ad:", fb_ad_id);
  } catch (error) {
    console.error(
      "❌ Error creating ad:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

const createAdCreative = async (req, res, next) => {
  const AD_ACC_ID = process.env.AD_ACC_ID;
  const url = `https://graph.facebook.com/v22.0/${AD_ACC_ID}/adcreatives`;

  // Prepare ad creative data for Facebook API
  const creativeData = qs.stringify({
    name: req.body.name,
    object_story_spec: JSON.stringify({
      page_id: req.body.page_id,
      link_data: {
        message: req.body.message,
        link: req.body.link,
        caption: req.body.caption || "",
        picture: req.body.picture || "",
        call_to_action: {
          type: req.body.call_to_action || "SHOP_NOW",
        },
      },
    }),
    access_token: process.env.ACCESS_TOKEN,
  });

  try {
    const response = await axios.post(url, creativeData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,

        "X-FB-Debug": "true",
      },
    });

    const fb_creative_id = response.data.id;

    // Save the created ad creative in MongoDB
    const newCreative = new FB_AdCreative({ ...req.body, fb_creative_id });
    await newCreative.save();

    res.status(201).json({ fb_creative_id });
    console.log("✅ Successfully created ad creative:", fb_creative_id);
  } catch (error) {
    console.error(
      "❌ Error creating ad creative:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

module.exports = { createCampaign, createAdSet, createAd, createAdCreative };
