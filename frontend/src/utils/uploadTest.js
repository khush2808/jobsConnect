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
  // Create a more complete PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Resume) Tj
0 -20 Td
(This is a test PDF file for resume upload testing.) Tj
0 -20 Td
(It contains sample text to verify PDF functionality.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
400
%%EOF`;

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
