const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

// AI Routes require authentication
router.post("/score", protect, aiController.scoreATS);
router.post("/predict-interview", protect, aiController.predictInterview);
router.post("/rebuild-resume", protect, aiController.rebuildResume);
router.post("/download-pdf", protect, aiController.downloadPdf);

module.exports = router;
