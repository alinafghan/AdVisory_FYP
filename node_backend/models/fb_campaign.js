const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  objective: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"],
  },
  special_ad_categories: {
    type: [String], // Array since Facebook allows multiple categories
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FB_campaign", campaignSchema);
