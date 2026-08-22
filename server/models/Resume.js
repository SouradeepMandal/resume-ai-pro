const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // ==========================================
    // Resume Owner
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ==========================================
    // Original File Information
    // ==========================================

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },


    // ==========================================
    // Extracted Resume Text & AI Analysis
    // ==========================================

    extractedText: {
      type: String,
      default: "",
    },

    extractedSkills: {
      type: [String],
      default: [],
    },

    targetJobDescription: {
      type: String,
      default: "",
    },

    atsScore: {
      type: Number,
      default: null, // Null if not calculated
    },

    atsFeedback: {
      type: mongoose.Schema.Types.Mixed, // Stores structured JSON feedback from Gemini
      default: {},
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);