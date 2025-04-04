const express = require("express");
const cors = require('cors');
const fetch = require("node-fetch");
const predictionRouter = require("./routes/BudgetModelRoute");
const userRouter = require("./routes/UserRouter");
const trendsRoutes = require("./routes/TrendsModelRoute");
const authRouter = require("./routes/authRouter");
const adRouter = require("./routes/adsRouter");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,  // Allow sending cookies (if needed)
  })
);

console.log("Its working");

// Routes setup
app.use("/ads", adRouter);
app.use("/auth", authRouter);
app.use("/predict", predictionRouter);
app.use("/user", userRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
