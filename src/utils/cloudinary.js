const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    console.log("Cloudinary upload success:", response.secure_url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    return null;
  } finally {
    // Always try to remove the local file
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted:", localFilePath);
      }
    } catch (err) {
      console.error("Error deleting local file:", err.message);
    }
  }
};

module.exports = { uploadOnCloudinary };
