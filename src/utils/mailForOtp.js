const nodemailer = require("nodemailer")


const mailForOtp = async (email) => {
 const transporter = nodemailer.createTransport({
      service: "gmail", // you can use other providers too
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: `${email}`,
      subject: "Password Reset OTP - Digital Campus",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    });
}



module.exports = mailForOtp