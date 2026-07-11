const jwt = require('jsonwebtoken');

// Access tokens are short-lived and sent with every API request (in the Authorization header).
// Refresh tokens are long-lived and used only to get a new access token when it expires —
// this way, if an access token leaks, the exposure window is small (15 min), while the user
// doesn't have to log in again every 15 minutes.

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
