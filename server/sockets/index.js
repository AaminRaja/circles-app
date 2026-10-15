const { Server } = require("socket.io");
const authenticateSocket = require("./authenticateSocket");

let io = null;

// A simple in-memory set of currently-connected user IDs. Fine for a single
// server instance (which is what a free-tier deployment is) — at real scale,
// with multiple server instances behind a load balancer, this would need to
// move to something shared like Redis, since each instance would otherwise
// only know about ITS OWN connected sockets, not the whole app's.
const onlineUsers = new Set();

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(
      "Socket connected:",
      socket.id,
      socket.user?.username || "anonymous",
    );

    if (socket.user) {
      onlineUsers.add(socket.user.userId);
      socket.join(`user:${socket.user.userId}`);
      io.emit("presence:update", { onlineCount: onlineUsers.size });
    }

    // Client explicitly tells us which post they're currently viewing —
    // we put them in a "room" scoped to that post, so we can broadcast
    // comment/like updates to ONLY people viewing that specific post,
    // not every connected user across the whole app.
    socket.on("post:join", (postId) => {
      socket.join(`post:${postId}`);
    });

    socket.on("post:leave", (postId) => {
      socket.leave(`post:${postId}`);
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        onlineUsers.delete(socket.user.userId);
        io.emit("presence:update", { onlineCount: onlineUsers.size });
      }
    });
  });

  return io;
}

// Route handlers (e.g. routes/comments.js) import this to broadcast an
// event AFTER a database write succeeds — sockets don't replace your REST
// API, they run alongside it: the HTTP request still does the actual
// create/update/delete, then a socket event tells OTHER connected clients
// "something changed, here's the new data" without them needing to refresh.
function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized — call initializeSocket first");
  }
  return io;
}

module.exports = { initializeSocket, getIO };
