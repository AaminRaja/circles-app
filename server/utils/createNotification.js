const Notification = require("../models/Notification");
const { getIO } = require("../sockets"); // match however your comment route gets io

async function createNotification({
  recipient,
  sender,
  type,
  message,
  commentBody,
  relatedPost,
}) {
  console.log("opiop", type, message, commentBody, relatedPost);
  
  if (String(recipient) === String(sender)) return null; // never notify yourself

  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      commentBody,
      relatedPost,
    });
    const populated = await notification.populate("relatedPost", "title");

    // room name and event name must match what your comment flow already uses
    getIO().to(`user:${recipient}`).emit("notification:new", populated);
    return populated;
  } catch (error) {
    console.error("createNotification failed:", error);
    return null;
  }
}

module.exports = createNotification;
