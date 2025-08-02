const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found. AI features will be disabled.");
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Extract skills from resume text or bio
   */
  async extractSkillsFromText(text) {
    if (!this.genAI) {
      throw new Error(
        "AI service not available. Please configure GEMINI_API_KEY."
      );
    }

    try {
      const prompt = `
        Analyze the following resume/bio text and extract relevant technical and professional skills. 
        Return only a JSON array of skill objects with this format:
        [{"name": "skill_name", "proficiency": "Beginner|Intermediate|Advanced|Expert"}]
        
        Guidelines:
        - Extract only actual skills, technologies, tools, programming languages, frameworks
        - Avoid soft skills like "teamwork" or "communication"
        - Infer proficiency level based on context (years of experience, project complexity, certifications)
        - Limit to maximum 15 most relevant skills
        - Use exact technology names (e.g., "React.js" not "React")
        
        Text to analyze:
        ${text}
        
        Return only the JSON array, no additional text:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const skillsText = response.text().trim();

      // Parse JSON response
      let skills;
      try {
        skills = JSON.parse(skillsText);
      } catch (parseError) {
        // If JSON parsing fails, try to extract skills using regex
        console.warn(
          "Failed to parse AI response as JSON, attempting fallback extraction"
        );
        skills = this.fallbackSkillExtraction(skillsText);
      }

      // Validate and clean skills
      if (!Array.isArray(skills)) {
        throw new Error("AI response is not an array");
      }

      return skills
        .filter((skill) => skill.name && typeof skill.name === "string")
        .map((skill) => ({
          name: skill.name.trim(),
          proficiency: [
            "Beginner",
            "Intermediate",
            "Advanced",
            "Expert",
          ].includes(skill.proficiency)
            ? skill.proficiency
            : "Intermediate",
          isAIExtracted: true,
        }))
        .slice(0, 15); // Limit to 15 skills
    } catch (error) {
      console.error("Error extracting skills:", error);
      throw new Error("Failed to extract skills from text");
    }
  }

  /**
   * Fallback skill extraction when JSON parsing fails
   */
  fallbackSkillExtraction(text) {
    const commonSkills = [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "HTML",
      "CSS",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "TypeScript",
      "Vue.js",
      "Angular",
      "Express.js",
      "Spring Boot",
      "Django",
      "Flask",
      "Machine Learning",
      "Data Analysis",
      "Project Management",
      "Agile",
    ];

    const extractedSkills = [];
    const textLower = text.toLowerCase();

    commonSkills.forEach((skill) => {
      if (textLower.includes(skill.toLowerCase())) {
        extractedSkills.push({
          name: skill,
          proficiency: "Intermediate",
          isAIExtracted: true,
        });
      }
    });

    return extractedSkills.slice(0, 10);
  }

  /**
   * Generate job recommendations based on user profile
   */
  async generateJobRecommendations(userProfile, availableJobs) {
    if (!this.genAI) {
      return this.fallbackJobRecommendations(userProfile, availableJobs);
    }

    try {
      const userSkills = userProfile.skills.map((s) => s.name).join(", ");
      const userPreferences = userProfile.jobPreferences || {};

      const prompt = `
        Analyze this user profile and recommend the most suitable jobs from the available list.
        
        User Profile:
        - Skills: ${userSkills}
        - Preferred Roles: ${
          userPreferences.roles ? userPreferences.roles.join(", ") : "Any"
        }
        - Preferred Job Types: ${
          userPreferences.jobTypes ? userPreferences.jobTypes.join(", ") : "Any"
        }
        - Remote Work Preference: ${userPreferences.remoteWork || "Any"}
        - Location: ${
          userProfile.location
            ? userProfile.location.city + ", " + userProfile.location.country
            : "Any"
        }
        
        Available Jobs:
        ${availableJobs
          .map(
            (job, index) => `
          ${index + 1}. ${job.title} at ${job.company.name}
          Skills Required: ${job.skills.map((s) => s.name).join(", ")}
          Type: ${job.jobType}
          Location: ${job.workLocation}
          Experience: ${job.experienceLevel}
        `
          )
          .join("\n")}
        
        Return a JSON array of job recommendations with match scores (0-100) and reasons:
        [{"jobIndex": 0, "score": 85, "reasons": ["Strong skill match", "Preferred location"]}]
        
        Consider:
        - Skill overlap (most important)
        - Job type and remote work preferences
        - Experience level match
        - Location compatibility
        
        Return only the JSON array:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendationsText = response.text().trim();

      let recommendations;
      try {
        recommendations = JSON.parse(recommendationsText);
      } catch (parseError) {
        console.warn("Failed to parse job recommendations, using fallback");
        return this.fallbackJobRecommendations(userProfile, availableJobs);
      }

      return recommendations
        .filter(
          (rec) => rec.jobIndex >= 0 && rec.jobIndex < availableJobs.length
        )
        .map((rec) => ({
          job: availableJobs[rec.jobIndex],
          score: Math.min(100, Math.max(0, rec.score || 0)),
          reasons: Array.isArray(rec.reasons)
            ? rec.reasons
            : ["AI-generated match"],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error("Error generating job recommendations:", error);
      return this.fallbackJobRecommendations(userProfile, availableJobs);
    }
  }

  /**
   * Fallback job recommendations using simple matching
   */
  fallbackJobRecommendations(userProfile, availableJobs) {
    const userSkills = new Set(
      userProfile.skills.map((s) => s.name.toLowerCase())
    );

    return availableJobs
      .map((job) => {
        let score = 0;
        const reasons = [];

        // Skill matching (60% of score)
        const jobSkills = job.skills.map((s) => s.name.toLowerCase());
        const skillMatches = jobSkills.filter((skill) =>
          userSkills.has(skill)
        ).length;
        const skillScore = (skillMatches / Math.max(jobSkills.length, 1)) * 60;
        score += skillScore;

        if (skillMatches > 0) {
          reasons.push(`${skillMatches} matching skills`);
        }

        // Job type preference (20% of score)
        const userJobTypes = userProfile.jobPreferences?.jobTypes || [];
        if (userJobTypes.includes(job.jobType)) {
          score += 20;
          reasons.push("Preferred job type");
        }

        // Remote work preference (20% of score)
        const userRemotePreference = userProfile.jobPreferences?.remoteWork;
        if (userRemotePreference === job.workLocation) {
          score += 20;
          reasons.push("Preferred work location");
        }

        return {
          job,
          score: Math.round(score),
          reasons: reasons.length > 0 ? reasons : ["Basic profile match"],
        };
      })
      .filter((rec) => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Analyze post sentiment
   */
  async analyzePostSentiment(content) {
    if (!this.genAI) {
      return { score: 0, label: "neutral" };
    }

    try {
      const prompt = `
        Analyze the sentiment of this social media post. Return only a JSON object:
        {"score": number_between_-1_and_1, "label": "positive|neutral|negative"}
        
        Where score is:
        - 1.0 = very positive
        - 0.0 = neutral
        - -1.0 = very negative
        
        Post content:
        ${content}
        
        Return only the JSON object:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const sentimentText = response.text().trim();

      const sentiment = JSON.parse(sentimentText);

      return {
        score: Math.max(-1, Math.min(1, sentiment.score || 0)),
        label: ["positive", "neutral", "negative"].includes(sentiment.label)
          ? sentiment.label
          : "neutral",
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return { score: 0, label: "neutral" };
    }
  }

  /**
   * Generate suggested tags for a post
   */
  async generatePostTags(content, category) {
    if (!this.genAI) {
      return this.fallbackPostTags(content, category);
    }

    try {
      const prompt = `
        Generate relevant hashtags/tags for this social media post.
        Return only a JSON array of strings: ["tag1", "tag2", "tag3"]
        
        Guidelines:
        - Maximum 5 tags
        - Use single words or short phrases
        - Make them discoverable and relevant
        - Include category-specific tags when appropriate
        - No # symbol needed
        
        Post content: ${content}
        Category: ${category}
        
        Return only the JSON array:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const tagsText = response.text().trim();

      const tags = JSON.parse(tagsText);

      return Array.isArray(tags)
        ? tags.slice(0, 5).map((tag) => tag.replace("#", "").trim())
        : this.fallbackPostTags(content, category);
    } catch (error) {
      console.error("Error generating tags:", error);
      return this.fallbackPostTags(content, category);
    }
  }

  /**
   * Fallback tag generation
   */
  fallbackPostTags(content, category) {
    const categoryTags = {
      "Career Advice": ["career", "advice", "professional"],
      Technology: ["tech", "technology", "innovation"],
      "Job Search": ["job", "hiring", "opportunity"],
      Networking: ["networking", "connections", "community"],
      "Skills Development": ["skills", "learning", "development"],
    };

    const baseTags = categoryTags[category] || ["professional", "career"];

    // Simple keyword extraction
    const keywords = content
      .toLowerCase()
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 4 &&
          !["this", "that", "with", "have", "been"].includes(word)
      )
      .slice(0, 2);

    return [...baseTags, ...keywords].slice(0, 5);
  }
}

module.exports = new AIService();
