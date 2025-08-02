const express = require("express");
const {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validate,
  userRegistrationSchema,
  userLoginSchema,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post("/register", validate(userRegistrationSchema), register);
router.post("/login", validate(userLoginSchema), login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.use(protect); // All routes below require authentication

router.get("/me", getCurrentUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.put("/change-password", changePassword);

module.exports = router;
