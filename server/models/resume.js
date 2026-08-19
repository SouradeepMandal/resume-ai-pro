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
    // Extracted Resume Text
    // ==========================================

    extractedText: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);