require("dotenv").config(); // Load .env
const mongoose = require("mongoose");
const User = require("./models/user_model"); // adjust path if needed

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Create a new user
    const newUser = new User({
      username: "ayesha",
      id: "123456",
      email: "ayesha@gmail.com",
      password: "Ayesha123!", // Will be hashed automatically
      role: "user",
    });

    await newUser.save();
    console.log("🎉 User created successfully!");

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
