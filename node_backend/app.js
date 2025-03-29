const express = require("express");
const fetch = require("node-fetch"); // Import node-fetch to make HTTP requests
const predictionRouter = require("./routes/BudgetModelRoute"); // Import the prediction route
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");
const authRouter = require("./routes/authRouter");
const adRouter = require("./routes/adsRouter");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true, // Allow sending cookies (if needed)
  })
);
console.log("Its working");
//ROUTES
// /predict is the prediction router
app.use("/ads", adRouter);
app.use("/auth", authRouter);
app.use("/predict", predictionRouter);
app.use("/user", userRouter);
app.use("/predict", predictionRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
