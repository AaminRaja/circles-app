const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");

// Refresh tokens live in an httpOnly cookie — NOT localStorage. This means client-side
// JavaScript can never read it (protects against XSS stealing it), unlike the access
// token, which the frontend does hold in memory to attach to requests.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS-only in production
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches the refresh token's own expiry
};

const requireAuth = require("../middleware/requireAuth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Username or email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      accessToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      accessToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// POST /api/auth/refresh — called by the frontend when an access token expires
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId);
    const tokenExists = user?.refreshTokens.some((rt) => rt.token === token);
    if (!user || !tokenExists) {
      // Token was revoked (e.g. logged out elsewhere) or user no longer exists
      return res.status(401).json({ message: "Refresh token no longer valid" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Token refresh failed", error: err.message });
  }
});

// POST /api/auth/logout — invalidates the refresh token server-side, not just client-side
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.userId, {
          $pull: { refreshTokens: { token } },
        });
      } catch (err) {
        // token already invalid/expired — nothing to clean up, that's fine
      }
    }
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "username email avatarUrl bio",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
});

module.exports = router;
