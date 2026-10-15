import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getNotifications } from "../api/notifications";
import NotificationCard from "../components/NotificationCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((data) => {
        setNotifications(data.notifications);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Notifications</h1>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading communities…" />
      ) : notifications?.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notifications?.map((notification) => (
            <NotificationCard
              key={notification?._id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
