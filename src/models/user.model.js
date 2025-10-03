const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    age: {
      type: Number,
      min: [5, "Minimum age must be 5"],
      max: [100, "Maximum age can be 100"],
      required: [true, "Age is required"],
    },

    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    profileUrl: {
      type: String,
      default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
  },
  { timestamps: true }
);

module.exports= mongoose.model("User", userSchema);

