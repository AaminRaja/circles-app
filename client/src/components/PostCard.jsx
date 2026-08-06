import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { toggleLikePost } from "../api/posts";
import toast from "react-hot-toast";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const initiallyLiked =
    post.likes?.some((likeId) => likeId === currentUserId) ?? false;

  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);

  const busyRef = useRef(false);

  async function handleLike(e) {
    e.preventDefault(); // don't navigate to the post when clicking the like button
    if (!user) {
      toast.error("Log in to like posts");
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;

    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const result = await toggleLikePost(post._id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Something went wrong");
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <Link
      to={`/posts/${post._id}`}
      className="block bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
        <span className="font-medium text-text">
          {post.author?.username ?? "unknown"}
        </span>
        <span>·</span>
        <span>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>

      <h3 className="font-display font-semibold text-lg mb-1.5">
        {post.title}
      </h3>

      {post.body && (
        <p className="text-sm text-text-muted line-clamp-3 mb-3">{post.body}</p>
      )}

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="w-full max-h-80 object-cover rounded-xl mb-3 border border-border"
        />
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
            liked ? "text-primary" : "text-text-muted hover:text-primary"
          }`}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </button>
        <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
          <MessageCircle size={17} />
          {post.commentCount ?? 0}
        </span>
      </div>
    </Link>
  );
}
