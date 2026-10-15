const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Notification = require("../models/Notification");
const handleRouteError = require("../utils/handleRouteError");

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const notifications = await Notification.find({
      recipient: userId,
      createdAt: { $gte: tenDaysAgo },
    })
      .populate("relatedPost", "title")
      .sort({ createdAt: -1 })

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch notifications");
  }
});

module.exports = router;
