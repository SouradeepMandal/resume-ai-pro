const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyOTP,
    getProfile,
    googleLogin,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/google", googleLogin);

// Protected Route
router.get("/profile", protect, getProfile);

module.exports = router;