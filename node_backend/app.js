const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const cors = require("cors"); //middleware for working w angular frontend
const connectDB = require("./config/db.config");

//ROUTERS
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");
const authRouter = require("./routes/authRouter");
const adRouter = require("./routes/adsRouter");
const budgetRouter = require("./routes/budgetRouter");
const adImageRouter = require("./routes/adImageRouter"); // Add the new ad image router
const image_routes= require("./routes/imageRoute") //product ad
const caption_router = require("./routes/captionRouter");
const competitorAdsRouter = require("./routes/competitorAdsRouter");
const generateInspiredAdsRouter = require("./routes/generateInspiredAdsRouter");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increase payload limit for image data
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true, // Allow sending cookies (if needed)
  })
);
app.use(express.json({ limit: "500mb" })); // Increase body size limit for JSON payload
app.use(express.urlencoded({ limit: "500mb", extended: true })); // Increase body size limit for form data
console.log("Its working");
//ROUTES
// /predict is the prediction router
app.use("/ads", adRouter);
app.use("/budget", budgetRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/trends", trendsRoutes);
app.use("/adImages", adImageRouter); // Add the new route for ad images
app.use('/api/image', image_routes); // Product-ad
app.use('/caption', caption_router); // Caption generation
app.use("/competitor-ads", competitorAdsRouter); // Competitor ads scraping
app.use("/generate-inspired-ads", generateInspiredAdsRouter); // Inspired ads generation

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
