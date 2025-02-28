const mongoose = require("mongoose");

const FB_AdCreativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  page_id: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  caption: { type: String, required: false },
  picture: { type: String, required: false },
  call_to_action: { type: String, required: false },
  fb_creative_id: { type: String, unique: true }, // Stores Facebook Ad Creative ID
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FB_AdCreative", FB_AdCreativeSchema);
