const express = require("express");
const bodyParser = require("body-parser"); // While express has built-in, you might have reasons for this
const cors = require("cors");
const connectDB = require("./config/db.config");
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");
const authRouter = require("./routes/authRouter");
const adRouter = require("./routes/adsRouter");
const budgetRouter = require("./routes/budgetRouter");
const adImageRouter = require("./routes/adImageRouter");
const audienceRouter = require("./routes/audienceRouter");
const AdModel = require("./models/ad_model");
const AdImageModel = require("./models/ad_image_model");
const mongoose = require("mongoose");
const app = express();

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

app.use("/ads", adRouter);
app.use("/budget", budgetRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/trends", trendsRoutes);
app.use("/adImages", adImageRouter);
app.use("/api", audienceRouter);

// Log all defined routes
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly
        console.log("Route:", middleware.route.path, middleware.route.stack[0].method);
    } else if(middleware.handle.stack){ // router middleware
        middleware.handle.stack.forEach(function(handler){
            route = handler.route;
            if(route){
                console.log("Route (via middleware):", route.path, route.stack[0].method);
            }
        });
    }
});

// Debug Routes (Consider removing or commenting out in production)
app.get('/debug/checkadimage/:adImageId', async (req, res) => {
    const adImageIdToCheck = req.params.adImageId;
    try {
        const adImage = await AdImageModel.findById(adImageIdToCheck);
        res.json({ adImage });
    } catch (error) {
        console.error('Error checking AdImage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/debug/checkadbycampaign/:campaignId', async (req, res) => {
    const campaignIdToCheck = req.params.campaignId;
    try {
        const ad = await AdModel.findOne({ campaignId: campaignIdToCheck });
        res.json({ ad });
    } catch (error) {
        console.error('Error checking Ad by campaignId:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/api/test", (req, res) => {
    res.send("API test endpoint works!");
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});