// controllers/userController.js
const User = require("../models/user_model");

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // const user = await User.findById(userId).select("-password"); // exclude password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getCurrentUser };
