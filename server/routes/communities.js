const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Community = require("../models/Community");
const getPagination = require("../utils/pagination");
const handleRouteError = require("../utils/handleRouteError");

// Create a community
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { userId, username } = req.user;

    if (!name) {
      return res.status(400).json({ message: "Community name is required" });
    }

    const community = await Community.create({
      name,
      description,
      creator: userId,
      members: [userId],
    });
    res.status(201).json(community);
  } catch (error) {
    handleRouteError(error, res, "Failed to create community");
  }
});

// Communities List
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const communities = await Community.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCommunities = await Community.countDocuments();

    res.status(200).json({
      communities,
      currentPage: page,
      totalPages: Math.ceil(totalCommunities / limit),
      totalCommunities,
    });
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch communities");
  }
});

// single community details
router.get("/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate(
      "creator",
      "username",
    );

    if (!community) {
      return res.status(404).json({ message: "Community Not Found" });
    }

    res.status(200).json(community);
  } catch (error) {
    handleRouteError(error, res, "Failed to fetch community");
  }
});

// Join the community
router.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const community = await Community.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true },
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.status(200).json(community);
  } catch (error) {
    handleRouteError(error, res, "Failed to join community");
  }
});

module.exports = router;
