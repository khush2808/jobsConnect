const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const User = require("../models/User");
const Job = require("../models/Job");
const jwt = require("jsonwebtoken");

describe("Job Routes", () => {
  let testUser;
  let testEmployer;
  let testJob;
  let authToken;
  let employerToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        "mongodb://localhost:27017/job-portal-test"
    );

    // Clear database
    await User.deleteMany({});
    await Job.deleteMany({});
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

    testEmployer = new User({
      firstName: "Jane",
      lastName: "Employer",
      email: "jane@company.com",
      password: "password123",
      accountType: "employer",
      company: {
        name: "Tech Company",
        industry: "Technology",
        size: "100-500",
      },
    });
    await testEmployer.save();

    // Create test job
    testJob = new Job({
      title: "Senior React Developer",
      description: "We are looking for a senior React developer...",
      employer: testEmployer._id,
      company: {
        name: "Tech Company",
        industry: "Technology",
        size: "100-500",
      },
      location: "New York, NY",
      jobType: "full-time",
      salary: {
        min: 80000,
        max: 120000,
        currency: "USD",
      },
      skills: [
        { name: "React", required: true },
        { name: "JavaScript", required: true },
        { name: "Node.js", required: false },
      ],
      requirements: {
        experience: "3+ years",
        education: "Bachelor's degree",
      },
      benefits: ["Health insurance", "401k", "Remote work"],
      status: "active",
    });
    await testJob.save();

    // Generate auth tokens
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || "test-secret"
    );
    employerToken = jwt.sign(
      { userId: testEmployer._id },
      process.env.JWT_SECRET || "test-secret"
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
  });

  describe("GET /api/jobs", () => {
    it("should get all active jobs", async () => {
      const response = await request(app).get("/api/jobs").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it("should filter jobs by search term", async () => {
      const response = await request(app)
        .get("/api/jobs?search=React")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain("React");
    });

    it("should filter jobs by location", async () => {
      const response = await request(app)
        .get("/api/jobs?location=New York")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].location).toContain("New York");
    });

    it("should filter jobs by job type", async () => {
      const response = await request(app)
        .get("/api/jobs?jobType=full-time")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].jobType).toBe("full-time");
    });

    it("should filter jobs by skills", async () => {
      const response = await request(app)
        .get("/api/jobs?skills=React,JavaScript")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should paginate results", async () => {
      const response = await request(app)
        .get("/api/jobs?page=1&limit=5")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe("GET /api/jobs/:id", () => {
    it("should get job by ID", async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJob._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Senior React Developer");
      expect(response.body.data.employer).toBeDefined();
    });

    it("should return 404 for non-existent job", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/jobs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Job not found");
    });
  });

  describe("POST /api/jobs", () => {
    it("should create a new job", async () => {
      const jobData = {
        title: "Frontend Developer",
        description: "We are looking for a frontend developer...",
        location: "San Francisco, CA",
        jobType: "full-time",
        salary: {
          min: 70000,
          max: 100000,
          currency: "USD",
        },
        skills: [
          { name: "JavaScript", required: true },
          { name: "CSS", required: true },
        ],
        requirements: {
          experience: "2+ years",
          education: "Bachelor's degree",
        },
        benefits: ["Health insurance", "Flexible hours"],
      };

      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send(jobData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Frontend Developer");
      expect(response.body.data.employer).toBe(testEmployer._id.toString());
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .post("/api/jobs")
        .send({ title: "Test Job" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid job data", async () => {
      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ title: "" }) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/jobs/:id/apply", () => {
    it("should apply to a job", async () => {
      const applicationData = {
        coverLetter: "I am interested in this position...",
        expectedSalary: 90000,
        availability: "Immediate",
        additionalInfo: "I have 3 years of React experience",
      };

      const response = await request(app)
        .post(`/api/jobs/${testJob._id}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(applicationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("pending");
      expect(response.body.data.applicant).toBe(testUser._id.toString());
    });

    it("should return 400 if already applied", async () => {
      // First application
      await request(app)
        .post(`/api/jobs/${testJob._id}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ coverLetter: "First application" });

      // Second application (should fail)
      const response = await request(app)
        .post(`/api/jobs/${testJob._id}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ coverLetter: "Second application" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already applied");
    });

    it("should return 404 for non-existent job", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/jobs/${fakeId}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ coverLetter: "Test" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/jobs/my/posted", () => {
    it("should get jobs posted by employer", async () => {
      const response = await request(app)
        .get("/api/jobs/my/posted")
        .set("Authorization", `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array for non-employer", async () => {
      const response = await request(app)
        .get("/api/jobs/my/posted")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/jobs/my/applications", () => {
    it("should get user applications", async () => {
      // First apply to a job
      await request(app)
        .post(`/api/jobs/${testJob._id}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ coverLetter: "Test application" });

      const response = await request(app)
        .get("/api/jobs/my/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return empty array when no applications", async () => {
      const response = await request(app)
        .get("/api/jobs/my/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("GET /api/jobs/recommendations", () => {
    it("should get job recommendations based on user skills", async () => {
      const response = await request(app)
        .get("/api/jobs/recommendations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it("should return empty array when no matching jobs", async () => {
      // Create a user with different skills
      const differentUser = new User({
        firstName: "Different",
        lastName: "User",
        email: "different@example.com",
        password: "password123",
        accountType: "job_seeker",
        skills: [{ name: "Python", proficiency: "Advanced", experience: 3 }],
      });
      await differentUser.save();

      const differentToken = jwt.sign(
        { userId: differentUser._id },
        process.env.JWT_SECRET || "test-secret"
      );

      const response = await request(app)
        .get("/api/jobs/recommendations")
        .set("Authorization", `Bearer ${differentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("PUT /api/jobs/:id", () => {
    it("should update job by employer", async () => {
      const updateData = {
        title: "Updated React Developer Position",
        description: "Updated job description...",
        salary: {
          min: 90000,
          max: 130000,
          currency: "USD",
        },
      };

      const response = await request(app)
        .put(`/api/jobs/${testJob._id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated React Developer Position");
    });

    it("should return 403 for non-employer", async () => {
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Title" })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent job", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/jobs/${fakeId}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ title: "Updated Title" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/jobs/:id", () => {
    it("should delete job by employer", async () => {
      const response = await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Job deleted successfully");
    });

    it("should return 403 for non-employer", async () => {
      const response = await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent job", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/jobs/${fakeId}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/jobs/:jobId/applications/:applicationId", () => {
    it("should update application status by employer", async () => {
      // First apply to a job
      const applyResponse = await request(app)
        .post(`/api/jobs/${testJob._id}/apply`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ coverLetter: "Test application" });

      const applicationId = applyResponse.body.data._id;

      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/applications/${applicationId}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ status: "reviewing" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("reviewing");
    });

    it("should return 403 for non-employer", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/jobs/${testJob._id}/applications/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "accepted" })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
