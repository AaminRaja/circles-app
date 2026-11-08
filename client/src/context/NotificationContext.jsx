import { createContext, useContext, useEffect, useState } from "react";
import { getUnreadCount } from "../api/notifications";
// TODO: import your auth hook and your socket client singleton
import { useAuth } from "./AuthContext";
import socket from "../api/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  // TODO: const { user } = useAuth();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    getUnreadCount()
      .then((data) => {
        if (!cancelled) setUnreadCount(data.unreadCount);
      })
      .catch((err) => console.error("Failed to load unread count", err));

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleNew = () => setUnreadCount((prev) => prev + 1);
    const handleConnect = () => {
      getUnreadCount()
        .then((data) => {
          if (!cancelled) setUnreadCount(data.unreadCount);
        })
        .catch((err) => console.error("Failed to refresh unread count", err));
    };

    socket.on("notification:new", handleNew);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("connect", handleConnect);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
