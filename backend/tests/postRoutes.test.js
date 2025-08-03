const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

describe("Post Routes", () => {
  let testUser;
  let testUser2;
  let testPost;
  let authToken;
  let authToken2;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        "mongodb://localhost:27017/job-portal-test"
    );

    // Clear database
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test users
    testUser = new User({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      accountType: "job_seeker",
      skills: [
        { name: "JavaScript", proficiency: "Advanced", experience: 3 },
        { name: "React", proficiency: "Intermediate", experience: 2 },
      ],
    });
    await testUser.save();

    testUser2 = new User({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      password: "password123",
      accountType: "job_seeker",
      skills: [
        { name: "Python", proficiency: "Advanced", experience: 4 },
        { name: "Django", proficiency: "Intermediate", experience: 2 },
      ],
    });
    await testUser2.save();

    // Create test post
    testPost = new Post({
      author: testUser._id,
      content: "Just completed a React project! #react #javascript",
      type: "text",
      category: "Career",
      visibility: "public",
      likes: [],
      comments: [],
      shares: [],
    });
    await testPost.save();

    // Generate auth tokens
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || "test-secret"
    );
    authToken2 = jwt.sign(
      { userId: testUser2._id },
      process.env.JWT_SECRET || "test-secret"
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("GET /api/posts/feed", () => {
    it("should get user feed", async () => {
      const response = await request(app)
        .get("/api/posts/feed")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app).get("/api/posts/feed").expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should paginate results", async () => {
      const response = await request(app)
        .get("/api/posts/feed?page=1&limit=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post", async () => {
      const postData = {
        content: "Excited to share my latest project!",
        type: "text",
        category: "Career",
        visibility: "public",
      };

      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(
        "Excited to share my latest project!"
      );
      expect(response.body.data.author).toBe(testUser._id.toString());
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({ content: "Test post" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid post data", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "" }) // Empty content
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/posts/:id", () => {
    it("should get post by ID", async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(
        "Just completed a React project! #react #javascript"
      );
      expect(response.body.data.author).toBeDefined();
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Post not found");
    });
  });

  describe("POST /api/posts/:id/like", () => {
    it("should like a post", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isLiked).toBe(true);
      expect(response.body.data.likesCount).toBe(1);
    });

    it("should unlike a post if already liked", async () => {
      // First like the post
      await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${authToken}`);

      // Then unlike it
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isLiked).toBe(false);
      expect(response.body.data.likesCount).toBe(0);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/posts/${fakeId}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/posts/:id/comments", () => {
    it("should add a comment to a post", async () => {
      const commentData = {
        content: "Great work! This looks amazing.",
      };

      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(
        "Great work! This looks amazing."
      );
      expect(response.body.data.author).toBe(testUser._id.toString());
    });

    it("should return 400 for empty comment", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/posts/${fakeId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Test comment" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/posts/:id/comments/:commentId", () => {
    it("should delete a comment", async () => {
      // First add a comment
      const commentResponse = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Test comment" });

      const commentId = commentResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/posts/${testPost._id}/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Comment deleted successfully");
    });

    it("should return 403 for non-author", async () => {
      // Add comment with first user
      const commentResponse = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Test comment" });

      const commentId = commentResponse.body.data._id;

      // Try to delete with second user
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/posts/:id/share", () => {
    it("should share a post", async () => {
      const shareData = {
        shareComment: "Check out this amazing post!",
      };

      const response = await request(app)
        .post(`/api/posts/${testPost._id}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(shareData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sharesCount).toBe(1);
    });

    it("should share without comment", async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sharesCount).toBe(1);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/posts/${fakeId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ shareComment: "Test share" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("should update post by author", async () => {
      const updateData = {
        content: "Updated post content!",
        visibility: "private",
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe("Updated post content!");
      expect(response.body.data.visibility).toBe("private");
    });

    it("should return 403 for non-author", async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ content: "Unauthorized update" })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/posts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Updated content" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete post by author", async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Post deleted successfully");
    });

    it("should return 403 for non-author", async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/posts/my/posts", () => {
    it("should get user posts", async () => {
      const response = await request(app)
        .get("/api/posts/my/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array when no posts", async () => {
      const response = await request(app)
        .get("/api/posts/my/posts")
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .get("/api/posts/my/posts")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
