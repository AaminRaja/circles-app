import api from "./client";

export const getNotifications = () =>
  api.get("/notifications").then((res) => res.data);
