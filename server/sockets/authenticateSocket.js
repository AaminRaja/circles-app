const { verifyAccessToken } = require('../utils/tokens');

// Unlike HTTP requests, a socket connection doesn't send a header on every
// message — it authenticates ONCE, at connection time (the "handshake").
// The frontend passes the access token as `auth: { token }` when connecting
// (see client-side socket.js). This middleware runs before `connection`
// fires, and either allows the connection or rejects it outright.
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    // Allow anonymous connections — useful for features like "see live
    // comment counts" that don't require being logged in. Routes/events
    // that DO require a user can check socket.user themselves and reject.
    socket.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    socket.user = decoded; // { userId, username }
    next();
  } catch (err) {
    socket.user = null;
    next(); // still allow connection, just unauthenticated — same reasoning as above
  }
}

module.exports = authenticateSocket;