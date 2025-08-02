const express = require("express");
const {
  extractSkillsFromResume,
  extractSkillsFromText,
  updateUserSkills,
  getJobRecommendations,
  getUserRecommendations,
  analyzeSentiment,
  generateTags,
} = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Skill extraction
router.post("/extract-skills-resume", extractSkillsFromResume);
router.post("/extract-skills-text", extractSkillsFromText);
router.post("/update-user-skills", updateUserSkills);

// Recommendations
router.get("/job-recommendations", getJobRecommendations);
router.get("/user-recommendations", getUserRecommendations);

// Content analysis
router.post("/analyze-sentiment", analyzeSentiment);
router.post("/generate-tags", generateTags);

module.exports = router;
