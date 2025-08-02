const aiService = require("../services/aiService");
const {
  resumeUpload,
  parsePDF,
  uploadResumeToCloudinary,
} = require("../services/fileUploadService");
const User = require("../models/User");
const Job = require("../models/Job");

/**
 * Extract skills from uploaded resume (PDF)
 * @route POST /api/ai/extract-skills-resume
 * @access Private
 */
const extractSkillsFromResume = async (req, res) => {
  try {
    // Handle file upload
    resumeUpload.single("resume")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No resume file uploaded",
        });
      }

      try {
        // Parse PDF and extract text
        const resumeText = await parsePDF(req.file.buffer);

        if (!resumeText || resumeText.trim().length < 50) {
          return res.status(400).json({
            success: false,
            message: "Resume content is too short or could not be extracted",
          });
        }

        // Extract skills using AI
        const extractedSkills = await aiService.extractSkillsFromText(
          resumeText
        );

        // Optionally upload resume to Cloudinary for storage
        let resumeUrl = null;
        if (req.body.saveResume === "true") {
          try {
            const uploadResult = await uploadResumeToCloudinary(
              req.file.buffer,
              req.file.originalname
            );
            resumeUrl = uploadResult.secure_url;
          } catch (uploadError) {
            console.warn("Failed to upload resume to storage:", uploadError);
          }
        }

        res.status(200).json({
          success: true,
          message: "Skills extracted successfully",
          skills: extractedSkills,
          resumeText: resumeText.substring(0, 500) + "...", // First 500 chars for preview
          ...(resumeUrl && { resumeUrl }),
        });
      } catch (processingError) {
        console.error("Resume processing error:", processingError);
        res.status(500).json({
          success: false,
          message: "Failed to process resume file",
        });
      }
    });
  } catch (error) {
    console.error("Extract skills from resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during skill extraction",
    });
  }
};

/**
 * Extract skills from text (bio/description)
 * @route POST /api/ai/extract-skills-text
 * @access Private
 */
const extractSkillsFromText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Text content must be at least 20 characters long",
      });
    }

    // Extract skills using AI
    const extractedSkills = await aiService.extractSkillsFromText(text);

    res.status(200).json({
      success: true,
      message: "Skills extracted successfully",
      skills: extractedSkills,
    });
  } catch (error) {
    console.error("Extract skills from text error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during skill extraction",
    });
  }
};

/**
 * Update user skills with AI-extracted skills
 * @route POST /api/ai/update-user-skills
 * @access Private
 */
const updateUserSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills, mergeWithExisting = true } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let updatedSkills;

    if (mergeWithExisting) {
      // Merge with existing skills, avoiding duplicates
      const existingSkillNames = new Set(
        user.skills.map((s) => s.name.toLowerCase())
      );
      const newSkills = skills.filter(
        (skill) =>
          skill.name && !existingSkillNames.has(skill.name.toLowerCase())
      );
      updatedSkills = [...user.skills, ...newSkills];
    } else {
      // Replace all skills
      updatedSkills = skills;
    }

    user.skills = updatedSkills;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User skills updated successfully",
      skills: user.skills,
    });
  } catch (error) {
    console.error("Update user skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user skills",
    });
  }
};

/**
 * Get job recommendations for current user
 * @route GET /api/ai/job-recommendations
 * @access Private
 */
const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, category, location } = req.query;

    // Get user profile
    const user = await User.findById(userId).select(
      "skills jobPreferences location"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add skills to your profile to get job recommendations",
      });
    }

    // Build job query
    const jobQuery = {
      status: "active",
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: { $exists: false } },
      ],
    };

    if (category) {
      jobQuery.category = category;
    }

    if (location) {
      jobQuery.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
        { workLocation: "Remote" },
      ];
    }

    // Get available jobs
    const availableJobs = await Job.find(jobQuery)
      .populate("employer", "firstName lastName companyInfo")
      .limit(50) // Limit to 50 jobs for AI processing
      .sort({ createdAt: -1 });

    if (availableJobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No jobs available for recommendations",
        recommendations: [],
      });
    }

    // Generate AI recommendations
    const recommendations = await aiService.generateJobRecommendations(
      user,
      availableJobs
    );

    // Limit results
    const limitedRecommendations = recommendations.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      recommendations: limitedRecommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Get job recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating job recommendations",
    });
  }
};

/**
 * Get user recommendations (potential connections)
 * @route GET /api/ai/user-recommendations
 * @access Private
 */
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get current user with connections
    const currentUser = await User.findById(userId).select(
      "skills location connections accountType"
    );
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get IDs of already connected users
    const connectedUserIds = currentUser.connections.map((conn) => conn.user);
    connectedUserIds.push(userId); // Exclude self

    // Find potential connections
    const potentialConnections = await User.find({
      _id: { $nin: connectedUserIds },
      isActive: true,
    })
      .select(
        "firstName lastName fullName bio profilePicture skills location accountType companyInfo connectionCount"
      )
      .limit(50);

    if (potentialConnections.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: "No user recommendations available",
      });
    }

    // Score users based on similarity
    const scoredUsers = potentialConnections
      .map((user) => {
        let score = 0;
        const reasons = [];

        // Skill similarity (40% of score)
        const currentSkills = new Set(
          currentUser.skills.map((s) => s.name.toLowerCase())
        );
        const userSkills = user.skills.map((s) => s.name.toLowerCase());
        const skillMatches = userSkills.filter((skill) =>
          currentSkills.has(skill)
        ).length;

        if (skillMatches > 0) {
          score += (skillMatches / Math.max(userSkills.length, 1)) * 40;
          reasons.push(`${skillMatches} shared skills`);
        }

        // Location similarity (20% of score)
        if (currentUser.location?.city && user.location?.city) {
          if (
            currentUser.location.city.toLowerCase() ===
            user.location.city.toLowerCase()
          ) {
            score += 20;
            reasons.push("Same city");
          } else if (
            currentUser.location.country?.toLowerCase() ===
            user.location.country?.toLowerCase()
          ) {
            score += 10;
            reasons.push("Same country");
          }
        }

        // Account type complementarity (20% of score)
        if (
          currentUser.accountType === "job_seeker" &&
          user.accountType === "employer"
        ) {
          score += 20;
          reasons.push("Potential employer");
        } else if (
          currentUser.accountType === "employer" &&
          user.accountType === "job_seeker"
        ) {
          score += 20;
          reasons.push("Potential candidate");
        } else if (currentUser.accountType === user.accountType) {
          score += 10;
          reasons.push("Similar professional role");
        }

        // Connection count (10% of score) - higher connection count = more influential
        const connectionBonus = Math.min(user.connectionCount / 10, 1) * 10;
        score += connectionBonus;

        if (user.connectionCount > 50) {
          reasons.push("Well-connected professional");
        }

        // Company size preference (10% of score)
        if (user.companyInfo?.name) {
          score += 10;
          reasons.push("Company representative");
        }

        return {
          user,
          score: Math.round(score),
          reasons:
            reasons.length > 0 ? reasons : ["Professional in your network"],
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      recommendations: scoredUsers,
    });
  } catch (error) {
    console.error("Get user recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating user recommendations",
    });
  }
};

/**
 * Analyze post sentiment
 * @route POST /api/ai/analyze-sentiment
 * @access Private
 */
const analyzeSentiment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Content must be at least 5 characters long",
      });
    }

    const sentiment = await aiService.analyzePostSentiment(content);

    res.status(200).json({
      success: true,
      sentiment,
    });
  } catch (error) {
    console.error("Analyze sentiment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error analyzing sentiment",
    });
  }
};

/**
 * Generate post tags
 * @route POST /api/ai/generate-tags
 * @access Private
 */
const generateTags = async (req, res) => {
  try {
    const { content, category = "General" } = req.body;

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Content must be at least 10 characters long",
      });
    }

    const tags = await aiService.generatePostTags(content, category);

    res.status(200).json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error("Generate tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating tags",
    });
  }
};

module.exports = {
  extractSkillsFromResume,
  extractSkillsFromText,
  updateUserSkills,
  getJobRecommendations,
  getUserRecommendations,
  analyzeSentiment,
  generateTags,
};
