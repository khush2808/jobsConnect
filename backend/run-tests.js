#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🧪 Running Backend Tests...\n");

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.MONGODB_URI_TEST = "mongodb://localhost:27017/job-portal-test";

try {
  // Run all tests
  console.log("📋 Running User Routes Tests...");
  execSync("npx jest tests/userRoutes.test.js --verbose", {
    stdio: "inherit",
    cwd: path.join(__dirname),
  });

  console.log("\n📋 Running Job Routes Tests...");
  execSync("npx jest tests/jobRoutes.test.js --verbose", {
    stdio: "inherit",
    cwd: path.join(__dirname),
  });

  console.log("\n📋 Running Post Routes Tests...");
  execSync("npx jest tests/postRoutes.test.js --verbose", {
    stdio: "inherit",
    cwd: path.join(__dirname),
  });

  console.log("\n✅ All tests completed successfully!");
  console.log("\n📊 Test Summary:");
  console.log(
    "   - User Routes: Profile management, file uploads, connections"
  );
  console.log("   - Job Routes: Job CRUD, applications, recommendations");
  console.log("   - Post Routes: Social features, likes, comments, shares");
} catch (error) {
  console.error("\n❌ Tests failed:", error.message);
  process.exit(1);
}
