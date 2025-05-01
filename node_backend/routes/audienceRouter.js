// audience.routes.js
const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audience_controller'); 

router.get('/analyze-audience/:adId', audienceController.analyzeAudience);

module.exports = router;