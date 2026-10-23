const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const getPagination = require("../utils/pagination");
const handleRouteError = require("../utils/handleRouteError");
const { getIO } = require("../sockets");
const Notification = require("../models/Notification");
const createNotification = require("../utils/createNotification");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { postId, body } = req.body;
    const { userId } = req.user;

    const postExist = await Post.findById(postId);
    if (!postExist) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      body,
    });

    await comment.populate("author", "username");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true },
    );

    getIO().to(`post:${postId}`).emit("comment:new", {
      comment,
      commentCount: updatedPost.commentCount,
    });

    console.log("userId", userId);

    if (postExist.author.toString() !== userId) {
      createNotification({
        recipient: postExist.author,
        sender: userId,
        type: "comment",
        message: `${req.user.username} commented on your post`,
        commentBody: body,
        relatedPost: postId,
      });
    }

    return res
      .status(201)
      .json({ comment, commentCount: updatedPost.commentCount });
  } catch (error) {
    handleRouteError(error, res, "Failed to create comment");
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    const { page, limit, skip } = getPagination(req);

    const comments = await Comment.find({ post: postId })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ post: postId });

    res.status(200).json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch comments");
  }
});

// Delete a comment — allowed for either the comment's author or the post's author
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment Not Found" });
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    const isCommentAuthor = comment.author.toString() === userId;
    const isPostAuthor = post.author.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    await comment.deleteOne();

    const updatedPost = await Post.findByIdAndUpdate(
      comment.post,
      { $inc: { commentCount: -1 } },
      { new: true },
    );

    res.status(200).json({
      message: "Comment deleted",
      commentCount: updatedPost.commentCount,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to delete comment");
  }
});

module.exports = router;
