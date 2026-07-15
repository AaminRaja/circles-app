const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Community = require("../models/Community");

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
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A community with this name already exists" });
    }

    res
      .status(500)
      .json({ message: "Failed to create community", error: error.message });
  }
});

// Communities List
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const communities = await Community.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    const totalCommunities = await Community.countDocuments();

    res.status(200).json({
      communities,
      currentPage: safePage,
      totalPages: Math.ceil(totalCommunities / safeLimit),
      totalCommunities,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch communities", error: error.message });
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
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid community ID format" });
    }

    res
      .status(500)
      .json({ message: "Failed to fetch community", error: error.message });
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
    if(error.name === "CastError"){
      return res.status(400).json({ message: "Invalid community ID format" });
    }

    res
      .status(500)
      .json({ message: "Failed to join community", error: error.message });
  }
});

module.exports = router;
