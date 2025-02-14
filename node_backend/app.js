const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const cors = require("cors"); //middleware for working w angular frontend
const connectDB = require("./config/db.config");

//ROUTERS
const predictionRouter = require("./routes/BudgetModelRoute"); // Import the prediction route
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");
const authRouter = require("./routes/authRouter");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

//ROUTES
// /predict is the prediction router
app.use("/auth", authRouter);
app.use("/predict", predictionRouter);
app.use("/user", userRouter);
app.use("/predict", predictionRouter);
app.use("/trends", trendsRoutes); // ✅ Now trendsRoutes is properly imported

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
