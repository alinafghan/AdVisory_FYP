const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors"); 
const predictionRouter = require("./routes/BudgetModelRoute"); 
const trendsRoutes = require("./routes/TrendsModelRoute"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/predict", predictionRouter);
app.use("/trends", trendsRoutes); // ✅ Now trendsRoutes is properly imported

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
