const express = require("express");
const {
  getUserById,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
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

// Public/optional auth routes
router.get("/search", protect, searchUsers);
router.get("/:id", optionalAuth, getUserById);

// Protected routes
router.use(protect); // All routes below require authentication

// Profile management
router.put("/profile", validate(profileUpdateSchema), updateProfile);
router.post("/profile-picture", uploadProfilePicture);
router.delete("/profile-picture", removeProfilePicture);
router.put("/skills", updateSkills);

// Connections
router.post("/:id/connect", sendConnectionRequest);
router.get("/connections", getConnections);
router.put("/connections/:id", respondToConnectionRequest);
router.delete("/connections/:id", removeConnection);

module.exports = router;
