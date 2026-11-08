import api from "./client";

export const getNotifications = () =>
  api.get("/notifications").then((res) => res.data);

export const patchNotification = (id) =>
  api.patch(`/notifications/${id}/read`).then((res) => res.data);

export const patchAllNotification = () =>
  api.patch("/notifications/read").then((res) => res.data);

export const getUnreadCount = () =>
  api.get("/notifications/unread-count").then((res) => res.data);
