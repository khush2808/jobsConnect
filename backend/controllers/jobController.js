const Job = require("../models/Job");
const User = require("../models/User");
const aiService = require("../services/aiService");

/**
 * Create a new job posting
 * @route POST /api/jobs
 * @access Private
 */
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employer: req.user._id,
    };

    // If no company info provided, use user's company info
    if (!jobData.company || !jobData.company.name) {
      const employer = await User.findById(req.user._id).select("company");
      if (employer.company && employer.company.name) {
        jobData.company = employer.company;
      }
    }

    const job = new Job(jobData);
    await job.save();

    // Populate employer information
    await job.populate("employer", "firstName lastName profilePicture company");

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error creating job:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating job posting",
      error: error.message,
    });
  }
};

/**
 * Get all jobs with filtering and pagination
 * @route GET /api/jobs
 * @access Public
 */
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      skills,
      jobType,
      workLocation,
      experienceLevel,
      salaryMin,
      salaryMax,
      location,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { status: "active" };

    // Text search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
      filter["skills.name"] = {
        $in: skillsArray.map((skill) => new RegExp(skill, "i")),
      };
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by work location
    if (workLocation) {
      filter.workLocation = workLocation;
    }

    // Filter by experience level
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Filter by salary range
    if (salaryMin || salaryMax) {
      filter["salary.min"] = {};
      if (salaryMin) filter["salary.min"].$gte = parseInt(salaryMin);
      if (salaryMax) filter["salary.max"] = { $lte: parseInt(salaryMax) };
    }

    // Filter by location
    if (location) {
      filter.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate("employer", "firstName lastName profilePicture company")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNumber);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalJobs,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

/**
 * Get single job by ID
 * @route GET /api/jobs/:id
 * @access Public
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate(
        "employer",
        "firstName lastName profilePicture company bio location"
      )
      .populate(
        "applications.applicant",
        "firstName lastName profilePicture skills"
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increment view count
    job.views.count += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job details",
      error: error.message,
    });
  }
};

/**
 * Apply to a job
 * @route POST /api/jobs/:id/apply
 * @access Private
 */
const applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter, resumeUrl } = req.body;
    const applicantId = req.user._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the job poster
    if (job.employer.toString() === applicantId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job posting",
      });
    }

    // Check if already applied
    const existingApplication = job.applications.find(
      (app) => app.applicant.toString() === applicantId.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    // Add application
    job.applications.push({
      applicant: applicantId,
      coverLetter,
      resumeUrl,
      appliedAt: new Date(),
      status: "pending",
    });

    await job.save();

    // Populate the new application for response
    await job.populate(
      "applications.applicant",
      "firstName lastName profilePicture skills"
    );

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      data: job.applications[job.applications.length - 1],
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message,
    });
  }
};

/**
 * Get user's job applications
 * @route GET /api/jobs/my-applications
 * @access Private
 */
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = {
      "applications.applicant": userId,
      status: "active",
    };

    // Add status filter if provided
    if (status) {
      filter["applications.status"] = status;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Find jobs where user has applied
    const jobs = await Job.find(filter)
      .populate("employer", "firstName lastName profilePicture company")
      .sort({ "applications.appliedAt": -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Extract user's applications from each job
    const applications = jobs.map((job) => {
      const userApplication = job.applications.find(
        (app) => app.applicant.toString() === userId.toString()
      );
      return {
        _id: userApplication._id,
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          jobType: job.jobType,
          workLocation: job.workLocation,
          location: job.location,
          employer: job.employer,
        },
        ...userApplication,
      };
    });

    const totalApplications = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalApplications / limitNumber);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalApplications,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your applications",
      error: error.message,
    });
  }
};

/**
 * Get jobs posted by user
 * @route GET /api/jobs/my-jobs
 * @access Private
 */
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { employer: userId };
    if (status) {
      filter.status = status;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const jobs = await Job.find(filter)
      .populate(
        "applications.applicant",
        "firstName lastName profilePicture skills"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNumber);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalJobs,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your job postings",
      error: error.message,
    });
  }
};

/**
 * Update job posting
 * @route PUT /api/jobs/:id
 * @access Private (Job owner only)
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own job postings",
      });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("employer", "firstName lastName profilePicture company");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating job posting",
      error: error.message,
    });
  }
};

/**
 * Delete job posting
 * @route DELETE /api/jobs/:id
 * @access Private (Job owner only)
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own job postings",
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting job posting",
      error: error.message,
    });
  }
};

/**
 * Update application status (for job owners)
 * @route PUT /api/jobs/:jobId/applications/:applicationId
 * @access Private (Job owner only)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage applications for your own job postings",
      });
    }

    // Find and update application
    const application = job.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;
    if (feedback) {
      application.feedback = feedback;
    }
    application.reviewedAt = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};

/**
 * Get job recommendations for user (AI-powered)
 * @route GET /api/jobs/recommendations
 * @access Private
 */
const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get user's profile for AI recommendations
    const user = await User.findById(userId).select(
      "skills bio location jobPreferences"
    );

    // Get AI recommendations
    const recommendations = await aiService.generateJobRecommendations(user);

    // Find matching jobs
    const jobs = await Job.find({
      status: "active",
      employer: { $ne: userId }, // Exclude user's own jobs
    })
      .populate("employer", "firstName lastName profilePicture company")
      .limit(parseInt(limit))
      .lean();

    // Score and sort jobs based on AI recommendations
    const scoredJobs = jobs.map((job) => {
      let score = 0;

      // Match skills
      if (job.skills && user.skills) {
        const matchingSkills = job.skills.filter((jobSkill) =>
          user.skills.some((userSkill) =>
            userSkill.name.toLowerCase().includes(jobSkill.name.toLowerCase())
          )
        );
        score += matchingSkills.length * 10;
      }

      // Match location
      if (job.location && user.location) {
        if (job.location.city === user.location.city) score += 15;
        if (job.location.state === user.location.state) score += 10;
        if (job.location.country === user.location.country) score += 5;
      }

      // Match job preferences
      if (user.jobPreferences) {
        if (user.jobPreferences.jobTypes?.includes(job.jobType)) score += 20;
        if (user.jobPreferences.workLocation?.includes(job.workLocation))
          score += 15;
      }

      return { ...job, matchScore: score };
    });

    // Sort by match score
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: scoredJobs.slice(0, parseInt(limit)),
      aiRecommendations: recommendations,
    });
  } catch (error) {
    console.error("Error generating job recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error generating job recommendations",
      error: error.message,
    });
  }
};

module.exports = {
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
};
