const express = require("express");
const {
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
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/auth");
const {
  validate,
  postCreateSchema,
  postUpdateSchema,
  commentSchema,
} = require("../middleware/validation");

const router = express.Router();

// Public/optional auth routes
router.get("/:id", optionalAuth, getPostById);

// Protected routes
router.use(protect); // All routes below require authentication

// Post management
router.post("/", validate(postCreateSchema), createPost);
router.get("/feed", getFeed);
router.get("/my/posts", getMyPosts);

// Post interactions
router.post("/:id/like", toggleLike);
router.post("/:id/comments", validate(commentSchema), addComment);
router.delete("/:id/comments/:commentId", deleteComment);
router.post("/:id/share", sharePost);

// Post CRUD (author only)
router.put("/:id", validate(postUpdateSchema), updatePost);
router.delete("/:id", deletePost);

module.exports = router;
