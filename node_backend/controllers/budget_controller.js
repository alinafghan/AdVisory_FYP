const axios = require("axios");
const Ad = require("../models/ad_image_model"); // Adjust the path as necessary

const getPrice = async (req, res) => {
  try {
    const { totalBudget, campaignId } = req.body;

    if (!totalBudget) {
      return res.status(400).json({ error: "Total budget is required" });
    }
    if (!campaignId) {
      return res.status(400).json({ error: "Campaign ID is required" });
    }

    const adsData = await Ad.find({ campaignId });

    if (!adsData.length) {
      return res.status(404).json({ error: "No ad data found" });
    }

    // Call the Python optimization endpoint to get the x_opt (budgets)
    const response = await axios.post("http://127.0.0.1:5000/allocate", {
      n_ads: adsData.length,
      budget: totalBudget,
      conversions: adsData.map((ad) => ad.conversions), // Assuming conversions are available in the Ad model
    });

    // Extract x_opt from Python response
    const x_opt = response.data.x_opt;

    if (!x_opt || x_opt.length !== adsData.length) {
      return res
        .status(500)
        .json({ error: "Invalid response from Python optimization" });
    }

    // Return the optimal budgets (x_opt) in the same format
    const allocatedBudgets = adsData.map((ad, index) => ({
      adId: ad._id, // Assuming ad has an '_id' field
      adCaption: ad.caption, // Assuming ad has a 'caption' field
      adImageData: ad.imageData, // Assuming ad has an 'imageData' field
      industry: ad.industry, // Assuming ad has an 'industry' field
      platform: ad.platform, // Assuming ad has a 'platform' field
      allocatedBudget: x_opt[index], // Use the corresponding x_opt value
    }));

    res.status(200).json(allocatedBudgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getPrice };
