import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  getNotifications,
  patchNotification,
  patchAllNotification,
} from "../api/notifications";
import NotificationCard from "../components/NotificationCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setUnreadCount } = useNotifications();

  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((data) => {
        setNotifications(data.notifications);
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    patchNotification(id)
      .then((data) => setUnreadCount(data.unreadCount))
      .catch((err) => {
        console.error("Failed to mark notification as read", err);
      });
  };

  const handleMarkAllRead = () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    patchAllNotification()
      .then((data) => setUnreadCount(data.unreadCount))
      .catch((err) => {
        console.error("Failed to mark all notifications as read", err);
        setNotifications(previous);
      });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-start gap-2">
          <h1 className="font-display font-bold text-2xl">Notifications</h1>
          {unreadCount > 0 && (
            <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FDE6DD] text-[#C94A2C]">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <div>
            <button
              onClick={handleMarkAllRead}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-transparent text-primary border border-primary/60 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loader label="Loading notifications…" />
      ) : notifications?.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notifications?.map((notification) => (
            <NotificationCard
              key={notification?._id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
