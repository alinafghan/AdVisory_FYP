const mongoose = require('mongoose');

const AdIdeaSchema = new mongoose.Schema({
  keyword: String,
  businessName: String,
  businessDomain: String,
  campaignName: String,
  imagePrompt: String,
  caption: String,
  imageBase64: String, // or store URL if you save locally
  createdAt: Date
});

module.exports = mongoose.model('AdIdea', AdIdeaSchema);
