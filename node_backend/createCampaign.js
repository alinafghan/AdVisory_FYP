require("dotenv").config();
const mongoose = require("mongoose");
const Campaign = require("./models/campaign_model"); // adjust path if needed

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Create a new campaign
    const newCampaign = new Campaign({
      campaignId: "camp123",
      campaignName: "April Awareness Campaign",
      duration: "2025-04-15 to 2025-06-15",
      platform: "Instagram",
      industry: "Fashion",
      businessId: "67fed46a8ec968f1c324eb50", // ⬅️ Replace this with the actual user _id from your users collection
    });

    return newCampaign.save();
  })
  .then((saved) => {
    console.log("✅ Campaign saved:", saved);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    mongoose.disconnect();
  });
