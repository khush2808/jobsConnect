import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../store/authSlice";
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
  Bell,
  Shield,
  Palette,
  Upload,
  Camera,
  Save,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    connectionRequests: true,
    applicationUpdates: true,
    marketingEmails: false,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC",
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await dispatch(updateUser(profileData));
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (securityData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement password change API call
      // await api.put('/users/password', {
      //   currentPassword: securityData.currentPassword,
      //   newPassword: securityData.newPassword
      // });
      setSuccess("Password updated successfully!");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        "Failed to update password. Please check your current password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement notification settings API call
      // await api.put('/users/notifications', notifications);
      setSuccess("Notification settings updated successfully!");
    } catch (error) {
      setError("Failed to update notification settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppearanceUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement appearance settings API call
      // await api.put('/users/appearance', appearance);
      setSuccess("Appearance settings updated successfully!");
    } catch (error) {
      setError("Failed to update appearance settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement file upload API call
      // const response = await api.post(`/users/${type}`, formData);
      setSuccess(
        `${
          type === "profile-picture" ? "Profile picture" : "Resume"
        } updated successfully!`
      );
    } catch (error) {
      setError(`Failed to upload ${type}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a new profile picture
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, "profile-picture")
                          }
                          className="hidden"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </label>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
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
                      className="mt-1"
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
                      className="mt-1"
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
                    className="mt-1"
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none mt-1"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={securityData.newPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          newPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={securityData.confirmPassword}
                      onChange={(e) =>
                        setSecurityData({
                          ...securityData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Receive {key.toLowerCase().replace(/([A-Z])/g, " $1")}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize your app appearance and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <select
                    value={appearance.theme}
                    onChange={(e) =>
                      setAppearance({ ...appearance, theme: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={appearance.language}
                    onChange={(e) =>
                      setAppearance({ ...appearance, language: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    value={appearance.timezone}
                    onChange={(e) =>
                      setAppearance({ ...appearance, timezone: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="CST">Central Time</option>
                    <option value="MST">Mountain Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                </div>

                <Button onClick={handleAppearanceUpdate} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Appearance Settings"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
