// Test utility for file upload functionality
export const testFileUpload = async (file, type) => {
  const formData = new FormData();
  const fieldName = type === "resume" ? "resume" : "profilePicture";
  formData.append(fieldName, file);

  try {
    const response = await fetch(
      `http://localhost:5000/api/users/${
        type === "resume" ? "resume" : "profile-picture"
      }`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Upload test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Test file validation
export const validateFile = (file, type) => {
  const errors = [];

  // Check file type
  if (type === "resume" && file.type !== "application/pdf") {
    errors.push("Resume must be a PDF file");
  }

  if (type === "profile-picture" && !file.type.startsWith("image/")) {
    errors.push("Profile picture must be an image file");
  }

  // Check file size
  const maxSize = type === "resume" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum: ${maxSize / (1024 * 1024)}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

// Create a test PDF file
export const createTestPDF = () => {
  // This is a simple way to create a test PDF
  // In a real application, you'd want to use a proper PDF library
  const pdfContent =
    "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF";

  const blob = new Blob([pdfContent], { type: "application/pdf" });
  return new File([blob], "test-resume.pdf", { type: "application/pdf" });
};

// Create a test image file
export const createTestImage = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(0, 0, 100, 100);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "test-image.png", { type: "image/png" });
      resolve(file);
    }, "image/png");
  });
};
