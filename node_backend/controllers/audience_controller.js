// audience_controller.js
const AdImageModel = require("../models/ad_image_model");
const axios = require("axios");

exports.analyzeAudience = async (req, res) => {
  const adImageId = req.params.adId;
  const getXaiReport = req.query.xai === 'true'; // Check for ?xai=true in the URL

  try {
    const adImage = await AdImageModel.findById(adImageId);
    if (!adImage || !adImage.imageData) {
      return res
        .status(404)
        .json({ message: "Ad image not found or image data missing" });
    }

    const imageData = adImage.imageData; // Base64 encoded image data
    let flaskApiResponse;

    if (getXaiReport) {
        console.log(`Sending image for XAI analysis to Flask for ad ID: ${adImageId}`);
        flaskApiResponse = await axios.post(
            "http://localhost:5000/analyze-xai", // New XAI endpoint in Flask
            { image_data: imageData }
        );
    } else {
        console.log(`Sending image for standard analysis to Flask for ad ID: ${adImageId}`);
        flaskApiResponse = await axios.post(
            "http://localhost:5000/analyze", // Original standard analysis endpoint
            { image_data: imageData }
        );
    }

    if (!flaskApiResponse.data) {
      return res
        .status(500)
        .json({ error: "Failed to get analysis from Flask API" });
    }

    res.status(200).json(flaskApiResponse.data);
  } catch (error) {
    console.error("Error analyzing audience:", error.response ? error.response.data : error.message);
    res
      .status(500)
      .json({ error: "Internal server error during analysis", details: error.response ? error.response.data : error.message });
  }
};