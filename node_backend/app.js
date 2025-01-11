const express = require("express");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const predictionRouter = require("./routes/BudgetModelRoute"); // Import the prediction route
const cors = require("cors"); //middleware for working w angular frontend

const app = express();
app.use(cors());
app.use(express.json());

// /predict is the prediction router
app.use("/predict", predictionRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
