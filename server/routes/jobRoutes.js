const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const protect = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, jobController.getJobs)
  .post(protect, jobController.createJob);

router.route("/:id")
  .put(protect, jobController.updateJob)
  .delete(protect, jobController.deleteJob);

module.exports = router;
