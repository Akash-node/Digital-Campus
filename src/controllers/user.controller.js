const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateToken } = require("../utils/generateJwtToken");

//--------------Registration-----------------------

const userRegistration = async (req, res) => {
  try {
    const { fullName, email, password, age, gender } = req.body;

    if (!fullName || !email || !password || !age || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Default profile image
    let profileUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // If user uploaded an image
    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path);
      profileUrl = uploadRes?.secure_url || profileUrl;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      age,
      gender,
      profileUrl,
    });

    // remove password from response
    const { password: _, ...userData } = newUser.toObject();

    //Generate Jwt token
    const JwtToken = generateToken(userData._id);

    res.cookie("JwtToken", JwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // deploy pe true
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: "user created successfully",
      userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

//--------------Registration-----------------------

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validUser = await userModel.findOne({ email });
    if (!validUser) {
      return res.status(400).json({ message: "User not exist" });
    }
    const isPasswordValid = await bcrypt.compare(password, validUser.password);
    if (!isPasswordValid) {
      return res.status(402).json({ message: "Invalid Credential" });
    }
    // remove password from response
    const { password: _, ...userData } = validUser.toObject();

    //Generate Jwt token
    const JwtToken = generateToken(userData._id);

    res.cookie("JwtToken", JwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // deploy pe true
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return res.status(200).json({
    message: "login successfully",
    userData,
    JwtToken,    
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

//--------------Logout-----------------------

const userLogout = (req, res) => {
  res.clearCookie("JwtToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURITY,
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  userRegistration,
  userLogin,
  userLogout
};
