require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  console.log("Email user:", process.env.EMAIL_USER);
  console.log("Email pass:", process.env.EMAIL_PASS ? "Set" : "Not Set");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "souradeepmandal2015@gmail.com",
    subject: "Test Email from ResumeAI",
    html: "<p>This is a test email.</p>"
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

main();
