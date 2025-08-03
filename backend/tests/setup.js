// Test setup file
require("dotenv").config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.MONGODB_URI =
  process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/job-portal-test";

// Mock Cloudinary for file upload tests
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
          public_id: "test-public-id",
        });
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
    api: {
      resource: jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
        public_id: "test-public-id",
      }),
    },
  },
}));

// Mock multer for file upload tests
jest.mock("multer", () => {
  const multer = jest.fn(() => ({
    single: jest.fn((fieldName) => (req, res, next) => {
      req.file = {
        fieldname: fieldName,
        originalname: "test-file.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("fake-image-data"),
        size: 1024,
      };
      next();
    }),
  }));

  // Add static methods to multer
  multer.memoryStorage = jest.fn(() => ({
    _handleFile: jest.fn((req, file, cb) => {
      req.file = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: "7bit",
        mimetype: file.mimetype,
        buffer: Buffer.from("fake-file-data"),
        size: 1024,
      };
      cb(null, req.file);
    }),
    _removeFile: jest.fn((req, file, cb) => cb(null)),
  }));

  multer.diskStorage = jest.fn(() => ({
    _handleFile: jest.fn((req, file, cb) => {
      req.file = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: "7bit",
        mimetype: file.mimetype,
        buffer: Buffer.from("fake-file-data"),
        size: 1024,
      };
      cb(null, req.file);
    }),
    _removeFile: jest.fn((req, file, cb) => cb(null)),
  }));

  return multer;
});

// Global test utilities
global.createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "password123",
    accountType: "job_seeker",
    ...userData,
  };

  const user = new User(defaultUser);
  await user.save();
  return user;
};

global.createAuthToken = (userId) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};
