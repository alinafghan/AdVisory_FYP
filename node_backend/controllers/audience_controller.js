const AdImageModel = require("../models/ad_image_model");
const axios = require("axios");

exports.analyzeAudience = async (req, res) => {
  const adImageId = req.params.adId; // This is the _id of the AdImage

  try {
    const adImage = await AdImageModel.findById(adImageId);
    if (!adImage || !adImage.imageData) {
      return res
        .status(404)
        .json({ message: "Ad image not found or image data missing" });
    }

    const imageData = adImage.imageData; // Base64 encoded image data

    // Send the base64 image data to your Flask API
    const flaskApiResponse = await axios.post(
      "http://localhost:5000/analyze",
      {
        image_data: imageData, // Assuming your Flask endpoint expects 'image_data'
      }
    );

    if (!flaskApiResponse.data) {
      return res
        .status(500)
        .json({ error: "Failed to get analysis from Flask API" });
    }

    // Send the analysis report back to the frontend
    res.status(200).json(flaskApiResponse.data);
  } catch (error) {
    console.error("Error analyzing audience:", error);
    res
      .status(500)
      .json({ error: "Internal server error during analysis" });
  }
};
