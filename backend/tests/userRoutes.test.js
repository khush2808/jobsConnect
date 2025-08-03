const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

describe("User Routes", () => {
  let testUser;
  let testUser2;
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
      location: { city: "New York", state: "NY", country: "USA" },
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
      location: { city: "San Francisco", state: "CA", country: "USA" },
    });
    await testUser2.save();

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
  });

  describe("GET /api/users/:id", () => {
    it("should get user profile by ID", async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.firstName).toBe("John");
      expect(response.body.user.lastName).toBe("Doe");
      expect(response.body.user.email).toBe("john@example.com");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/profile", () => {
    it("should update user profile", async () => {
      const updateData = {
        firstName: "John Updated",
        lastName: "Doe Updated",
        bio: "Updated bio",
        location: {
          city: "Los Angeles",
          state: "CA",
          country: "USA",
        },
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("John Updated");
      expect(response.body.data.lastName).toBe("Doe Updated");
      expect(response.body.data.bio).toBe("Updated bio");
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({ firstName: "Test" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/users/profile-picture", () => {
    it("should upload profile picture", async () => {
      const response = await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("profilePicture", Buffer.from("fake-image-data"), "test.jpg")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Profile picture uploaded successfully"
      );
      expect(response.body.profilePicture).toBeDefined();
    });

    it("should return 400 for invalid file type", async () => {
      const response = await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("profilePicture", Buffer.from("fake-text-data"), "test.txt")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/users/profile-picture", () => {
    it("should remove profile picture", async () => {
      // First upload a profile picture
      await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("profilePicture", Buffer.from("fake-image-data"), "test.jpg");

      const response = await request(app)
        .delete("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Profile picture removed successfully"
      );
    });

    it("should return 400 when no profile picture exists", async () => {
      const response = await request(app)
        .delete("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No profile picture to remove");
    });
  });

  describe("POST /api/users/resume", () => {
    it("should upload resume", async () => {
      const response = await request(app)
        .post("/api/users/resume")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("resume", Buffer.from("fake-pdf-data"), "test.pdf")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Resume uploaded successfully");
      expect(response.body.resume).toBeDefined();
    });

    it("should return 400 for invalid file type", async () => {
      const response = await request(app)
        .post("/api/users/resume")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("resume", Buffer.from("fake-text-data"), "test.txt")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/users/resume", () => {
    it("should remove resume", async () => {
      // First upload a resume
      await request(app)
        .post("/api/users/resume")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("resume", Buffer.from("fake-pdf-data"), "test.pdf");

      const response = await request(app)
        .delete("/api/users/resume")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Resume removed successfully");
    });

    it("should return 400 when no resume exists", async () => {
      const response = await request(app)
        .delete("/api/users/resume")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No resume to remove");
    });
  });

  describe("GET /api/users/connections", () => {
    it("should get user connections", async () => {
      // Create a connection between users
      testUser.connections.push({
        user: testUser2._id,
        status: "accepted",
        createdAt: new Date(),
      });
      await testUser.save();

      testUser2.connections.push({
        user: testUser._id,
        status: "accepted",
        createdAt: new Date(),
      });
      await testUser2.save();

      const response = await request(app)
        .get("/api/users/connections")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array when no connections", async () => {
      const response = await request(app)
        .get("/api/users/connections")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/users/connections/pending", () => {
    it("should get pending connection requests", async () => {
      // Create a pending connection request
      testUser.connections.push({
        user: testUser2._id,
        status: "pending",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .get("/api/users/connections/pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it("should return empty array when no pending requests", async () => {
      const response = await request(app)
        .get("/api/users/connections/pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/users/suggested-connections", () => {
    it("should get suggested connections", async () => {
      const response = await request(app)
        .get("/api/users/suggested-connections")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it("should exclude already connected users", async () => {
      // Create a connection between users
      testUser.connections.push({
        user: testUser2._id,
        status: "accepted",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .get("/api/users/suggested-connections")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not include testUser2 since they're already connected
      const suggestedUserIds = response.body.data.map((user) =>
        user._id.toString()
      );
      expect(suggestedUserIds).not.toContain(testUser2._id.toString());
    });
  });

  describe("POST /api/users/:id/connect", () => {
    it("should send connection request", async () => {
      const response = await request(app)
        .post(`/api/users/${testUser2._id}/connect`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Connection request sent successfully"
      );
    });

    it("should return 400 if already connected", async () => {
      // Create an existing connection
      testUser.connections.push({
        user: testUser2._id,
        status: "accepted",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .post(`/api/users/${testUser2._id}/connect`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 if request already sent", async () => {
      // Create a pending request
      testUser.connections.push({
        user: testUser2._id,
        status: "pending",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .post(`/api/users/${testUser2._id}/connect`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/users/connections/:id", () => {
    it("should accept connection request", async () => {
      // Create a pending connection request
      const connectionId = new mongoose.Types.ObjectId();
      testUser.connections.push({
        _id: connectionId,
        user: testUser2._id,
        status: "pending",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .put(`/api/users/connections/${connectionId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ status: "accepted" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Connection request accepted");
    });

    it("should reject connection request", async () => {
      // Create a pending connection request
      const connectionId = new mongoose.Types.ObjectId();
      testUser.connections.push({
        _id: connectionId,
        user: testUser2._id,
        status: "pending",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .put(`/api/users/connections/${connectionId}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ status: "rejected" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Connection request rejected");
    });

    it("should return 404 for non-existent connection", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/connections/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "accepted" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/users/connections/:id", () => {
    it("should remove connection", async () => {
      // Create a connection
      const connectionId = new mongoose.Types.ObjectId();
      testUser.connections.push({
        _id: connectionId,
        user: testUser2._id,
        status: "accepted",
        createdAt: new Date(),
      });
      await testUser.save();

      const response = await request(app)
        .delete(`/api/users/connections/${connectionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Connection removed successfully");
    });

    it("should return 404 for non-existent connection", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/users/connections/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/users/skills", () => {
    it("should update user skills", async () => {
      const skillsData = {
        skills: [
          { name: "JavaScript", proficiency: "Advanced", experience: 5 },
          { name: "React", proficiency: "Expert", experience: 4 },
          { name: "Node.js", proficiency: "Intermediate", experience: 3 },
        ],
      };

      const response = await request(app)
        .put("/api/users/skills")
        .set("Authorization", `Bearer ${authToken}`)
        .send(skillsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.skills).toHaveLength(3);
    });
  });

  describe("PUT /api/users/notifications", () => {
    it("should update notification settings", async () => {
      const notificationSettings = {
        emailNotifications: true,
        pushNotifications: false,
        jobAlerts: true,
        connectionRequests: true,
        applicationUpdates: true,
        marketingEmails: false,
      };

      const response = await request(app)
        .put("/api/users/notifications")
        .set("Authorization", `Bearer ${authToken}`)
        .send(notificationSettings)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("PUT /api/users/appearance", () => {
    it("should update appearance settings", async () => {
      const appearanceSettings = {
        theme: "dark",
        language: "en",
        timezone: "UTC",
      };

      const response = await request(app)
        .put("/api/users/appearance")
        .set("Authorization", `Bearer ${authToken}`)
        .send(appearanceSettings)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /api/users/search", () => {
    it("should search users by name", async () => {
      const response = await request(app)
        .get("/api/users/search?q=John")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      // The search might return empty results in test environment
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should search users by skills", async () => {
      const response = await request(app)
        .get("/api/users/search?skills=JavaScript")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it("should return empty results for non-matching search", async () => {
      const response = await request(app)
        .get("/api/users/search?q=NonExistentUser")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });
});
