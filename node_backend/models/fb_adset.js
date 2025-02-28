const mongoose = require("mongoose");

const FBAdSetSchema = new mongoose.Schema(
  {
    adset_id: { type: String, required: true, unique: true }, // Facebook Ad Set ID
    name: { type: String, required: true },
    campaign_id: { type: String, required: true }, // Associated Campaign ID
    daily_budget: { type: Number, required: true },
    billing_event: { type: String, default: "IMPRESSIONS" }, // Default to Impressions
    optimization_goal: { type: String, default: "REACH" },
    targeting: { type: Object, required: true }, // Stores targeting JSON
    status: { type: String, default: "PAUSED" }, // Default status
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("FBAdSet", FBAdSetSchema);
