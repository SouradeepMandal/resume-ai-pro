const JobApplication = require("../models/JobApplication");

// Get all jobs for the user
const getJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

// Create a new job
const createJob = async (req, res) => {
  try {
    const { companyName, jobTitle, jobDescription, status, resumeId } = req.body;
    
    if (!companyName || !jobTitle) {
      return res.status(400).json({ message: "Company name and Job title are required" });
    }

    const job = new JobApplication({
      user: req.user.id,
      companyName,
      jobTitle,
      jobDescription,
      status: status || "Bookmarked",
      resume: resumeId || null,
      appliedDate: status === "Applied" ? new Date() : null,
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await JobApplication.findOne({ _id: id, user: req.user.id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // If status changes to applied, set date if not set
    if (updateData.status === "Applied" && job.status !== "Applied" && !job.appliedDate) {
      updateData.appliedDate = new Date();
    }

    const updatedJob = await JobApplication.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobApplication.findOne({ _id: id, user: req.user.id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob
};
