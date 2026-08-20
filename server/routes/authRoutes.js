const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyOTP,
    getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);

// Protected Route
router.get("/profile", protect, getProfile);

module.exports = router;