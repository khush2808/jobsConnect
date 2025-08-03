import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserProfile,
  uploadProfilePicture,
  uploadResume,
  removeProfilePicture,
  removeResume,
  getResume,
} from "../store/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FileUpload } from "../components/ui/FileUpload";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";

import {
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Plus,
  X,
  Edit,
  Save,
  Camera,
  Upload,
  Trash2,
  FileText,
  Mail,
  Phone,
  Download,
  Eye,
} from "lucide-react";

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    jobPreferences: {
      roles: [], // Changed from desiredRoles to match backend
      preferredLocation: "",
      salaryExpectation: {
        min: "",
        max: "",
        currency: "USD",
      },
    },
    skills: [],
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    proficiency: "Intermediate",
    experience: 1,
  });

  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || { city: "", state: "", country: "" },
        jobPreferences: {
          roles: user.jobPreferences?.roles || [], // Use roles instead of desiredRoles
          preferredLocation: user.jobPreferences?.preferredLocation || "",
          salaryExpectation: user.jobPreferences?.salaryExpectation || {
            min: "",
            max: "",
            currency: "USD",
          },
        },
        skills: user.skills || [],
      });
    }
  }, [user]);

  // Fetch resume data when component loads
  useEffect(() => {
    if (user && !user.resume) {
      setIsResumeLoading(true);
      dispatch(getResume())
        .catch(() => {
          // Silently fail if resume doesn't exist
        })
        .finally(() => {
          setIsResumeLoading(false);
        });
    }
  }, [user, dispatch]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Transform the data to match backend expectations
      const updateData = {
        ...profileData,
        jobPreferences: {
          roles: profileData.jobPreferences.roles, // Keep as roles for backend
          remoteWork: profileData.jobPreferences.preferredLocation, // Map to remoteWork
          salaryRange: profileData.jobPreferences.salaryExpectation, // Map to salaryRange
        },
      };

      await dispatch(updateUserProfile(updateData));
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (type === "resume" && file.type !== "application/pdf") {
      setError("Please upload a PDF file for resume");
      return;
    }

    if (type === "profile-picture" && !file.type.startsWith("image/")) {
      setError("Please upload an image file for profile picture");
      return;
    }

    // Validate file size (10MB for resume, 5MB for images)
    const maxSize = type === "resume" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      );
      return;
    }

    setIsFileLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === "profile-picture") {
        await dispatch(uploadProfilePicture(file));
        setSuccess("Profile picture uploaded successfully!");
      } else if (type === "resume") {
        await dispatch(uploadResume(file));
        setSuccess("Resume uploaded successfully!");
      }
    } catch (error) {
      setError(
        `Failed to upload ${type}. ${error.message || "Please try again."}`
      );
    } finally {
      setIsFileLoading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  const handleRemoveFile = async (type) => {
    setIsFileLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === "profile-picture") {
        await dispatch(removeProfilePicture());
        setSuccess("Profile picture removed successfully!");
      } else if (type === "resume") {
        await dispatch(removeResume());
        setSuccess("Resume removed successfully!");
      }
    } catch (error) {
      setError(`Failed to remove ${type}. Please try again.`);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;

    setProfileData({
      ...profileData,
      skills: [...(profileData.skills || []), { ...newSkill }],
    });
    setNewSkill({ name: "", proficiency: "Intermediate", experience: 1 });
  };

  const handleRemoveSkill = (index) => {
    setProfileData({
      ...profileData,
      skills: (profileData.skills || []).filter((_, i) => i !== index),
    });
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;

    setProfileData({
      ...profileData,
      jobPreferences: {
        ...profileData.jobPreferences,
        roles: [...(profileData.jobPreferences.roles || []), newRole], // Use roles instead of desiredRoles
      },
    });
    setNewRole("");
  };

  const handleRemoveRole = (index) => {
    setProfileData({
      ...profileData,
      jobPreferences: {
        ...profileData.jobPreferences,
        roles: (profileData.jobPreferences.roles || []).filter(
          // Use roles instead of desiredRoles
          (_, i) => i !== index
        ),
      },
    });
  };

  const handleDownloadFile = (url, filename, type) => {
    if (!url) {
      setError(`${type} not available for download`);
      return;
    }

    try {
      // For Cloudinary URLs, we need special handling
      if (url.includes("cloudinary.com")) {
        // For PDFs, use the backend endpoint
        if (type === "Resume") {
          const downloadUrl = `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
          }/users/resume/file`;

          // Create a temporary link for download
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename || `${type.toLowerCase()}_${Date.now()}.pdf`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSuccess(`${type} download started`);
        } else {
          // For images, open in new tab
          window.open(url, "_blank");
          setSuccess(`${type} opened in new tab`);
        }
      } else {
        // For non-Cloudinary URLs, use standard approach
        if (url.startsWith("http")) {
          window.open(url, "_blank");
          setSuccess(`${type} opened in new tab`);
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.download = filename || `${type.toLowerCase()}_${Date.now()}`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSuccess(`${type} download started`);
        }
      }
    } catch (error) {
      setError(`Failed to download ${type.toLowerCase()}`);
    }
  };

  const handleViewResume = () => {
    if (!user.resume?.url) {
      setError("Resume not available for viewing");
      return;
    }

    try {
      // Use the backend endpoint to serve the file
      const pdfUrl = `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
      }/users/resume/file`;

      // Try to open in new tab
      const newWindow = window.open(pdfUrl, "_blank");
      if (!newWindow) {
        setError("Popup blocked. Please allow popups for this site.");
      } else {
        setSuccess("Resume opened in new tab");
      }
    } catch (error) {
      setError("Failed to open resume. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional profile and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-green-600">
              <p className="font-medium">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-destructive">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your personal and professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-primary-foreground" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleFileUpload(e, "profile-picture");
                        }}
                        className="hidden"
                        disabled={isFileLoading}
                        id="profile-picture-input"
                      />
                      <Button
                        size="sm"
                        className="h-6 w-6 p-0 bg-primary hover:bg-primary/90"
                        disabled={isFileLoading}
                        title="Upload profile picture"
                        onClick={() => {
                          document
                            .getElementById("profile-picture-input")
                            .click();
                        }}
                      >
                        {isFileLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Upload className="h-3 w-3" />
                        )}
                      </Button>
                      {user.profilePicture && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveFile("profile-picture")}
                          title="Remove profile picture"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.accountType?.replace("_", " ")}
                  </p>
                  {user.profilePicture && (
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadFile(
                            user.profilePicture.url,
                            "profile_picture.jpg",
                            "Profile Picture"
                          )
                        }
                        disabled={isFileLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {isFileLoading && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          Processing...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="First Name"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="Last Name"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="Email"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Phone"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    type="text"
                    value={profileData.location.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: {
                          ...profileData.location,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="City"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    type="text"
                    value={profileData.location.state}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: {
                          ...profileData.location,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="State"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    type="text"
                    value={profileData.location.country}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: {
                          ...profileData.location,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="Country"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your resume (PDF format)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  {isResumeLoading ? (
                    <div>
                      <h3 className="font-medium">Loading resume...</h3>
                      <p className="text-sm text-muted-foreground">
                        Checking for existing resume
                      </p>
                    </div>
                  ) : user.resume?.url ? (
                    <div>
                      <h3 className="font-medium">Current Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.resume.filename || "Resume.pdf"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded:{" "}
                        {user.resume.uploadedAt
                          ? new Date(
                              user.resume.uploadedAt
                            ).toLocaleDateString()
                          : "Recently"}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadFile(
                              user.resume.url,
                              user.resume.filename,
                              "Resume"
                            )
                          }
                          disabled={isFileLoading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewResume}
                          disabled={isFileLoading}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = user.resume.url;
                            // Try to open in iframe or embed
                            let embedUrl = url;
                            if (url.includes("cloudinary.com")) {
                              embedUrl =
                                url +
                                (url.includes("?") ? "&" : "?") +
                                "fl_attachment:false&f_pdf";
                            }
                            window.open(embedUrl, "_blank");
                          }}
                          disabled={isFileLoading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Direct View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Create an iframe to view PDF
                            const modal = document.createElement("div");
                            modal.style.cssText = `
                              position: fixed;
                              top: 0;
                              left: 0;
                              width: 100%;
                              height: 100%;
                              background: rgba(0,0,0,0.8);
                              z-index: 9999;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                            `;

                            const iframe = document.createElement("iframe");
                            iframe.src = user.resume.url;
                            iframe.style.cssText = `
                              width: 90%;
                              height: 90%;
                              border: none;
                              border-radius: 8px;
                            `;

                            const closeBtn = document.createElement("button");
                            closeBtn.textContent = "×";
                            closeBtn.style.cssText = `
                              position: absolute;
                              top: 20px;
                              right: 20px;
                              background: #ff4444;
                              color: white;
                              border: none;
                              border-radius: 50%;
                              width: 40px;
                              height: 40px;
                              font-size: 24px;
                              cursor: pointer;
                            `;
                            closeBtn.onclick = () =>
                              document.body.removeChild(modal);

                            modal.appendChild(iframe);
                            modal.appendChild(closeBtn);
                            document.body.appendChild(modal);
                          }}
                          disabled={isFileLoading}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Modal View
                        </Button>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFile("resume")}
                            disabled={isFileLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                        {isFileLoading && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            Processing...
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">Resume Not Added Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload your resume to increase your chances of getting
                        hired
                      </p>
                      {isEditing && (
                        <div className="mt-4">
                          <FileUpload
                            onFileSelect={(file) => {
                              if (file) {
                                const event = { target: { files: [file] } };
                                handleFileUpload(event, "resume");
                              }
                            }}
                            accept=".pdf"
                            maxSize={10 * 1024 * 1024} // 10MB
                            fileType="pdf"
                            disabled={isFileLoading}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Add your technical and professional skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      placeholder="Skill name"
                    />
                  </div>
                  <div>
                    <select
                      value={newSkill.proficiency}
                      onChange={(e) =>
                        setNewSkill({
                          ...newSkill,
                          proficiency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={newSkill.experience}
                      onChange={(e) =>
                        setNewSkill({
                          ...newSkill,
                          experience: parseInt(e.target.value),
                        })
                      }
                      placeholder="Years"
                      min="0"
                    />
                  </div>
                  <Button onClick={handleAddSkill} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(profileData.skills || []).map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1 bg-secondary rounded-full"
                  >
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({skill.proficiency}, {skill.experience}y)
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                Set your career goals and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Desired Roles</label>
                {isEditing && (
                  <div className="flex space-x-2 mt-2">
                    <Input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="Add desired role"
                      className="flex-1"
                    />
                    <Button onClick={handleAddRole}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profileData.jobPreferences.roles || []).map(
                    (role, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        <span className="text-sm">{role}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveRole(index)}
                            className="text-primary hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Preferred Location
                </label>
                <select
                  value={profileData.jobPreferences.preferredLocation}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      jobPreferences: {
                        ...profileData.jobPreferences,
                        preferredLocation: e.target.value,
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={!isEditing}
                >
                  <option value="">Select location preference</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Salary Expectations
                </label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Input
                      type="number"
                      value={profileData.jobPreferences.salaryExpectation.min}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          jobPreferences: {
                            ...profileData.jobPreferences,
                            salaryExpectation: {
                              ...profileData.jobPreferences.salaryExpectation,
                              min: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Minimum salary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={profileData.jobPreferences.salaryExpectation.max}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          jobPreferences: {
                            ...profileData.jobPreferences,
                            salaryExpectation: {
                              ...profileData.jobPreferences.salaryExpectation,
                              max: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Maximum salary"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Skills</span>
                <span className="font-medium">
                  {profileData.skills?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Desired Roles
                </span>
                <span className="font-medium">
                  {profileData.jobPreferences.roles?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Account Type
                </span>
                <span className="font-medium capitalize">
                  {user.accountType?.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resume</span>
                <span className="font-medium">
                  {user.resume?.url ? "Uploaded" : "Not added yet"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={handleProfileUpdate}
                  className="w-full"
                  disabled={isUpdating}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
