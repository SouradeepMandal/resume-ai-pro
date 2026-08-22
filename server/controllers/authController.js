const User = require("../models/User");
const jwt=require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer transporter with Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525, // Try alternative port
  secure: false, // TLS requires secure: false for port 2525
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email: identifier, password } = req.body;
    
    // In our frontend, we send identifier as 'email'. Let's parse it.
    if (!identifier) {
      return res.status(400).json({ message: "Email or phone is required" });
    }
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };

    // Check if user already exists
    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const userPayload = {
      name,
      password: hashedPassword,
      isVerified: true
    };

    if (isEmail) userPayload.email = identifier;
    else userPayload.phone = identifier;

    const user = await User.create(userPayload);

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        identifier: identifier,
      },
      needsVerification: false
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email: identifier, password } = req.body;

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Request Login OTP
const requestLoginOTP = async (req, res) => {
  try {
    const { email: identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ message: "Email is required" });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Log OTP to terminal to help with testing if Brevo blocks the email
    console.log(`\n================================`);
    console.log(`🔒 LOCAL DEV OTP for ${identifier}: ${otp}`);
    console.log(`================================\n`);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    if (isEmail) {
      const mailOptions = {
        from: process.env.BREVO_SENDER_EMAIL,
        to: identifier,
        subject: "Your ResumeAI Pro Login Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #14b8a6; text-align: center;">Login to ResumeAI Pro</h2>
            <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
            <p style="font-size: 16px; color: #333;">Please use the following OTP to log in to your account. This code is valid for 10 minutes.</p>
            <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="margin: 0; letter-spacing: 5px; color: #111;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #777; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Login OTP sent to ${identifier}`);
      } catch (mailError) {
        console.error("Error sending OTP email:", mailError.message);
        console.warn("⚠️ IMPORTANT: Email sending failed (likely due to Brevo IP restrictions). Use the OTP printed above in the terminal to continue testing the login flow.");
        // We still return 200 so you can test the frontend OTP screen using the console.logged OTP!
      }
    } else {
      console.log(`Mock Login OTP sent to phone ${identifier}: ${otp}`);
    }

    res.status(200).json({ message: "OTP processed (check terminal if email failed)" });
  } catch (error) {
    console.error("Request Login OTP Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getProfile = (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user,
    });
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    // Find user by Google ID or Email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    
    if (user) {
      // If user exists but doesn't have googleId linked, link it now
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google Login Failed", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestLoginOTP,
  verifyOTP,
  getProfile,
  googleLogin
};
