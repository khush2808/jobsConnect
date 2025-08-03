import api from "../lib/api";

class FileUploadService {
  /**
   * Upload profile picture
   * @param {File} file - Image file
   * @returns {Promise<Object>} Upload response
   */
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.post("/users/profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Upload resume
   * @param {File} file - PDF file
   * @returns {Promise<Object>} Upload response
   */
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/users/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Upload post media
   * @param {File[]} files - Array of media files
   * @returns {Promise<Object>} Upload response
   */
  async uploadPostMedia(files) {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append("media", file);
    });

    const response = await api.post("/posts/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Upload company logo
   * @param {File} file - Image file
   * @returns {Promise<Object>} Upload response
   */
  async uploadCompanyLogo(file) {
    const formData = new FormData();
    formData.append("company-logo", file);

    const response = await api.post("/users/company-logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Delete profile picture
   * @returns {Promise<Object>} Delete response
   */
  async deleteProfilePicture() {
    const response = await api.delete("/users/profile-picture");
    return response.data;
  }

  /**
   * Extract skills from resume
   * @param {File} file - PDF file
   * @returns {Promise<Object>} Skills extraction response
   */
  async extractSkillsFromResume(file) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/ai/extract-skills-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {string[]} allowedTypes - Array of allowed MIME types
   * @returns {boolean} Whether file type is valid
   */
  validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSize - Maximum size in bytes
   * @returns {boolean} Whether file size is valid
   */
  validateFileSize(file, maxSize) {
    return file.size <= maxSize;
  }

  /**
   * Get file size in human readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Human readable size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Create a preview URL for image files
   * @param {File} file - Image file
   * @returns {string} Preview URL
   */
  createPreviewURL(file) {
    if (!file.type.startsWith("image/")) {
      return null;
    }

    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   * @param {string} url - Preview URL to revoke
   */
  revokePreviewURL(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}

export default new FileUploadService();
