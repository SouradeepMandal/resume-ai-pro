const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");

const { parseResume } = require("../services/resumeParser");

// ==========================================
// Upload Resume
// ==========================================

const uploadResume = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a resume.",
      });
    }

    console.log("==========================================");
    console.log("Resume received by controller");
    console.log("Original name:", req.file.originalname);
    console.log("File name:", req.file.filename);
    console.log("File type:", req.file.mimetype);
    console.log("File path:", req.file.path);
    console.log("File size:", req.file.size);
    console.log("==========================================");

    // ==========================================
    // Extract Resume Text
    // ==========================================

    const extractedText = await parseResume(req.file);

    // ==========================================
    // Save Resume + Extracted Text
    // ==========================================

    const resume = await Resume.create({
      user: req.user.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText: extractedText,
    });

    // ==========================================
    // Response
    // ==========================================

    return res.status(201).json({
      message: "Resume uploaded and processed successfully.",
      resume,
    });

  } catch (error) {
    console.error("Resume upload/processing error:", error);

    // ==========================================
    // Remove uploaded file if processing fails
    // ==========================================

    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);

        console.log("Uploaded file removed after failure.");
      } catch (deleteError) {
        console.error(
          "Failed to remove uploaded file:",
          deleteError
        );
      }
    }

    // ==========================================
    // Specific errors
    // ==========================================

    if (
      error.message === "No readable text found in resume."
    ) {
      return res.status(400).json({
        message: "No readable text found in resume.",
      });
    }

    if (
      error.message === "Unsupported resume file type."
    ) {
      return res.status(400).json({
        message: "Unsupported resume file type.",
      });
    }

    return res.status(500).json({
      message: "Failed to upload and process resume.",
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

    return res.status(200).json({
      resumes,
    });

  } catch (error) {
    console.error("Get resumes error:", error);

    return res.status(500).json({
      message: "Failed to fetch resumes.",
    });
  }
};


// ==========================================
// Download Resume
// ==========================================

const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    const filePath = path.resolve(resume.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Resume file no longer exists.",
      });
    }

    res.download(
      filePath,
      resume.originalName,
      (error) => {
        if (error) {
          console.error(
            "Resume download error:",
            error
          );

          if (!res.headersSent) {
            res.status(500).json({
              message: "Failed to download resume.",
            });
          }
        }
      }
    );

  } catch (error) {
    console.error(
      "Download resume error:",
      error
    );

    return res.status(500).json({
      message: "Failed to download resume.",
    });
  }
};


// ==========================================
// Delete Resume
// ==========================================

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    const filePath = path.resolve(resume.filePath);

    // ==========================================
    // Delete physical file
    // ==========================================

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ==========================================
    // Delete MongoDB record
    // ==========================================

    await Resume.findByIdAndDelete(resume._id);

    return res.status(200).json({
      message: "Resume deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete resume error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete resume.",
    });
  }
};


// ==========================================
// Export Controllers
// ==========================================

module.exports = {
  uploadResume,
  getMyResumes,
  downloadResume,
  deleteResume,
};