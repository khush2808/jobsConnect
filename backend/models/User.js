const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },

    // Profile info
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
      trim: true,
    },
    profilePicture: {
      url: String,
      public_id: String, // Cloudinary public ID for deletion
    },
    resume: {
      public_id: String, // Cloudinary public ID for secure access
      filename: String, // Original filename
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    linkedinUrl: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty LinkedIn URL
          return /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(
            v
          );
        },
        message: "Please enter a valid LinkedIn URL",
      },
    },

    // Skills and experience
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        isAIExtracted: {
          type: Boolean,
          default: false,
        },
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate",
        },
      },
    ],

    // Location and preferences
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Job preferences
    jobPreferences: {
      roles: [String], // e.g., ['Frontend Developer', 'Full Stack']
      jobTypes: [
        {
          type: String,
          enum: [
            "Full-time",
            "Part-time",
            "Contract",
            "Freelance",
            "Internship",
          ],
        },
      ],
      remoteWork: {
        type: String,
        enum: ["On-site", "Remote", "Hybrid"],
        default: "Hybrid",
      },
      salaryRange: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: "USD",
        },
      },
    },

    // Activity tracking
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Social features
    connections: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Verification and security
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Account type
    accountType: {
      type: String,
      enum: ["job_seeker", "employer", "both"],
      default: "job_seeker",
    },

    // Company info (for employers)
    companyInfo: {
      name: String,
      website: String,
      size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      },
      industry: String,
      description: String,
    },

    // Notification settings
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      connectionRequests: {
        type: Boolean,
        default: true,
      },
      applicationUpdates: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
    },

    // Appearance settings
    appearanceSettings: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["en", "es", "fr", "de"],
        default: "en",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for connection count
userSchema.virtual("connectionCount").get(function () {
  return this.connections
    ? this.connections.filter((conn) => conn.status === "accepted").length
    : 0;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate profile completeness
userSchema.pre("save", function (next) {
  let completeness = 0;
  const fields = [
    "firstName",
    "lastName",
    "email",
    "bio",
    "profilePicture.url",
    "resume.filename",
    "skills",
    "location.city",
    "jobPreferences.roles",
  ];

  fields.forEach((field) => {
    const value = field.includes(".")
      ? field.split(".").reduce((obj, key) => obj?.[key], this)
      : this[field];

    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completeness += 100 / fields.length;
    }
  });

  this.profileCompleteness = Math.round(completeness);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and save to database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiry time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ "skills.name": 1 });
userSchema.index({ "location.city": 1 });
userSchema.index({ "jobPreferences.roles": 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
