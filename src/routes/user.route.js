const express = require("express");
const {
  userRegistration,
  userLogin,
  userLogout,
  userUpdate,
  sendOtpForReset,
  verifyOtp,
  resetPassword
} = require("../controllers/user.controller.js");
const upload = require("../middleware/multer.js");
const { verifyJwt } = require("../middleware/verifyJwt.js");

const router = express.Router();

router.route("/register").post(upload.single("profileUrl"), userRegistration);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJwt, userLogout);
router.route("/userUpdate").put(verifyJwt,upload.single("profileUrl"), userUpdate);
router.route("/sendOtpForReset").post(sendOtpForReset);
router.route("/verifyOtp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

module.exports = router;
