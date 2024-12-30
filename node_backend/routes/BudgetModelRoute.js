const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Define the route to call the Python Flask API
router.get("/", async (req, res) => {
  try {
    // Input data for prediction (could be dynamic based on request)
    const inputData = [
      1, 1, 1, 1, 1.0, 1.0, 1, 1, 1.0, 1.0, 1, 1, 1.0, 2023, 12, 25, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ];

    // Make the request to the Python REST API (Flask server)
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: inputData }),
    });

    const data = await response.json();

    if (data.prediction) {
      res.send(`Prediction from Flask API: ${data.prediction}`);
    } else {
      res.status(500).send("Error in getting prediction.");
    }
  } catch (error) {
    res.status(500).send("Error calling Python REST API: " + error.message);
  }
});

module.exports = router;
