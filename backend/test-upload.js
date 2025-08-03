require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

// Test the resume upload functionality
async function testResumeUpload() {
  try {
    console.log("Testing resume upload...");

    // Create a simple test PDF content
    const pdfContent =
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF";

    // Write test PDF to temp file
    const tempPdfPath = path.join(__dirname, "test-resume.pdf");
    fs.writeFileSync(tempPdfPath, pdfContent);

    // Create form data
    const formData = new FormData();
    formData.append("resume", fs.createReadStream(tempPdfPath));

    // Make request to upload endpoint
    const response = await axios.post(
      "http://localhost:5000/api/users/resume",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Cookie: "your-auth-cookie-here", // You'll need to add a valid auth cookie
        },
      }
    );

    console.log("Upload successful:", response.data);

    // Clean up temp file
    fs.unlinkSync(tempPdfPath);
  } catch (error) {
    console.error("Upload test failed:", error.response?.data || error.message);
  }
}

// Test the profile picture upload functionality
async function testProfilePictureUpload() {
  try {
    console.log("Testing profile picture upload...");

    // Create a simple test image (1x1 pixel PNG)
    const pngContent = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0x00, 0x00,
      0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Write test PNG to temp file
    const tempPngPath = path.join(__dirname, "test-image.png");
    fs.writeFileSync(tempPngPath, pngContent);

    // Create form data
    const formData = new FormData();
    formData.append("profilePicture", fs.createReadStream(tempPngPath));

    // Make request to upload endpoint
    const response = await axios.post(
      "http://localhost:5000/api/users/profile-picture",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Cookie: "your-auth-cookie-here", // You'll need to add a valid auth cookie
        },
      }
    );

    console.log("Upload successful:", response.data);

    // Clean up temp file
    fs.unlinkSync(tempPngPath);
  } catch (error) {
    console.error("Upload test failed:", error.response?.data || error.message);
  }
}

// Test Cloudinary configuration
function testCloudinaryConfig() {
  console.log("Testing Cloudinary configuration...");

  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing Cloudinary configuration:", missing);
    return false;
  }

  console.log("Cloudinary configuration looks good!");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log(
    "API Key:",
    process.env.CLOUDINARY_API_KEY
      ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
      : "Not set"
  );
  console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET
      ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
      : "Not set"
  );

  return true;
}

// Run tests
async function runTests() {
  console.log("=== File Upload Test ===");

  // Test Cloudinary config first
  if (!testCloudinaryConfig()) {
    console.log(
      "Skipping upload tests due to missing Cloudinary configuration"
    );
    return;
  }

  // Note: These tests require authentication, so they'll likely fail
  // but they help verify the endpoint structure
  await testResumeUpload();
  await testProfilePictureUpload();

  console.log("=== Test Complete ===");
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testResumeUpload,
  testProfilePictureUpload,
  testCloudinaryConfig,
};
