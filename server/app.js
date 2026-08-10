const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

// ===============================
// Global Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// Static Files
// ===============================

// Allows uploaded resumes to be accessed if needed
app.use("/uploads", express.static("uploads"));

// ===============================
// Authentication Routes
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// Resume Routes
// ===============================

app.use("/api/resumes", resumeRoutes);

// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "ResumeAI Pro Backend Running 🚀",
  });
});

// ===============================
// Export App
// ===============================

module.exports = app;