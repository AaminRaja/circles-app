import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPost, toggleLikePost } from "../api/posts";
import { getCommentsByPost } from "../api/comments";
import { useAuth } from "../context/AuthContext";
import CommentItem from "../components/CommentItem";
import CreateCommentForm from "../components/CreateCommentForm";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const likeBusyRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPost(id), getCommentsByPost(id)])
      .then(([postData, commentData]) => {
        setPost(postData);
        setLikeCount(postData.likes?.length ?? 0);
        setLiked(user ? postData.likes?.includes(user.id) : false);
        setComments(commentData.comments);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  async function handleLike() {
    if (!user) {
      toast.error("Log in to like posts");
      return;
    }
    if (likeBusyRef.current) return;
    likeBusyRef.current = true;

    // Optimistic update — flip the UI immediately, before the server responds
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const result = await toggleLikePost(id);
      // Reconcile with the server's actual response
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      // Revert — the optimistic guess didn't match reality
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Something went wrong");
    } finally {
      likeBusyRef.current = false;
    }
  }

  function handleCommentCreated(newComment, newCommentCount) {
    setComments((prev) => [...prev, newComment]);
    setPost((prev) => ({ ...prev, commentCount: newCommentCount }));
  }

  function handleCommentDeleted(commentId) {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setPost((prev) => ({
      ...prev,
      commentCount: Math.max((prev.commentCount ?? 1) - 1, 0),
    }));
  }

  if (loading) return <Loader label="Loading post…" />;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to={`/communities/${post.community?._id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        {post.community?.name ?? "Back to community"}
      </Link>

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <span className="font-medium text-text">
            {post.author?.username ?? "unknown"}
          </span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl mb-3">{post.title}</h1>

        {post.body && (
          <p className="text-text whitespace-pre-wrap mb-4">{post.body}</p>
        )}

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="w-full max-h-[28rem] object-cover rounded-xl mb-4 border border-border"
          />
        )}

        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
            liked ? "text-primary" : "text-text-muted hover:text-primary"
          }`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 mt-5">
        <h2 className="font-display font-semibold text-lg mb-1">
          Comments {post.commentCount ? `(${post.commentCount})` : ""}
        </h2>

        <CreateCommentForm postId={id} onCreated={handleCommentCreated} />

        {comments?.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            No comments yet.
          </p>
        ) : (
          <div>
            {comments?.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postAuthorId={post.author?._id}
                onDeleted={handleCommentDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
