const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Notification = require("../models/Notification");
const handleRouteError = require("../utils/handleRouteError");

const getTenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 10);
  return date;
};

const countUnread = (userId) =>
  Notification.countDocuments({
    recipient: userId,
    createdAt: { $gte: getTenDaysAgo() },
    read: { $ne: true },
  });

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    const notifications = await Notification.find({
      recipient: userId,
      createdAt: { $gte: getTenDaysAgo() },
    })
      .populate("relatedPost", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch notifications");
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const unread_count = await countUnread(userId);
    res.status(200).json({ unreadCount: unread_count });
  } catch (error) {
    handleRouteError(error, res, "Failed to get unread count");
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    await Notification.updateOne(
      { _id: id, recipient: userId, read: { $ne: true } },
      { $set: { read: true } },
    );

    const unread_count = await countUnread(userId);

    res.status(200).json({
      unreadCount: unread_count,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to mark notification as read");
  }
});

// PATCH /api/notifications/read
router.patch("/read", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    await Notification.updateMany(
      { recipient: userId, read: { $ne: true } },
      { $set: { read: true } },
    );

    const unread_count = await countUnread(userId);

    res.status(200).json({
      unreadCount: unread_count,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to mark notifications as read");
  }
});

module.exports = router;
