import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCard({ notification, onMarkRead }) {
  const hasPost = Boolean(notification?.relatedPost);
  const isUnread = !notification?.read;
  const Icon = notification?.type === "like" ? Heart : MessageCircle;

  const handleClick = () => {
    if (isUnread) onMarkRead(notification._id);
  };

  const content = (
    <>
      {isUnread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#EF6A4A]" />
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isUnread ? "bg-[#E4DEFA]" : "bg-[#EDEAF2]"
          }`}
        >
          <Icon
            size={16}
            className={isUnread ? "text-[#5B3FD0]" : "text-[#A39DB3]"}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={
              isUnread
                ? "text-sm font-medium text-text"
                : "text-sm text-[#7A716B]"
            }
          >
            {notification?.message}
          </p>
          {hasPost && (
            <p
              className={`text-sm mt-0.5 truncate ${
                isUnread ? "text-text-muted" : "text-[#9A918B]"
              }`}
            >
              "{notification?.relatedPost?.title}"
            </p>
          )}
          <span
            className={`text-xs mt-1 block ${
              isUnread ? "text-text-muted" : "text-[#A39A94]"
            }`}
          >
            {formatDistanceToNow(new Date(notification?.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </>
  );

  if (!hasPost) {
    // The related post no longer exists (e.g. deleted) — show the
    // notification, but don't make it a broken link
    return (
      <div
        onClick={handleClick}
        className={`relative border rounded-2xl p-4 opacity-70 ${
          isUnread
            ? "bg-surface border-[#F3BFAE]"
            : "bg-[#F7F1EC] border-[#EBE2DB]"
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/posts/${notification?.relatedPost?._id}`}
      onClick={handleClick}
      className={`relative block border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all ${
        isUnread
          ? "bg-surface border-[#F3BFAE]"
          : "bg-[#F7F1EC] border-[#EBE2DB]"
      }`}
    >
      {content}
    </Link>
  );
}
