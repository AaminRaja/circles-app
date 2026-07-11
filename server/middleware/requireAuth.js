const { verifyAccessToken } = require('../utils/tokens');

// Protects any route that requires a logged-in user.
// Expects header: Authorization: Bearer <accessToken>
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, username }
    next();
  } catch (err) {
    // Expired or invalid — frontend should try /api/auth/refresh and retry the request
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

module.exports = requireAuth;
