const Joi = require("joi");

/**
 * Generic validation middleware factory
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: message,
      });
    }

    next();
  };
};

// User validation schemas
const userRegistrationSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
  accountType: Joi.string()
    .valid("job_seeker", "employer", "both")
    .default("job_seeker"),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const profileUpdateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  bio: Joi.string().trim().max(500).allow(""),
  linkedinUrl: Joi.string()
    .uri()
    .pattern(
      new RegExp(
        "^https:\\/\\/(www\\.)?linkedin\\.com\\/in\\/[a-zA-Z0-9-]+\\/?$"
      )
    )
    .allow(""),
  location: Joi.object({
    city: Joi.string().trim().max(100),
    state: Joi.string().trim().max(100),
    country: Joi.string().trim().max(100),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
    }),
  }),
  jobPreferences: Joi.object({
    roles: Joi.array().items(Joi.string().trim().max(100)),
    desiredRoles: Joi.array().items(Joi.string().trim().max(100)),
    jobTypes: Joi.array().items(
      Joi.string().valid(
        "Full-time",
        "Part-time",
        "Contract",
        "Freelance",
        "Internship"
      )
    ),
    remoteWork: Joi.string().valid("On-site", "Remote", "Hybrid"),
    preferredLocation: Joi.string().trim().max(100),
    salaryRange: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
      currency: Joi.string().length(3).uppercase(),
    }),
    salaryExpectation: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
      currency: Joi.string().length(3).uppercase(),
    }),
  }),
  companyInfo: Joi.object({
    name: Joi.string().trim().max(100),
    website: Joi.string().uri(),
    size: Joi.string().valid(
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+"
    ),
    industry: Joi.string().trim().max(100),
    description: Joi.string().trim().max(500),
  }),
});

// Job validation schemas
const jobCreateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.min": "Job title must be at least 3 characters",
    "string.max": "Job title cannot exceed 100 characters",
    "any.required": "Job title is required",
  }),
  description: Joi.string().trim().min(50).max(5000).required().messages({
    "string.min": "Job description must be at least 50 characters",
    "string.max": "Job description cannot exceed 5000 characters",
    "any.required": "Job description is required",
  }),
  requirements: Joi.array().items(Joi.string().trim().max(500)),
  company: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    website: Joi.string().uri().allow(""),
    size: Joi.string().valid(
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+"
    ),
    industry: Joi.string().trim().max(100),
  }).required(),
  jobType: Joi.string()
    .valid("Full-time", "Part-time", "Contract", "Freelance", "Internship")
    .required(),
  workLocation: Joi.string().valid("On-site", "Remote", "Hybrid").required(),
  location: Joi.object({
    city: Joi.string().trim().max(100),
    state: Joi.string().trim().max(100),
    country: Joi.string().trim().max(100),
    address: Joi.string().trim().max(200),
  }),
  skills: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(50).required(),
        level: Joi.string()
          .valid("Beginner", "Intermediate", "Advanced", "Expert")
          .default("Intermediate"),
        proficiency: Joi.string()
          .valid("Beginner", "Intermediate", "Advanced", "Expert")
          .default("Intermediate"),
        isRequired: Joi.boolean().default(true),
        required: Joi.boolean().default(true),
      })
    )
    .min(1)
    .required(),
  experienceLevel: Joi.string()
    .valid("Entry Level", "Mid Level", "Senior Level", "Executive")
    .required(),
  minimumExperience: Joi.number().min(0).max(50),
  salary: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().length(3).uppercase().default("USD"),
    period: Joi.string().valid("hourly", "monthly", "yearly").default("yearly"),
    isNegotiable: Joi.boolean().default(true),
  }),
  category: Joi.string()
    .valid(
      "Technology",
      "Marketing",
      "Sales",
      "Design",
      "Finance",
      "Human Resources",
      "Operations",
      "Customer Service",
      "Healthcare",
      "Education",
      "Engineering",
      "Other"
    )
    .optional(),
  applicationDeadline: Joi.date().greater("now"),
  applicationMethod: Joi.string()
    .valid("internal", "external", "email")
    .default("internal"),
  benefits: Joi.array().items(Joi.string().trim().max(100)),
  externalApplicationUrl: Joi.string().uri().when("applicationMethod", {
    is: "external",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  applicationEmail: Joi.string().email().when("applicationMethod", {
    is: "email",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

// Post validation schemas
const postCreateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    "string.min": "Post content cannot be empty",
    "string.max": "Post content cannot exceed 2000 characters",
    "any.required": "Post content is required",
  }),
  type: Joi.string()
    .valid(
      "text",
      "article",
      "job_update",
      "career_advice",
      "achievement",
      "question",
      "poll"
    )
    .default("text"),
  category: Joi.string()
    .valid(
      "Career Advice",
      "Industry News",
      "Job Search",
      "Networking",
      "Skills Development",
      "Company Culture",
      "Success Stories",
      "Questions",
      "General",
      "Technology",
      "Design",
      "Marketing",
      "Sales",
      "Career",
      "Other"
    )
    .default("General"),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
  visibility: Joi.string()
    .valid("public", "connections", "private")
    .default("public"),
  isCommentingEnabled: Joi.boolean().default(true),
  poll: Joi.object({
    question: Joi.string().trim().min(5).max(200).required(),
    options: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().trim().min(1).max(100).required(),
        })
      )
      .min(2)
      .max(6)
      .required(),
    expiresAt: Joi.date().greater("now"),
    allowMultipleAnswers: Joi.boolean().default(false),
  }).when("type", {
    is: "poll",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

// Comment validation schema
const commentCreateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    "string.min": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 500 characters",
    "any.required": "Comment content is required",
  }),
});

// Job update schema (optional fields)
const jobUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100),
  description: Joi.string().trim().min(50).max(5000),
  company: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    website: Joi.string().uri().allow(""),
    size: Joi.string().valid(
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+"
    ),
    industry: Joi.string().trim().max(100),
  }),
  jobType: Joi.string().valid(
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship"
  ),
  workLocation: Joi.string().valid("On-site", "Remote", "Hybrid"),
  location: Joi.object({
    city: Joi.string().trim().max(100),
    state: Joi.string().trim().max(100),
    country: Joi.string().trim().max(100),
    address: Joi.string().trim().max(200),
  }),
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().min(1).max(50).required(),
      level: Joi.string()
        .valid("Beginner", "Intermediate", "Advanced", "Expert")
        .default("Intermediate"),
      isRequired: Joi.boolean().default(true),
    })
  ),
  experienceLevel: Joi.string().valid(
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive"
  ),
  minimumExperience: Joi.number().min(0).max(50),
  salary: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().length(3).uppercase().default("USD"),
    period: Joi.string().valid("hourly", "monthly", "yearly").default("yearly"),
    isNegotiable: Joi.boolean().default(true),
  }),
  status: Joi.string().valid("draft", "active", "paused", "closed"),
  applicationDeadline: Joi.date().greater("now"),
});

// Post update schema (optional fields)
const postUpdateSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000),
  type: Joi.string().valid(
    "text",
    "article",
    "job_update",
    "career_advice",
    "achievement",
    "question",
    "poll"
  ),
  category: Joi.string().valid(
    "Career Advice",
    "Industry News",
    "Job Search",
    "Networking",
    "Skills Development",
    "Company Culture",
    "Success Stories",
    "Questions",
    "General",
    "Technology",
    "Design",
    "Marketing",
    "Sales",
    "Other"
  ),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
  visibility: Joi.string().valid("public", "connections", "private"),
  isCommentingEnabled: Joi.boolean(),
});

// Application schema
const applicationSchema = Joi.object({
  coverLetter: Joi.string().trim().max(1000).allow("").messages({
    "string.max": "Cover letter cannot exceed 1000 characters",
  }),
  resumeUrl: Joi.string().uri().allow(""),
  expectedSalary: Joi.number().min(0).allow(""),
});

// Comment schema (alias for commentCreateSchema)
const commentSchema = commentCreateSchema;

// Search and filter validation
const searchQuerySchema = Joi.object({
  q: Joi.string().trim().max(100),
  category: Joi.string(),
  location: Joi.string().trim().max(100),
  jobType: Joi.string().valid(
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship"
  ),
  workLocation: Joi.string().valid("On-site", "Remote", "Hybrid"),
  experienceLevel: Joi.string().valid(
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive"
  ),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(0),
  skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  sortBy: Joi.string()
    .valid("newest", "oldest", "salary_high", "salary_low", "relevance")
    .default("newest"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  profileUpdateSchema,
  jobCreateSchema,
  jobUpdateSchema,
  postCreateSchema,
  postUpdateSchema,
  commentCreateSchema,
  commentSchema,
  applicationSchema,
  searchQuerySchema,
};
