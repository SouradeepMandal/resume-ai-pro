const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "ResumeAI Pro Backend Running 🚀",
  });
});

module.exports = app;