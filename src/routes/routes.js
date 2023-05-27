const express = require("express");
const router = express.Router();

const { registerValidationRules } = require("../validators/registerValidator");
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");

router.post("/register", registerValidationRules, userController.registerUser);

router.post("/login", userController.login);

router.post("/follow/:user_id", userController.followUser);

router.post("/unfollow/:user_id", userController.unfollowUser);

router.post(
  "/block/:user_id",
  authMiddleware.authenticateUser,
  userController.blockUser
);

router.post(
  "/unblock/:user_id",
  authMiddleware.authenticateUser,
  userController.unblockUser
);

router.get(
  "/profile/:user_id",
  authMiddleware.authenticateUser,
  userController.getProfile
);

router.get(
  "/profile/:user_id/followers",
  authMiddleware.authenticateUser,
  userController.followCount
);

router.get(
  "/profile/:user_id/following",
  authMiddleware.authenticateUser,
  userController.followingcount
);

router.put(
  "/profile/:user_id",
  authMiddleware.authenticateUser,
  userController.editProfile
);

router.put(
  "/unblock/:user_id",
  authMiddleware.authenticateUser,
  userController.unblockUsers
);

// our postController endPoint

router.post(
  "/createPost",
  authMiddleware.authenticateUser,
  postController.createPost
);

router.post("/comment", postController.addComment);

router.post("/subComment", postController.addSubComment);

router.post("/like/:post_id", postController.likePost);

router.delete(
  "/post/:post_id",
  authMiddleware.authenticateUser,
  postController.deleteOwnPost
);

router.get(
  "/explore/public",
  authMiddleware.authenticateUser,
  postController.explorePublicPost
);

router.get(
  "/explore/random",
  authMiddleware.authenticateUser,
  postController.exploreRandomPost
);

router.get(
  "/explore/not-blocked",
  authMiddleware.authenticateUser,
  postController.explorePostNotBlockedUser
);

router.get(
  "/explore/liked-posts",
  authMiddleware.authenticateUser,
  postController.postLikedByUser
);

router.get(
  "/explore/my-posts",
  authMiddleware.authenticateUser,
  postController.listMyPost
);

router.put(
  "/posts/:post_id",
  authMiddleware.authenticateUser,
  postController.editPost
);

router.delete(
  "/posts/:post_id",
  authMiddleware.authenticateUser,
  postController.deletePost
);

router.get(
  "/profile/:user_id/posts",
  authMiddleware.authenticateUser,
  postController.countPost
);

router.get(
  "/profile/:user_id/likes",
  authMiddleware.authenticateUser,
  postController.likedMyPost
);

module.exports = router;
