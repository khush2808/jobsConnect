const express = require("express");
const {
  getUserById,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  uploadResume,
  removeResume,
  getResume,
  uploadCompanyLogo,
  updateSkills,
  searchUsers,
  sendConnectionRequest,
  respondToConnectionRequest,
  getConnections,
  removeConnection,
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/auth");
const { validate, profileUpdateSchema } = require("../middleware/validation");

const router = express.Router();

// Protected routes
router.use(protect); // All routes below require authentication

// Specific routes must come before parameter routes
router.get("/search", searchUsers);
router.get("/connections", getConnections);

// Profile management
router.put("/profile", validate(profileUpdateSchema), updateProfile);
router.post("/profile-picture", uploadProfilePicture);
router.delete("/profile-picture", removeProfilePicture);
router.post("/resume", uploadResume);
router.delete("/resume", removeResume);
router.get("/resume", getResume);
router.post("/company-logo", uploadCompanyLogo);
router.put("/skills", updateSkills);

// Public/optional auth routes
router.get("/:id", optionalAuth, getUserById);

// Connections
router.post("/:id/connect", sendConnectionRequest);
router.put("/connections/:id", respondToConnectionRequest);
router.delete("/connections/:id", removeConnection);

module.exports = router;
