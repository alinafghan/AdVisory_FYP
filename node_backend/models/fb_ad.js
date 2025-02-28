const mongoose = require("mongoose");

const FB_AdSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adset_id: { type: String, required: true },
  creative_id: { type: String, required: true },
  status: { type: String, enum: ["ACTIVE", "PAUSED"], default: "ACTIVE" },
  fb_ad_id: { type: String, unique: true }, // Stores Facebook Ad ID
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FB_Ad", FB_AdSchema);
