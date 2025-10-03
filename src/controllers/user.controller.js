const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateToken } = require("../utils/generateJwtToken");
const otpModel = require("../models/otp.model");
const mailForOtp = require("../utils/mailForOtp")


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
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

//--------------Login-----------------------

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


//--------------Update User Details-----------------------

const userUpdate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, age, gender, role } = req.body;

    // ✅ Check if the email is being changed and if it's already used by another user
    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: "This email is already registered with another account",
        });
      }
    }

    // ✅ Prepare update data
    const updateData = { fullName, email, age, gender, role };

    // ✅ Handle profile image upload if provided
    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path);
      if (uploadRes?.secure_url) {
        updateData.profileUrl = uploadRes.secure_url;
      }
    }

    // ✅ Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Exclude password from response
    const { password, ...userData } = updatedUser.toObject();

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


//--------------Send Otp for Reset-----------------------

const sendOtpForReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If this email exists, OTP has been sent" });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    // ✅ Save OTP in DB
    await otpModel.create({ email, otp });

    // ✅ Send OTP via Email (Nodemailer)
    mailForOtp(email)
   

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};


//--------------Verify Otp-----------------------

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await otpModel.findOne({ email, isUsed: false });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or already used" });
    }

    // ✅ Compare OTP
    if (otp !== otpRecord.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // ✅ Optionally: Generate a short-lived token to allow password reset
    // Or set a session flag for frontend

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
};

//--------------Reset Password----------------------


const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

module.exports = {
  userRegistration,
  userLogin,
  userLogout,
  userUpdate,
  sendOtpForReset,
  verifyOtp,
  resetPassword
};
