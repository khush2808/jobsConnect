const User = require("../models/User");
const {
  profilePictureUpload,
  deleteFromCloudinary,
} = require("../services/fileUploadService");

/**
 * Get user profile by ID
 * @route GET /api/users/:id
 * @access Public
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("connections.user", "firstName lastName profilePicture")
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationToken"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only show full profile if user is viewing their own or they're connected
    const isOwnProfile = req.user && req.user._id.toString() === id;
    const isConnected =
      req.user &&
      user.connections.some(
        (conn) =>
          conn.user._id.toString() === req.user._id.toString() &&
          conn.status === "accepted"
      );

    if (!isOwnProfile && !isConnected) {
      // Limited public profile
      const publicProfile = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        location: user.location,
        skills: user.skills,
        connectionCount: user.connectionCount,
        accountType: user.accountType,
        companyInfo: user.companyInfo,
        createdAt: user.createdAt,
      };

      return res.status(200).json({
        success: true,
        user: publicProfile,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving user profile",
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.isEmailVerified;
    delete updates.connections;

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

/**
 * Upload profile picture
 * @route POST /api/users/profile-picture
 * @access Private
 */
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // Handle file upload
    profilePictureUpload.single("profilePicture")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No profile picture uploaded",
        });
      }

      try {
        const user = await User.findById(userId);

        // Delete old profile picture if exists
        if (user.profilePicture && user.profilePicture.public_id) {
          try {
            await deleteFromCloudinary(user.profilePicture.public_id);
          } catch (deleteError) {
            console.warn("Failed to delete old profile picture:", deleteError);
          }
        }

        // Update user with new profile picture
        user.profilePicture = {
          url: req.file.path,
          public_id: req.file.filename,
        };

        await user.save();

        res.status(200).json({
          success: true,
          message: "Profile picture uploaded successfully",
          profilePicture: user.profilePicture,
        });
      } catch (dbError) {
        console.error("Database error during profile picture upload:", dbError);
        res.status(500).json({
          success: false,
          message: "Failed to save profile picture",
        });
      }
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error uploading profile picture",
    });
  }
};

/**
 * Remove profile picture
 * @route DELETE /api/users/profile-picture
 * @access Private
 */
const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.profilePicture || !user.profilePicture.public_id) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to remove",
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(user.profilePicture.public_id);
    } catch (deleteError) {
      console.warn("Failed to delete from Cloudinary:", deleteError);
    }

    // Remove from database
    user.profilePicture = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing profile picture",
    });
  }
};

/**
 * Add/update skills
 * @route PUT /api/users/skills
 * @access Private
 */
const updateSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    // Validate skills format
    const validSkills = skills.filter(
      (skill) =>
        skill.name &&
        typeof skill.name === "string" &&
        ["Beginner", "Intermediate", "Advanced", "Expert"].includes(
          skill.proficiency || "Intermediate"
        )
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { skills: validSkills } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      data: {
        skills: user.skills,
      },
    });
  } catch (error) {
    console.error("Update skills error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating skills",
    });
  }
};

/**
 * Search users
 * @route GET /api/users/search
 * @access Private
 */
const searchUsers = async (req, res) => {
  try {
    const {
      q,
      skills,
      location,
      accountType,
      page = 1,
      limit = 10,
    } = req.query;
    const currentUserId = req.user._id;

    // Build search query
    const searchQuery = {
      _id: { $ne: currentUserId }, // Exclude current user
      isActive: true,
    };

    // Text search
    if (q) {
      searchQuery.$or = [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { "companyInfo.name": { $regex: q, $options: "i" } },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
      searchQuery["skills.name"] = {
        $in: skillsArray.map((s) => new RegExp(s, "i")),
      };
    }

    // Location filter
    if (location) {
      searchQuery.$or = searchQuery.$or || [];
      searchQuery.$or.push(
        { "location.city": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } }
      );
    }

    // Account type filter
    if (accountType) {
      searchQuery.accountType = accountType;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const users = await User.find(searchQuery)
      .select(
        "firstName lastName fullName bio profilePicture location skills accountType companyInfo connectionCount createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching users",
    });
  }
};

/**
 * Send connection request
 * @route POST /api/users/:id/connect
 * @access Private
 */
const sendConnectionRequest = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send connection request to yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if connection already exists
    const existingConnection = targetUser.connections.find(
      (conn) => conn.user.toString() === currentUserId.toString()
    );

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "Already connected with this user",
        });
      } else if (existingConnection.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Connection request already sent",
        });
      }
    }

    // Add connection request
    targetUser.connections.push({
      user: currentUserId,
      status: "pending",
    });

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Connection request sent successfully",
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error sending connection request",
    });
  }
};

/**
 * Respond to connection request
 * @route PUT /api/users/connections/:id
 * @access Private
 */
const respondToConnectionRequest = async (req, res) => {
  try {
    const { id: connectionId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const currentUserId = req.user._id;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "reject"',
      });
    }

    const user = await User.findById(currentUserId);
    const connection = user.connections.id(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Connection request has already been processed",
      });
    }

    // Update connection status
    connection.status = action === "accept" ? "accepted" : "rejected";

    // If accepted, add reverse connection
    if (action === "accept") {
      const requesterUser = await User.findById(connection.user);
      requesterUser.connections.push({
        user: currentUserId,
        status: "accepted",
      });
      await requesterUser.save();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Connection request ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Respond to connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error responding to connection request",
    });
  }
};

/**
 * Get user connections
 * @route GET /api/users/connections
 * @access Private
 */
const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = "accepted" } = req.query;

    const user = await User.findById(userId).populate({
      path: "connections.user",
      select:
        "firstName lastName fullName profilePicture bio accountType location skills",
      match: status ? {} : undefined,
    });

    const connections = user.connections
      .filter((conn) => conn.status === status)
      .map((conn) => ({
        _id: conn._id,
        user: conn.user,
        status: conn.status,
        connectedAt: conn.connectedAt,
      }));

    res.status(200).json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("Get connections error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving connections",
    });
  }
};

/**
 * Remove connection
 * @route DELETE /api/users/connections/:id
 * @access Private
 */
const removeConnection = async (req, res) => {
  try {
    const { id: connectionId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    const connection = user.connections.id(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    const otherUserId = connection.user;

    // Remove connection from current user
    user.connections.pull(connectionId);
    await user.save();

    // Remove reverse connection
    const otherUser = await User.findById(otherUserId);
    if (otherUser) {
      const reverseConnection = otherUser.connections.find(
        (conn) => conn.user.toString() === currentUserId.toString()
      );
      if (reverseConnection) {
        otherUser.connections.pull(reverseConnection._id);
        await otherUser.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove connection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing connection",
    });
  }
};

module.exports = {
  getUserById,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  updateSkills,
  searchUsers,
  sendConnectionRequest,
  respondToConnectionRequest,
  getConnections,
  removeConnection,
};
