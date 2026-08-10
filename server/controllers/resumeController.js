const Resume = require("../models/Resume");

// ==========================================
// Upload Resume
// ==========================================

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resume.",
      });
    }

    const resume = await Resume.create({
      user: req.user.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({
      message: "Resume uploaded successfully.",
      resume,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    res.status(500).json({
      message: "Failed to upload resume.",
    });
  }
};


// ==========================================
// Get Logged-in User's Resumes
// ==========================================

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Resumes fetched successfully.",
      resumes,
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    res.status(500).json({
      message: "Failed to fetch resumes.",
    });
  }
};


// ==========================================
// Export Controllers
// ==========================================

module.exports = {
  uploadResume,
  getMyResumes,
};