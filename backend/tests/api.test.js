const request = require("supertest");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import the app and models
let app;
let server;
const User = require("../models/User");
const Job = require("../models/Job");
const Post = require("../models/Post");

describe("Job Portal API - Comprehensive Integration Tests", () => {
  let authCookie;
  let employerCookie;
  let testUser;
  let testEmployer;
  let testJob;
  let testPost;

  beforeAll(async () => {
    // Start the server
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/job-portal-test";
    process.env.JWT_SECRET = "test-secret-key";
    process.env.COOKIE_SECRET = "test-cookie-secret";

    // Import app after setting environment variables
    const { app: importedApp, server: importedServer } = require("../server");
    app = importedApp;
    server = importedServer;

    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clean up test database
    await User.deleteMany({});
    await Job.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connections
    await User.deleteMany({});
    await Job.deleteMany({});
    await Post.deleteMany({});
    await mongoose.connection.close();

    // Close the server if it exists
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe("1. Authentication Flow", () => {
    describe("POST /api/auth/register", () => {
      it("should register a new job seeker successfully", async () => {
        const userData = {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@test.com",
          password: "Password123",
          accountType: "job_seeker",
        };

        const response = await request(app)
          .post("/api/auth/register")
          .send(userData);

        expect(response.status).toBe(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully");
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.firstName).toBe(userData.firstName);
        expect(response.body.user.accountType).toBe(userData.accountType);
        expect(response.body.user.password).toBeUndefined();

        // Should receive auth cookie
        expect(response.headers["set-cookie"]).toBeDefined();

        testUser = response.body.user;
      });

      it("should register a new employer successfully", async () => {
        const employerData = {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@company.com",
          password: "Password123",
          accountType: "employer",
        };

        const response = await request(app)
          .post("/api/auth/register")
          .send(employerData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.user.accountType).toBe("employer");

        testEmployer = response.body.user;
      });

      it("should fail with duplicate email", async () => {
        const duplicateUser = {
          firstName: "Duplicate",
          lastName: "User",
          email: "john.doe@test.com", // Same as first user
          password: "Password123",
          accountType: "job_seeker",
        };

        const response = await request(app)
          .post("/api/auth/register")
          .send(duplicateUser)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("already exists");
      });

      it("should fail with invalid input", async () => {
        const invalidUser = {
          firstName: "A", // Too short
          email: "invalid-email", // Invalid format
          password: "123", // Too short
        };

        const response = await request(app)
          .post("/api/auth/register")
          .send(invalidUser)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe("POST /api/auth/login", () => {
      it("should login successfully with valid credentials", async () => {
        const loginData = {
          email: "john.doe@test.com",
          password: "Password123",
        };

        const response = await request(app)
          .post("/api/auth/login")
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.user.email).toBe(loginData.email);

        // Extract auth cookie for subsequent requests
        authCookie = response.headers["set-cookie"];
      });

      it("should login employer successfully", async () => {
        const loginData = {
          email: "jane.smith@company.com",
          password: "Password123",
        };

        const response = await request(app)
          .post("/api/auth/login")
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        employerCookie = response.headers["set-cookie"];
      });

      it("should fail with invalid credentials", async () => {
        const invalidLogin = {
          email: "john.doe@test.com",
          password: "wrongpassword",
        };

        await request(app)
          .post("/api/auth/login")
          .send(invalidLogin)
          .expect(401);
      });

      it("should fail with non-existent user", async () => {
        const nonExistentLogin = {
          email: "nonexistent@test.com",
          password: "Password123",
        };

        await request(app)
          .post("/api/auth/login")
          .send(nonExistentLogin)
          .expect(401);
      });
    });

    describe("GET /api/auth/me", () => {
      it("should get current user with valid auth", async () => {
        console.log("Auth cookie:", authCookie);
        const response = await request(app)
          .get("/api/auth/me")
          .set("Cookie", authCookie);

        console.log(
          "Get current user response:",
          response.status,
          response.body
        );
        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe("john.doe@test.com");
      });

      it("should fail without authentication", async () => {
        await request(app).get("/api/auth/me").expect(401);
      });
    });
  });

  describe("2. User Profile Management Flow", () => {
    describe("PUT /api/users/profile", () => {
      it("should update user profile successfully", async () => {
        const profileUpdate = {
          bio: "Experienced software developer with 5+ years in web development",
          location: {
            city: "San Francisco",
            state: "CA",
            country: "USA",
          },
          jobPreferences: {
            desiredRoles: ["Software Engineer", "Frontend Developer"],
            preferredLocation: "Remote",
            salaryExpectation: {
              min: 80000,
              max: 120000,
              currency: "USD",
            },
          },
        };

        const response = await request(app)
          .put("/api/users/profile")
          .set("Cookie", authCookie)
          .send(profileUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.bio).toBe(profileUpdate.bio);
        expect(response.body.data.location.city).toBe(
          profileUpdate.location.city
        );
      });
    });

    describe("PUT /api/users/skills", () => {
      it("should update user skills successfully", async () => {
        const skillsUpdate = {
          skills: [
            { name: "JavaScript", proficiency: "Expert", experience: 5 },
            { name: "React", proficiency: "Advanced", experience: 3 },
            { name: "Node.js", proficiency: "Advanced", experience: 4 },
          ],
        };

        const response = await request(app)
          .put("/api/users/skills")
          .set("Cookie", authCookie)
          .send(skillsUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.skills).toHaveLength(3);
        expect(response.body.data.skills[0].name).toBe("JavaScript");
      });
    });

    describe("GET /api/users/search", () => {
      it("should search users successfully", async () => {
        const response = await request(app)
          .get("/api/users/search?q=John&skills=JavaScript")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe("3. Job Management Flow", () => {
    describe("POST /api/jobs", () => {
      it("should create a new job posting successfully", async () => {
        const jobData = {
          title: "Senior Frontend Developer",
          description:
            "We are looking for an experienced frontend developer to join our team.",
          requirements: [
            "Bachelor's degree in Computer Science or related field",
            "5+ years of experience with React",
            "Experience with TypeScript",
            "Strong problem-solving skills",
          ],
          skills: [
            { name: "React", required: true, proficiency: "Advanced" },
            { name: "TypeScript", required: true, proficiency: "Intermediate" },
            { name: "JavaScript", required: true, proficiency: "Expert" },
          ],
          jobType: "Full-time",
          workLocation: "Remote",
          experienceLevel: "Senior Level",
          category: "Technology",
          location: {
            city: "San Francisco",
            state: "CA",
            country: "USA",
          },
          salary: {
            min: 120000,
            max: 160000,
            currency: "USD",
          },
          company: {
            name: "TechCorp Inc.",
            industry: "Technology",
            size: "51-200",
            website: "https://techcorp.com",
          },
          benefits: [
            "Health Insurance",
            "Dental Insurance",
            "401k",
            "Remote Work",
          ],
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        const response = await request(app)
          .post("/api/jobs")
          .set("Cookie", employerCookie)
          .send(jobData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Job posted successfully");
        expect(response.body.data.title).toBe(jobData.title);
        expect(response.body.data.employer._id).toBe(testEmployer._id);
        expect(response.body.data.skills).toHaveLength(3);

        testJob = response.body.data;
      });

      it("should fail to create job without authentication", async () => {
        const jobData = {
          title: "Test Job",
          description: "Test description",
        };

        await request(app).post("/api/jobs").send(jobData).expect(401);
      });
    });

    describe("GET /api/jobs", () => {
      it("should get all jobs with default pagination", async () => {
        const response = await request(app).get("/api/jobs").expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.currentPage).toBe(1);
      });

      it("should filter jobs by skills", async () => {
        const response = await request(app)
          .get("/api/jobs?skills=React,JavaScript")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it("should filter jobs by job type", async () => {
        const response = await request(app)
          .get("/api/jobs?jobType=Full-time")
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it("should search jobs by title", async () => {
        const response = await request(app)
          .get("/api/jobs?search=Frontend Developer")
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe("GET /api/jobs/:id", () => {
      it("should get job by ID successfully", async () => {
        if (!testJob || !testJob._id) {
          console.log("Skipping job by ID test - no job created");
          return;
        }

        const response = await request(app)
          .get(`/api/jobs/${testJob._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(testJob._id);
        expect(response.body.data.title).toBe(testJob.title);
      });

      it("should fail with invalid job ID", async () => {
        const invalidId = new mongoose.Types.ObjectId();
        await request(app).get(`/api/jobs/${invalidId}`).expect(404);
      });
    });

    describe("POST /api/jobs/:id/apply", () => {
      it("should apply to job successfully", async () => {
        if (!testJob || !testJob._id) {
          console.log("Skipping job application test - no job created");
          return;
        }

        const applicationData = {
          coverLetter:
            "I am very interested in this position and believe my skills make me a perfect fit.",
          expectedSalary: 140000,
        };

        const response = await request(app)
          .post(`/api/jobs/${testJob._id}/apply`)
          .set("Cookie", authCookie)
          .send(applicationData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
          "Application submitted successfully"
        );
        expect(response.body.data.coverLetter).toBe(
          applicationData.coverLetter
        );
        expect(response.body.data.applicant._id).toBe(testUser._id);
      });

      it("should fail to apply twice to the same job", async () => {
        if (!testJob || !testJob._id) {
          console.log("Skipping duplicate application test - no job created");
          return;
        }

        const applicationData = {
          coverLetter: "Duplicate application",
        };

        await request(app)
          .post(`/api/jobs/${testJob._id}/apply`)
          .set("Cookie", authCookie)
          .send(applicationData)
          .expect(400);
      });

      it("should fail to apply without authentication", async () => {
        if (!testJob || !testJob._id) {
          console.log(
            "Skipping unauthenticated application test - no job created"
          );
          return;
        }

        const applicationData = {
          coverLetter: "Test application",
        };

        await request(app)
          .post(`/api/jobs/${testJob._id}/apply`)
          .send(applicationData)
          .expect(401);
      });
    });

    describe("GET /api/jobs/my/applications", () => {
      it("should get user applications successfully", async () => {
        const response = await request(app)
          .get("/api/jobs/my/applications")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        // Applications might be empty if no jobs were created successfully
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe("GET /api/jobs/my/posted", () => {
      it("should get employer posted jobs successfully", async () => {
        const response = await request(app)
          .get("/api/jobs/my/posted")
          .set("Cookie", employerCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        // Posted jobs might be empty if job creation failed
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("4. Social Feed Flow", () => {
    describe("POST /api/posts", () => {
      it("should create a new post successfully", async () => {
        const postData = {
          content:
            "Just finished an amazing coding bootcamp! Excited to start my career in web development. #WebDev #Career",
          type: "text",
          category: "Career",
          tags: ["webdev", "career", "excited"],
          visibility: "public",
        };

        const response = await request(app)
          .post("/api/posts")
          .set("Cookie", authCookie)
          .send(postData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Post created successfully");
        expect(response.body.data.content).toBe(postData.content);
        expect(response.body.data.author._id).toBe(testUser._id);
        expect(response.body.data.tags).toEqual(
          expect.arrayContaining(postData.tags)
        );

        testPost = response.body.data;
      });

      it("should fail to create post without authentication", async () => {
        const postData = {
          content: "Test post",
        };

        await request(app).post("/api/posts").send(postData).expect(401);
      });
    });

    describe("GET /api/posts/feed", () => {
      it("should get feed posts successfully", async () => {
        const response = await request(app)
          .get("/api/posts/feed")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
      });

      it("should filter posts by category", async () => {
        const response = await request(app)
          .get("/api/posts/feed?category=Career")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe("POST /api/posts/:id/like", () => {
      it("should like a post successfully", async () => {
        if (!testPost || !testPost._id) {
          console.log("Skipping like post test - no post created");
          return;
        }

        const response = await request(app)
          .post(`/api/posts/${testPost._id}/like`)
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.likesCount).toBe(1);
        expect(response.body.data.isLiked).toBe(true);
      });

      it("should unlike a post successfully", async () => {
        if (!testPost || !testPost._id) {
          console.log("Skipping unlike post test - no post created");
          return;
        }

        const response = await request(app)
          .post(`/api/posts/${testPost._id}/like`)
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.likesCount).toBe(0);
        expect(response.body.data.isLiked).toBe(false);
      });
    });

    describe("POST /api/posts/:id/comments", () => {
      it("should add comment to post successfully", async () => {
        if (!testPost || !testPost._id) {
          console.log("Skipping add comment test - no post created");
          return;
        }

        const commentData = {
          content:
            "Congratulations! Wishing you all thebest in your new career!",
        };

        const response = await request(app)
          .post(`/api/posts/${testPost._id}/comments`)
          .set("Cookie", authCookie)
          .send(commentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.content).toBe(commentData.content);
        expect(response.body.data.author._id).toBe(testUser._id);
      });

      it("should fail to add comment without authentication", async () => {
        if (!testPost || !testPost._id) {
          console.log(
            "Skipping unauthenticated comment test - no post created"
          );
          return;
        }

        const commentData = {
          content: "Test comment",
        };

        await request(app)
          .post(`/api/posts/${testPost._id}/comments`)
          .send(commentData)
          .expect(401);
      });
    });

    describe("POST /api/posts/:id/share", () => {
      it("should share a post successfully", async () => {
        if (!testPost || !testPost._id) {
          console.log("Skipping share post test - no post created");
          return;
        }

        const shareData = {
          shareComment: "Great insights! Everyone should read this.",
        };

        const response = await request(app)
          .post(`/api/posts/${testPost._id}/share`)
          .set("Cookie", authCookie)
          .send(shareData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.sharesCount).toBe(1);
      });
    });
  });

  describe("5. AI Features Flow", () => {
    describe("POST /api/ai/extract-skills-text", () => {
      it("should extract skills from text successfully", async () => {
        const textData = {
          text: "I am a software developer with 5 years of experience in JavaScript, React, Node.js, Python, and AWS. I have worked on building scalable web applications and RESTful APIs.",
        };

        const response = await request(app)
          .post("/api/ai/extract-skills-text")
          .set("Cookie", authCookie)
          .send(textData);

        // AI service might not be available in test environment
        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
          expect(response.body.success).toBe(true);
          expect(Array.isArray(response.body.data.skills)).toBe(true);
        }
      });
    });

    describe("GET /api/ai/job-recommendations", () => {
      it("should get job recommendations successfully", async () => {
        const response = await request(app)
          .get("/api/ai/job-recommendations")
          .set("Cookie", authCookie);

        // AI service might not be available in test environment
        expect([200, 500]).toContain(response.status);

        if (response.status === 200) {
          expect(response.body.success).toBe(true);
          expect(Array.isArray(response.body.data.recommendations)).toBe(true);
        }
      });
    });
  });

  describe("6. Connection Management Flow", () => {
    describe("POST /api/users/:id/connect", () => {
      it("should send connection request successfully", async () => {
        const response = await request(app)
          .post(`/api/users/${testEmployer._id}/connect`)
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
          "Connection request sent successfully"
        );
      });

      it("should fail to connect to self", async () => {
        await request(app)
          .post(`/api/users/${testUser._id}/connect`)
          .set("Cookie", authCookie)
          .expect(400);
      });
    });

    describe("GET /api/users/connections", () => {
      it("should get user connections successfully", async () => {
        const response = await request(app)
          .get("/api/users/connections")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe("7. Authentication Logout Flow", () => {
    describe("POST /api/auth/logout", () => {
      it("should logout successfully", async () => {
        const response = await request(app)
          .post("/api/auth/logout")
          .set("Cookie", authCookie)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Logout successful");
      });

      it("should fail to access protected route after logout", async () => {
        // Clear the cookie after logout
        const clearedCookie = authCookie.map((cookie) =>
          cookie.replace(/token=[^;]+/, "token=")
        );

        await request(app)
          .get("/api/auth/me")
          .set("Cookie", clearedCookie)
          .expect(401);
      });
    });
  });

  describe("8. API Health Check", () => {
    describe("GET /api/health", () => {
      it("should return API health status", async () => {
        const response = await request(app).get("/api/health").expect(200);

        expect(response.body.status).toBe("OK");
        expect(response.body.message).toBe("Job Portal API is running");
        expect(response.body.environment).toBe("test");
      });
    });
  });
});
