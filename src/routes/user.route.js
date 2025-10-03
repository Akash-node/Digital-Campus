const express = require("express");
const { userRegistration } = require("../controllers/user.controller.js");
const upload = require('../middleware/multer.js')

const router = express.Router();

router.route("/register").post(upload.single("profileUrl"),userRegistration);

module.exports = router;