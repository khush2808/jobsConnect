const express = require("express");
const router = express.Router();

// Simple test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// Test file upload endpoint (without authentication)
router.post("/test-upload", (req, res) => {
  res.json({
    success: true,
    message: "Upload endpoint is accessible",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
