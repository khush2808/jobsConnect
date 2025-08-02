const mongoose = require("mongoose");
const slugify = require("slugify");

const jobSchema = new mongoose.Schema(
  {
    // Basic job information
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [5000, "Job description cannot be more than 5000 characters"],
    },

    // Employer information
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employer is required"],
    },
    company: {
      name: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
      },
      logo: {
        url: String,
        public_id: String,
      },
      website: String,
      size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      },
      industry: String,
    },

    // Job details
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
    },
    workLocation: {
      type: String,
      required: [true, "Work location type is required"],
      enum: ["On-site", "Remote", "Hybrid"],
    },
    location: {
      city: String,
      state: String,
      country: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Skills and requirements
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate",
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Experience and education
    experienceLevel: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ["Entry Level", "Mid Level", "Senior Level", "Executive"],
    },
    minimumExperience: {
      type: Number,
      min: 0,
      max: 50,
    },
    education: {
      level: {
        type: String,
        enum: ["High School", "Bachelor's", "Master's", "PhD", "Not Required"],
      },
      field: String,
    },

    // Compensation
    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      period: {
        type: String,
        enum: ["hourly", "monthly", "yearly"],
        default: "yearly",
      },
      isNegotiable: {
        type: Boolean,
        default: true,
      },
    },
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
      isFixed: {
        type: Boolean,
        default: false,
      },
    },

    // Benefits and perks
    benefits: [
      {
        type: String,
        enum: [
          "Health Insurance",
          "Dental Insurance",
          "Vision Insurance",
          "Retirement Plan",
          "Paid Time Off",
          "Flexible Schedule",
          "Remote Work",
          "Professional Development",
          "Stock Options",
          "Bonus",
          "Gym Membership",
          "Free Meals",
          "Transportation",
          "Other",
        ],
      },
    ],

    // Application details
    applicationDeadline: {
      type: Date,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Application deadline must be in the future",
      },
    },
    applicationMethod: {
      type: String,
      enum: ["internal", "external", "email"],
      default: "internal",
    },
    externalApplicationUrl: String,
    applicationEmail: String,
    applicationInstructions: String,

    // Job status and metrics
    status: {
      type: String,
      enum: ["draft", "active", "paused", "closed", "expired"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Engagement metrics
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
          default: "pending",
        },
        coverLetter: String,
        resume: {
          url: String,
          public_id: String,
        },
        customResponses: [
          {
            question: String,
            answer: String,
          },
        ],
      },
    ],

    // SEO and categorization
    category: {
      type: String,
      required: [true, "Job category is required"],
      enum: [
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
        "Other",
      ],
    },
    tags: [String],

    // AI-powered features
    aiMatch: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      matchedCandidates: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          score: {
            type: Number,
            min: 0,
            max: 100,
          },
          reasons: [String],
          calculatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Metadata
    isUrgent: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for application count
jobSchema.virtual("applicationCount").get(function () {
  return this.applications.length;
});

// Virtual for days since posted
jobSchema.virtual("daysSincePosted").get(function () {
  const days = Math.floor(
    (new Date() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
  return days;
});

// Virtual for formatted salary range
jobSchema.virtual("salaryRange").get(function () {
  if (!this.salary || (!this.salary.min && !this.salary.max)) return null;

  const formatAmount = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };

  const currency = this.salary.currency || "USD";
  if (this.salary.min && this.salary.max) {
    return `${currency} ${formatAmount(this.salary.min)} - ${formatAmount(
      this.salary.max
    )}`;
  } else if (this.salary.min) {
    return `${currency} ${formatAmount(this.salary.min)}+`;
  } else if (this.salary.max) {
    return `Up to ${currency} ${formatAmount(this.salary.max)}`;
  }
  return null;
});

// Pre-save middleware to generate slug
jobSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, {
        lower: true,
        strict: true,
      }) +
      "-" +
      Date.now();
  }
  next();
});

// Pre-save middleware to handle job expiration
jobSchema.pre("save", function (next) {
  if (
    this.expiresAt &&
    this.expiresAt < new Date() &&
    this.status === "active"
  ) {
    this.status = "expired";
  }
  next();
});

// Instance method to check if job is expired
jobSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

// Instance method to increment view count
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Static method to find active jobs
jobSchema.statics.findActive = function () {
  return this.find({
    status: "active",
    $or: [
      { expiresAt: { $gte: new Date() } },
      { expiresAt: { $exists: false } },
    ],
  });
};

// Indexes for better query performance
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ status: 1, expiresAt: 1 });
jobSchema.index({ "skills.name": 1 });
jobSchema.index({ category: 1, jobType: 1 });
jobSchema.index({ "location.city": 1, "location.country": 1 });
jobSchema.index({ workLocation: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isFeatured: 1, isUrgent: 1 });

module.exports = mongoose.model("Job", jobSchema);
