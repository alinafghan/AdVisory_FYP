const express = require("express");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const predictionRouter = require("./routes/BudgetModelRoute"); // Import the prediction route

const app = express();

// /predict is the prediction router
app.use("/predict", predictionRouter);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
