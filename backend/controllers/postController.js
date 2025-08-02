const Post = require("../models/Post");
const User = require("../models/User");
const aiService = require("../services/aiService");
const {
  postMediaUpload,
  deleteFromCloudinary,
} = require("../services/fileUploadService");

/**
 * Create a new post
 * @route POST /api/posts
 * @access Private
 */
const createPost = async (req, res) => {
  try {
    // Handle media upload if present
    postMediaUpload.array("media", 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      const { content, type, category, tags, visibility } = req.body;

      // Process uploaded media
      let media = [];
      if (req.files && req.files.length > 0) {
        media = req.files.map((file) => ({
          type: file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype.startsWith("video")
            ? "video"
            : "document",
          url: file.path,
          public_id: file.filename,
          filename: file.originalname,
        }));
      }

      // Create post data
      const postData = {
        author: req.user._id,
        content,
        media,
        type: type || "text",
        category: category || "General",
        visibility: visibility || "public",
      };

      // Process tags
      if (tags) {
        postData.tags = Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim());
      }

      const post = new Post(postData);

      // Generate AI-powered sentiment analysis and suggested tags
      try {
        const sentiment = await aiService.analyzePostSentiment(content);
        const suggestedTags = await aiService.generatePostTags(content);

        post.aiAnalysis = {
          sentiment,
          suggestedTags,
        };
      } catch (aiError) {
        console.log(
          "AI analysis failed, continuing without it:",
          aiError.message
        );
      }

      await post.save();

      // Populate author information
      await post.populate("author", "firstName lastName profilePicture");

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    });
  } catch (error) {
    console.error("Error creating post:", error);

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
      message: "Error creating post",
      error: error.message,
    });
  }
};

/**
 * Get feed posts with pagination
 * @route GET /api/posts/feed
 * @access Private
 */
const getFeed = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      tags,
      following = false,
    } = req.query;

    const userId = req.user._id;
    const user = await User.findById(userId).select("connections");

    // Build filter object
    const filter = {};

    // Visibility filter based on user connections
    if (following && user.connections.length > 0) {
      const connectionIds = user.connections
        .filter((conn) => conn.status === "accepted")
        .map((conn) => conn.user);

      filter.$or = [
        {
          author: { $in: connectionIds },
          visibility: { $in: ["public", "connections"] },
        },
        { author: userId }, // User's own posts
        { visibility: "public" }, // Public posts from anyone
      ];
    } else {
      filter.$or = [
        { visibility: "public" },
        { author: userId }, // User's own posts
      ];
    }

    // Filter by post type
    if (type) {
      filter.type = type;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by tags
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
      filter.tags = { $in: tagsArray };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const posts = await Post.find(filter)
      .populate("author", "firstName lastName profilePicture")
      .populate("likes.user", "firstName lastName")
      .populate("comments.author", "firstName lastName profilePicture")
      .populate("shares.user", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Add user interaction status to each post
    const postsWithInteractions = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some(
        (like) => like.user._id.toString() === userId.toString()
      ),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      sharesCount: post.shares.length,
    }));

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limitNumber);

    res.status(200).json({
      success: true,
      data: postsWithInteractions,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalPosts,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feed",
      error: error.message,
    });
  }
};

/**
 * Get single post by ID
 * @route GET /api/posts/:id
 * @access Public/Private
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id)
      .populate("author", "firstName lastName profilePicture")
      .populate("likes.user", "firstName lastName profilePicture")
      .populate({
        path: "comments.author",
        select: "firstName lastName profilePicture",
      })
      .populate({
        path: "comments.replies.author",
        select: "firstName lastName profilePicture",
      })
      .populate("shares.user", "firstName lastName profilePicture");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check visibility permissions
    if (
      post.visibility === "private" &&
      (!userId || post.author._id.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this post",
      });
    }

    if (post.visibility === "connections" && userId) {
      const user = await User.findById(userId).select("connections");
      const isConnected = user.connections.some(
        (conn) =>
          conn.user.toString() === post.author._id.toString() &&
          conn.status === "accepted"
      );

      if (!isConnected && post.author._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view this post",
        });
      }
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Add user interaction status
    const postData = post.toObject();
    if (userId) {
      postData.isLiked = post.likes.some(
        (like) => like.user._id.toString() === userId.toString()
      );
    }
    postData.likesCount = post.likes.length;
    postData.commentsCount = post.comments.length;
    postData.sharesCount = post.shares.length;

    res.status(200).json({
      success: true,
      data: postData,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

/**
 * Like/Unlike a post
 * @route POST /api/posts/:id/like
 * @access Private
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId.toString()
    );

    let message;
    if (existingLikeIndex > -1) {
      // Unlike the post
      post.likes.splice(existingLikeIndex, 1);
      message = "Post unliked successfully";
    } else {
      // Like the post
      post.likes.push({ user: userId });
      message = "Post liked successfully";
    }

    await post.save();

    res.status(200).json({
      success: true,
      message,
      data: {
        likesCount: post.likes.length,
        isLiked: existingLikeIndex === -1,
      },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post like",
      error: error.message,
    });
  }
};

/**
 * Add comment to post
 * @route POST /api/posts/:id/comments
 * @access Private
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.isCommentingEnabled) {
      return res.status(403).json({
        success: false,
        message: "Commenting is disabled for this post",
      });
    }

    // Add comment
    const comment = {
      author: userId,
      content,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment for response
    await post.populate("comments.author", "firstName lastName profilePicture");
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

/**
 * Delete comment
 * @route DELETE /api/posts/:id/comments/:commentId
 * @access Private
 */
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is comment author or post author
    if (
      comment.author.toString() !== userId.toString() &&
      post.author.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    comment.remove();
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

/**
 * Share a post
 * @route POST /api/posts/:id/share
 * @access Private
 */
const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareComment } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already shared the post
    const existingShare = post.shares.find(
      (share) => share.user.toString() === userId.toString()
    );

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: "You have already shared this post",
      });
    }

    // Add share
    post.shares.push({
      user: userId,
      shareComment,
      sharedAt: new Date(),
    });

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      data: {
        sharesCount: post.shares.length,
      },
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({
      success: false,
      message: "Error sharing post",
      error: error.message,
    });
  }
};

/**
 * Update post
 * @route PUT /api/posts/:id
 * @access Private (Author only)
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content, type, category, tags, visibility } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the post author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      });
    }

    // Update post fields
    if (content !== undefined) post.content = content;
    if (type !== undefined) post.type = type;
    if (category !== undefined) post.category = category;
    if (visibility !== undefined) post.visibility = visibility;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }

    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate("author", "firstName lastName profilePicture");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message,
    });
  }
};

/**
 * Delete post
 * @route DELETE /api/posts/:id
 * @access Private (Author only)
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the post author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Delete associated media from Cloudinary
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        if (mediaItem.public_id) {
          try {
            await deleteFromCloudinary(mediaItem.public_id);
          } catch (deleteError) {
            console.error("Error deleting media from Cloudinary:", deleteError);
          }
        }
      }
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

/**
 * Get user's posts
 * @route GET /api/posts/my-posts
 * @access Private
 */
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type } = req.query;

    const filter = { author: userId };
    if (type) {
      filter.type = type;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const posts = await Post.find(filter)
      .populate("author", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limitNumber);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalPosts,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your posts",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  addComment,
  deleteComment,
  sharePost,
  updatePost,
  deletePost,
  getMyPosts,
};
