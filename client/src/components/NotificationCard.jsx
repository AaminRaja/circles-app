import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCard({ notification }) {
  const hasPost = Boolean(notification?.relatedPost);

  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary-light flex items-center justify-center shrink-0">
          <MessageCircle size={16} className="text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text">{notification?.message}</p>
          {hasPost && (
            <p className="text-sm text-text-muted mt-0.5 truncate">
              "{notification?.relatedPost?.title}"
            </p>
          )}
          <span className="text-xs text-text-muted mt-1 block">
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
      <div className="bg-surface border border-border rounded-2xl p-4 opacity-70">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/posts/${notification?.relatedPost?._id}`}
      className="block bg-surface border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all"
    >
      {content}
    </Link>
  );
}
