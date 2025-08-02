const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("Resume Upload API Tests", () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      firstName: "Test",
      lastName: "User",
      email: "test.resume@example.com",
      password: "password123",
      accountType: "job_seeker",
    });

    // Login to get auth token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test.resume@example.com",
      password: "password123",
    });

    authToken = loginResponse.headers["set-cookie"][0];
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
    await mongoose.connection.close();
  });

  describe("POST /api/users/resume", () => {
    it("should upload resume successfully", async () => {
      // Create a mock PDF buffer
      const mockPdfBuffer = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Resume Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF"
      );

      const response = await request(app)
        .post("/api/users/resume")
        .set("Cookie", authToken)
        .attach("resume", mockPdfBuffer, "test-resume.pdf");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Resume uploaded successfully");
      expect(response.body.resume).toBeDefined();
      expect(response.body.resume.url).toBeDefined();
      expect(response.body.resume.filename).toBe("test-resume.pdf");
      expect(response.body.resume.uploadedAt).toBeDefined();
      expect(response.body.resume.preview).toBeDefined();
    });

    it("should fail without authentication", async () => {
      const mockPdfBuffer = Buffer.from("%PDF-1.4\nTest content");

      const response = await request(app)
        .post("/api/users/resume")
        .attach("resume", mockPdfBuffer, "test-resume.pdf");

      expect(response.status).toBe(401);
    });

    it("should fail with non-PDF file", async () => {
      const mockTextBuffer = Buffer.from("This is not a PDF");

      const response = await request(app)
        .post("/api/users/resume")
        .set("Cookie", authToken)
        .attach("resume", mockTextBuffer, "test.txt");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without file", async () => {
      const response = await request(app)
        .post("/api/users/resume")
        .set("Cookie", authToken);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No resume file uploaded");
    });
  });

  describe("GET /api/users/resume", () => {
    it("should get resume info successfully", async () => {
      const response = await request(app)
        .get("/api/users/resume")
        .set("Cookie", authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.resume).toBeDefined();
      expect(response.body.resume.url).toBeDefined();
      expect(response.body.resume.filename).toBeDefined();
      expect(response.body.resume.uploadedAt).toBeDefined();
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/api/users/resume");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/resume", () => {
    it("should remove resume successfully", async () => {
      const response = await request(app)
        .delete("/api/users/resume")
        .set("Cookie", authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Resume removed successfully");
    });

    it("should fail without authentication", async () => {
      const response = await request(app).delete("/api/users/resume");

      expect(response.status).toBe(401);
    });
  });
});
