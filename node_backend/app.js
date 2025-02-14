require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const cors = require("cors"); //middleware for working w angular frontend

//ROUTERS
const predictionRouter = require("./routes/BudgetModelRoute"); // Import the prediction route
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");

//DB CONFIG
// const dbConfig = require("./config/db.config"); //this will work in place of mongoURI in case db connection string not working, but USE UR OWN STRING IN A .ENV FILE
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

////////////////////////////////////////////////////////////////////////////////////

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

//ROUTES
// /predict is the prediction router
app.use("/predict", predictionRouter);
// //login router WIP
// app.use("/login", userRouter);
app.use("/user", userRouter);

//db testing only DELETE LATER
app.get("/test", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping(); // Check if DB is connected
    res.json({ message: "✅ Database connection is working!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "❌ Database connection failed", details: error.message });
  }
});
// Routes
app.use("/predict", predictionRouter);
app.use("/trends", trendsRoutes); // ✅ Now trendsRoutes is properly imported

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
