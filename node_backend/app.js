// const express = require("express");
// const fs = require("fs");
// const path = require("path");

// const app = express();

// // Routing path
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// // Start the server
// app.listen(3000, () => {
//   console.log("Server started on port 3000");
// });

const express = require("express");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const app = express();

// Define the route to call the REST API
app.get("/", async (req, res) => {
  try {
    // Input data that you want to send to the Python REST API for prediction
    const inputData = [1.0, 2.0, 3.0, 4.0]; // Adjust based on your model's expected input

    // Make the request to your Python REST API (Flask server)
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

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
