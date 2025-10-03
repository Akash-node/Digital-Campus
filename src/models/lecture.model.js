const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Lecture description is required"],
    },
    thumbnail: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // placeholder image
    },
    videoUrl: {
      type: String,
      required: [true, "Lecture video URL is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Lecture duration is required"],
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);
module.exports = Lecture;
