const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Author information
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post author is required"],
    },

    // Content
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [2000, "Post content cannot be more than 2000 characters"],
    },

    // Media attachments
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "document"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        public_id: String, // Cloudinary public ID
        filename: String,
        caption: String,
      },
    ],

    // Post type and category
    type: {
      type: String,
      enum: [
        "text",
        "article",
        "job_update",
        "career_advice",
        "achievement",
        "question",
        "poll",
      ],
      default: "text",
    },
    category: {
      type: String,
      enum: [
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
        "Other",
      ],
      default: "General",
    },

    // Tags and topics
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Engagement metrics
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        likes: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            likedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        replies: [
          {
            author: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            content: {
              type: String,
              required: true,
              trim: true,
              maxlength: 300,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
        editedAt: Date,
      },
    ],

    shares: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
        shareComment: String,
      },
    ],

    // Views and analytics
    views: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },

    // Post settings
    visibility: {
      type: String,
      enum: ["public", "connections", "private"],
      default: "public",
    },
    isCommentingEnabled: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        reporter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: [
            "spam",
            "inappropriate",
            "harassment",
            "false_information",
            "other",
          ],
        },
        description: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // AI-powered features
    sentiment: {
      score: {
        type: Number,
        min: -1,
        max: 1,
      },
      label: {
        type: String,
        enum: ["positive", "neutral", "negative"],
      },
    },
    suggestedTags: [String],

    // SEO and discovery
    slug: String,
    isPromoted: {
      type: Boolean,
      default: false,
    },

    // Poll-specific fields (when type is 'poll')
    poll: {
      question: String,
      options: [
        {
          text: String,
          votes: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
              votedAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
      expiresAt: Date,
      allowMultipleAnswers: {
        type: Boolean,
        default: false,
      },
    },

    // Original post reference (for shares/reposts)
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    // Edit history
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual("shareCount").get(function () {
  return this.shares.length;
});

// Virtual for engagement rate
postSchema.virtual("engagementRate").get(function () {
  if (this.views === 0) return 0;
  const totalEngagements = this.likeCount + this.commentCount + this.shareCount;
  return ((totalEngagements / this.views) * 100).toFixed(2);
});

// Virtual for time since posted
postSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Instance method to check if user liked the post
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user.toString() === userId.toString());
};

// Instance method to toggle like
postSchema.methods.toggleLike = function (userId) {
  const existingLikeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (existingLikeIndex > -1) {
    this.likes.splice(existingLikeIndex, 1);
    return false; // Unliked
  } else {
    this.likes.push({ user: userId });
    return true; // Liked
  }
};

// Instance method to add comment
postSchema.methods.addComment = function (userId, content) {
  this.comments.push({
    author: userId,
    content: content,
  });
  return this.save();
};

// Instance method to increment views
postSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Static method to find trending posts
postSchema.statics.findTrending = function (limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo },
        visibility: "public",
      },
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $size: "$likes" },
            { $multiply: [{ $size: "$comments" }, 2] },
            { $multiply: [{ $size: "$shares" }, 3] },
          ],
        },
      },
    },
    {
      $sort: { engagementScore: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ content: "text", "comments.content": "text" });
postSchema.index({ tags: 1 });
postSchema.index({ category: 1, type: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ visibility: 1, isReported: 1 });
postSchema.index({ "likes.user": 1 });
postSchema.index({ isPinned: 1, isPromoted: 1 });

module.exports = mongoose.model("Post", postSchema);
