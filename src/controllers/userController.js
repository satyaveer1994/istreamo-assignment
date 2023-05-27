const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password, email, user_name, gender, mobile, isPublic } =
      req.body;

    const checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      res
        .status(400)
        .json({ message: " email is already exist in our database" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      password: hashedPassword,
      email,
      user_name,
      gender,
      mobile,
      isPublic,
    });

    res
      .status(201)
      .send({ message: "User registered successfully", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

// Login Endpoint
const login = async (req, res) => {
  try {
    // Extract login data from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, "secret_key");

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
};

const followUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user_id: loggedInUserId } = req.user;
    // Check if the user to be followed exists
    const userToFollow = await userModel.findById(user_id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already being followed
    const isAlreadyFollowing = userToFollow.followers.includes(loggedInUserId);
    if (isAlreadyFollowing) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    // Update the follower and following lists
    userToFollow.followers.push(loggedInUserId);
    await userToFollow.save();

    const loggedInUser = await userModel.findById(loggedInUserId);
    loggedInUser.following.push(userToFollow._id);
    await loggedInUser.save();

    res.json({ message: "Successfully followed the user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unfollow User API endpoint

const unfollowUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user_id: loggedInUserId } = req.user;
    // Check if the user to be unfollowed exists
    const userToUnfollow = await userModel.findById(user_id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already not being followed
    const isNotFollowing = !userToUnfollow.followers.includes(loggedInUserId);
    if (isNotFollowing) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    // Update the follower and following lists
    userToUnfollow.followers.pull(loggedInUserId);
    await userToUnfollow.save();

    const loggedInUser = await userModel.findById(loggedInUserId);
    loggedInUser.following.pull(userToUnfollow._id);
    await loggedInUser.save();

    res.json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block User API endpoint

const blockUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user_id: loggedInUserId } = req.user;

    // Check if the user to be blocked exists
    const userToBlock = await userModel.findById(user_id);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already blocked
    const isAlreadyBlocked = userToBlock.blockedUsers.includes(loggedInUserId);
    if (isAlreadyBlocked) {
      return res
        .status(400)
        .json({ message: "You have already blocked this user" });
    }

    // Add the user to the blocked users list
    userToBlock.blockedUsers.push(loggedInUserId);
    await userToBlock.save();

    res.json({ message: "Successfully blocked the user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unblock User API endpoint

const unblockUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user_id: loggedInUserId } = req.user;
    // Check if the user to be unblocked exists
    const userToUnblock = await userModel.findById(user_id);
    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already not blocked
    const isNotBlocked = !userToUnblock.blockedUsers.includes(loggedInUserId);
    if (isNotBlocked) {
      return res
        .status(400)
        .json({ message: "You have not blocked this user" });
    }

    // Remove the user from the blocked users list
    userToUnblock.blockedUsers.pull(loggedInUserId);
    await userToUnblock.save();

    res.json({ message: "Successfully unblocked the user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Profile Details API endpoint

const getProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve user profile details
    const user = await userModel.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Follower Count API endpoint

const followCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve follower count using aggregation
    const followerCount = await userModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(user_id) } },
      { $project: { followerCount: { $size: "$followers" } } },
    ]);

    res.json({ followerCount: followerCount[0].followerCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Following Count API endpoint

const followingcount = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve following count using aggregation
    const followingCount = await userModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(user_id) } },
      { $project: { followingCount: { $size: "$following" } } },
    ]);

    res.json({ followingCount: followingCount[0].followingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit Profile API endpoint

const editProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    // Update the user's profile
    const updatedProfile = await userModel.findByIdAndUpdate(user_id, updates, {
      new: true,
    });

    res.json({ updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Unblock User API endpoint (Bonus)

const unblockUsers = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { current_user_id } = req.user;

    // Remove the blocked user from the current user's blockedUsers array
    const updatedUser = await userModel.findByIdAndUpdate(
      current_user_id,
      { $pull: { blockedUsers: user_id } },
      { new: true }
    );

    res.json({ updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  login,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getProfile,
  followCount,
  followingcount,
  editProfile,
  unblockUsers,
};
