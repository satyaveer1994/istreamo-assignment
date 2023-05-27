const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const { validationResult } = require("express-validator");
const multer = require("multer");
// Create a new post
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    });
    const upload = multer({ storage });
    upload.fields([
      { name: "images", maxCount: 5 },
      { name: "videos", maxCount: 1 },
    ]);
    const { text, isPublic, hashtags, friendTags } = req.body;
    const { images, videos } = req.files;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await postModel.create({
      user: userId,
      text,
      images: images ? images.map((image) => image.path) : [],
      videos: videos ? videos[0].path : "",
      isPublic,
      hashtags,
      friendTags,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { text } = req.body;
    const userId = req.user.id;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(200).json({ message: "Comment added successfully", comment });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// Add a sub-comment to a comment
const addSubComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { text } = req.body;
    const userId = req.user.id;

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const subComment = {
      user: userId,
      text,
    };

    comment.subComments.push(subComment);
    await post.save();

    res
      .status(200)
      .json({ message: "Sub-comment added successfully", subComment });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

const likePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    // Check if the post exists and is not deleted
    const post = await postModel.findOne({ _id: post_id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const hasLiked = post.likes.includes(user_id);
    if (hasLiked) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    // Add the user to the likes list
    post.likes.push(user_id);
    await post.save();

    res.json({ message: "Post liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Post API endpoint

const deleteOwnPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    // Check if the post exists and is not deleted
    const post = await postModel.findOne({ _id: post_id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is authorized to delete the post
    if (post.user_id !== user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Soft delete the post
    post.isDeleted = true;
    await post.save();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// List Public Posts (Latest Uploaded) API endpoint

const explorePublicPost = async (req, res) => {
  try {
    // Retrieve public posts, sorted by the latest upload date
    const publicPosts = await postModel.aggregate([
      { $match: { privacy: "public" } },
      { $sort: { uploadDate: -1 } },
    ]);

    // Check if the current user liked each post and add the liked status to the response
    const { user_id } = req.user;
    for (let i = 0; i < publicPosts.length; i++) {
      const post = publicPosts[i];
      const isLiked = post.likes.includes(user_id);
      post.isLiked = isLiked;
    }

    res.json({ publicPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Random Post API endpoint

const exploreRandomPost = async (req, res) => {
  try {
    // Retrieve a random post
    const randomPost = await postModel.aggregate([{ $sample: { size: 1 } }]);

    res.json({ randomPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Posts (Not Blocked Users) API endpoint

const explorePostNotBlockedUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    // Retrieve posts from users who are not blocked by the current user
    const notBlockedPosts = await postModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.blockedUsers": { $ne: mongoose.Types.ObjectId(user_id) },
        },
      },
    ]);

    res.json({ notBlockedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// List Posts Liked by User API endpoint

const postLikedByUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    // Retrieve posts that are liked by the current user
    const likedPosts = await postModel.aggregate([
      { $match: { likes: mongoose.Types.ObjectId(user_id) } },
    ]);

    res.json({ likedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// List My Posts API endpoint

const listMyPost = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Retrieve posts that belong to the current user
    const myPosts = await postModel.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(user_id) } },
    ]);

    res.json({ myPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit Post API endpoint

const editPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const updates = req.body;

    // Update the post
    const updatedPost = await postModel.findByIdAndUpdate(post_id, updates, {
      new: true,
    });

    res.json({ updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Post (Soft Delete) API endpoint

const deletePost = async (req, res) => {
  try {
    const { post_id } = req.params;

    // Soft delete the post by marking it as deleted
    const deletedPost = await postModel.findByIdAndUpdate(
      post_id,
      { isDeleted: true },
      { new: true }
    );

    res.json({ deletedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get Post Count API endpoint

const countPost = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve post count using aggregation
    const postCount = await postModel.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(user_id) } },
      { $count: "postCount" },
    ]);

    res.json({ postCount: postCount[0].postCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Users who Liked My Posts API endpoint

const likedMyPost = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve users who liked the posts using aggregation
    const likedUsers = await postModel.aggregate([
      { $match: { likes: mongoose.Types.ObjectId(user_id) } },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likedUsers",
        },
      },
      { $unwind: "$likedUsers" },
      { $project: { _id: 0, likedUser: "$likedUsers" } },
    ]);

    res.json({ likedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPost,
  addComment,
  addSubComment,
  likePost,
  deleteOwnPost,
  explorePublicPost,
  exploreRandomPost,
  explorePostNotBlockedUser,
  postLikedByUser,
  listMyPost,
  countPost,
  likedMyPost,
  editPost,
  deletePost,
};
