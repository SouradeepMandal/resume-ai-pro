const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: false, // Optional: Which resume was used for this job
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Bookmarked", "Applied", "Interview", "Offer", "Rejected"],
      default: "Bookmarked",
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    // AI Predictions
    interviewProbability: {
      type: Number,
      default: null, // Scored out of 100
    },
    aiNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema);
