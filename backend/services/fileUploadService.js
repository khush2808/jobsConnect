const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const pdfParse = require("pdf-parse");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary storage configuration for different file types
 */
const createCloudinaryStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `job-portal/${folder}`,
      allowed_formats: allowedFormats,
      transformation:
        folder === "profile-pictures"
          ? [{ width: 400, height: 400, crop: "fill", quality: "auto" }]
          : undefined,
      resource_type: "auto",
    },
  });
};

/**
 * Memory storage for PDF processing
 */
const memoryStorage = multer.memoryStorage();

/**
 * File filter for different upload types
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };
};

/**
 * Profile picture upload configuration
 */
const profilePictureUpload = multer({
  storage: createCloudinaryStorage("profile-pictures", [
    "jpg",
    "jpeg",
    "png",
    "webp",
  ]),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: createFileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]),
});

/**
 * Resume upload configuration (PDF only)
 */
const resumeUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: createFileFilter(["application/pdf"]),
});

/**
 * Company logo upload configuration
 */
const companyLogoUpload = multer({
  storage: createCloudinaryStorage("company-logos", [
    "jpg",
    "jpeg",
    "png",
    "webp",
  ]),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
  fileFilter: createFileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]),
});

/**
 * Post media upload configuration
 */
const postMediaUpload = multer({
  storage: createCloudinaryStorage("post-media", [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "mp4",
    "mov",
  ]),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5,
  },
  fileFilter: createFileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
  ]),
});

/**
 * Upload resume to Cloudinary after PDF parsing
 */
const uploadResumeToCloudinary = async (buffer, filename) => {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      throw new Error("Cloudinary configuration is missing or invalid");
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "job-portal/resumes",
            resource_type: "raw",
            public_id: `resume_${Date.now()}`,
            format: "pdf",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    throw new Error(`Failed to upload resume to Cloudinary: ${error.message}`);
  }
};

/**
 * Parse PDF and extract text content
 */
const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error("Failed to parse PDF file");
  }
};

/**
 * Delete file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete file from storage");
  }
};

/**
 * Get file info from Cloudinary
 */
const getFileInfo = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error getting file info:", error);
    return null;
  }
};

/**
 * Middleware to handle upload errors
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field",
      });
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "File upload error",
  });
};

/**
 * Validate Cloudinary configuration
 */
const validateCloudinaryConfig = () => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Missing Cloudinary configuration: ${missing.join(", ")}`);
    return false;
  }

  // Test if Cloudinary credentials are valid
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Invalid Cloudinary credentials");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Cloudinary configuration error:", error);
    return false;
  }
};

/**
 * Optimize image transformation for different use cases
 */
const getImageTransformation = (type, options = {}) => {
  const transformations = {
    profile: {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
      quality: "auto",
      format: "webp",
    },
    thumbnail: {
      width: 150,
      height: 150,
      crop: "fill",
      quality: "auto",
      format: "webp",
    },
    logo: {
      width: 200,
      height: 200,
      crop: "fit",
      quality: "auto",
      format: "webp",
    },
    post: {
      width: 800,
      height: 600,
      crop: "limit",
      quality: "auto",
      format: "webp",
    },
  };

  return { ...transformations[type], ...options };
};

module.exports = {
  profilePictureUpload,
  resumeUpload,
  companyLogoUpload,
  postMediaUpload,
  uploadResumeToCloudinary,
  parsePDF,
  deleteFromCloudinary,
  getFileInfo,
  handleUploadError,
  validateCloudinaryConfig,
  getImageTransformation,
  cloudinary,
};
