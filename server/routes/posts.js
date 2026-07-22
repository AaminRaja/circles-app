const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Post = require("../models/Post");
const uploadPostImage = require("../middleware/uploadPostImage");
const Community = require("../models/Community");
const getPagination = require("../utils/pagination");
const handleRouteError = require("../utils/handleRouteError");

router.post(
  "/",
  requireAuth,
  uploadPostImage.single("image"),
  async (req, res) => {
    try {
      const { title, body, community } = req.body;
      const { userId } = req.user;

      if (!title) {
        return res.status(400).json({ message: "Post title is required" });
      }

      const communityExists = await Community.findById(community);

      if (!communityExists) {
        return res.status(404).json({ message: "Community Not Found" });
      }

      const post = await Post.create({
        community,
        author: userId,
        title,
        body,
        imageUrl: req.file ? req.file.path : "",
      });

      res.status(201).json(post);
    } catch (error) {
      handleRouteError(error, res, "Failed to create post");
    }
  },
);

router.get("/community/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;

    const communityExists = await Community.findById(communityId);
    if (!communityExists) {
      return res.status(404).json({ message: "Community not found" });
    }

    const { page, limit, skip } = getPagination(req);

    const posts = await Post.find({ community: communityId })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ community: communityId });

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch posts");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate("community", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch post");
  }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some((userIdInArray) => userIdInArray.toString() === userId)

    let updatedPost;
    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(id, {$pull: {likes:userId}}, { new: true },)
    } else {
      updatedPost = await Post.findByIdAndUpdate(id, {$addToSet: {likes:userId}}, { new: true },);
    }

    res.status(200).json({
      liked: !alreadyLiked,
      likeCount: updatedPost.likes.length,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to update like");
  }
});

module.exports = router;
