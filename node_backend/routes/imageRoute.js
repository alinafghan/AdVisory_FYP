// routes/image_routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const {
    getAdImagesForCampaign,
    getAdImageById,
    deleteAdImage,addAdImage
  } = require("../controllers/ad_image_controller");

const FLASK_API_URL = 'http://localhost:5000'; // Your Flask server URL

const storage = multer.memoryStorage();
const upload = multer({ storage });

const handlePythonApiError = (error, res) => {
    console.error('Python API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
        error: 'Error processing image',
        details: error.response?.data || error.message
    });
};

router.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('image', req.file.buffer, req.file.originalname);

        const response = await axios.post(`${FLASK_API_URL}/remove-bg`, formData, {
            headers: formData.getHeaders(),
            responseType: 'arraybuffer',
        });

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        handlePythonApiError(error, res);
    }
});

//custombackground generation
// Route for image generation
router.post('/generate', async (req, res) => {
    try {
        // Get the data (prompt, negative_prompt, width, height) from the request body
        const { prompt, negative_prompt, width, height } = req.body;

        // Prepare the payload to send to the Flask API
        const payload = {
            prompt: prompt || '',
            negative_prompt: negative_prompt || '',
            width: width || 512,  // Default width
            height: height || 512,  // Default height
        };

        // Call the Flask API for image generation
        const response = await axios.post(`${FLASK_API_URL}/generate`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // If the Flask response contains base64-encoded image(s)
        if (response.data.images) {
            // Send the base64-encoded image(s) back to the frontend
            return res.json({ images: response.data.images });
        } else {
            return res.status(500).json({ error: 'No images returned from Flask API' });
        }
    } catch (error) {
        handlePythonApiError(error, res);
    }
});
// post an ad to a campaign
router.post("/campaign/:campaignId", addAdImage);
// Get all ad images for a campaign
router.get("/campaign/:campaignId", getAdImagesForCampaign);

// Get a specific ad image
router.get("/:imageId", getAdImageById);

//delete an ad

router.delete("/:imageId", deleteAdImage);

module.exports = router;
