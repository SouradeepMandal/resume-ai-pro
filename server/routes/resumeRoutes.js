const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadResume,
  getMyResumes,
  downloadResume,
  deleteResume,
} = require("../controllers/resumeController");


// ==========================================
// Upload Resume
// ==========================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);


// ==========================================
// Get Logged-in User's Resumes
// ==========================================

router.get(
  "/my",
  authMiddleware,
  getMyResumes
);


// ==========================================
// Download Resume
// ==========================================

router.get(
  "/:id/download",
  authMiddleware,
  downloadResume
);


// ==========================================
// Delete Resume
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);


module.exports = router;