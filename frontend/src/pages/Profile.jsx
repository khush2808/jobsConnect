import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../store/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
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
} from "lucide-react";

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [profileData, setProfileData] = useState({
    bio: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    jobPreferences: {
      desiredRoles: [],
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
        bio: user.bio || "",
        location: user.location || { city: "", state: "", country: "" },
        jobPreferences: user.jobPreferences || {
          desiredRoles: [],
          preferredLocation: "",
          salaryExpectation: { min: "", max: "", currency: "USD" },
        },
        skills: user.skills || [],
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await dispatch(updateUserProfile(profileData));
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;

    setProfileData({
      ...profileData,
      skills: [...profileData.skills, { ...newSkill }],
    });
    setNewSkill({ name: "", proficiency: "Intermediate", experience: 1 });
  };

  const handleRemoveSkill = (index) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((_, i) => i !== index),
    });
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;

    setProfileData({
      ...profileData,
      jobPreferences: {
        ...profileData.jobPreferences,
        desiredRoles: [...profileData.jobPreferences.desiredRoles, newRole],
      },
    });
    setNewRole("");
  };

  const handleRemoveRole = (index) => {
    setProfileData({
      ...profileData,
      jobPreferences: {
        ...profileData.jobPreferences,
        desiredRoles: profileData.jobPreferences.desiredRoles.filter(
          (_, i) => i !== index
        ),
      },
    });
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
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
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
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.accountType?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                {profileData.skills.map((skill, index) => (
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
                  {profileData.jobPreferences.desiredRoles.map(
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
                <span className="font-medium">{profileData.skills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Desired Roles
                </span>
                <span className="font-medium">
                  {profileData.jobPreferences.desiredRoles.length}
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
