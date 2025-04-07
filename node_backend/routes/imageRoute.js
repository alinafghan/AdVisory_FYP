// routes/image_routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

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

module.exports = router;
