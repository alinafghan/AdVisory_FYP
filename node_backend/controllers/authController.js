const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/user_model");
const FB_user = require("../models/facebook_user_model");

// Register a new user with additional business details
const register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    firstName,
    businessName,
    businessType,
    businessLogo,
  } = req.body;
  console.log(req.body);

  const id = Math.floor(Math.random() * 1000000000); // 💡 random number

  try {
    // Check if the required fields are provided
    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !businessName ||
      !businessType
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists by username or email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(404).json({
        message: "This username or email already exists, please try another.",
      });
    }

    // Decode the base64 image
    //const businessLogoBuffer = Buffer.from(businessLogo.split(',')[1], 'base64'); // Remove data URL prefix and decode

    // Optionally, save the logo to a file or cloud storage, here we're saving it locally
    //const logoPath = `uploads/${Date.now()}_business_logo.png`;
    //fs.writeFileSync(logoPath, businessLogoBuffer)

    // Create a new user
    const user = new User({
      username,
      id,
      email,
      password,
      firstName,
      businessName,
      businessType,
      businessLogo,
    });

    // Save the user to the database
    await user.save();
    res.json({ message: "Registration successful" });
  } catch (error) {
    next(error);
  }
};

// Login with an existing user
const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

// Facebook login
const APP_ID = "541525585715121";
const APP_SECRET = "35f28757da55d50d9de2a04e059e1d75";
const REDIRECT_URI = "http://localhost:3000/auth/facebook/callback";

const fblogin = (req, res) => {
  const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email`;
  return res.redirect(url);
};

// Facebook callback function
const fbcallback = async (req, res) => {
  if (!req.query.code) {
    return res.status(400).json({ message: "Authorization code not provided" });
  }

  try {
    const { code } = req.query;

    // Exchange code for an access token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v18.0/oauth/access_token`,
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user profile from Facebook
    const profileResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
    );

    const profile = profileResponse.data;

    // Check if user already exists in database
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // If user does not exist, create a new one
      user = new FB_user({
        username: profile.name,
        email: profile.email,
        facebookId: profile.id,
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.redirect(`http://localhost:4200/login?token=${token}`);
  } catch (error) {
    console.error(
      "Facebook OAuth Error:",
      error.response?.data || error.message
    );
    res.redirect("http://localhost:4200/login?error=facebook_auth_failed");
  }
};

module.exports = { register, login, fblogin, fbcallback };
