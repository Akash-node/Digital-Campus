const express = require("express");
const { userRegistration, userLogin,userLogout } = require("../controllers/user.controller.js");
const upload = require('../middleware/multer.js')
const {verifyJwt} = require("../middleware/verifyJwt.js")

const router = express.Router();

router.route("/register").post(upload.single("profileUrl"),userRegistration);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJwt,userLogout);

module.exports = router;