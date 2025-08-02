const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  applyToJob,
  getMyApplications,
  getMyJobs,
  updateJob,
  deleteJob,
  updateApplicationStatus,
  getJobRecommendations,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");
const {
  validate,
  jobCreateSchema,
  jobUpdateSchema,
  applicationSchema,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected routes
router.use(protect); // All routes below require authentication

// Job management
router.post("/", validate(jobCreateSchema), createJob);
router.get("/my/posted", getMyJobs);
router.get("/my/applications", getMyApplications);
router.get("/recommendations", getJobRecommendations);

// Job actions
router.post("/:id/apply", validate(applicationSchema), applyToJob);
router.put("/:id", validate(jobUpdateSchema), updateJob);
router.delete("/:id", deleteJob);

// Application management (for job owners)
router.put("/:jobId/applications/:applicationId", updateApplicationStatus);

module.exports = router;
