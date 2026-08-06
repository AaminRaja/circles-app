import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Users, MessageSquare } from "lucide-react";
import { getCommunity, joinCommunity } from "../api/communities";
import { getPostsByCommunity } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const isMember = user && community?.members?.includes(user.id);

  const loadCommunity = useCallback(() => {
    return getCommunity(id).then(setCommunity);
  }, [id]);

  const loadPosts = useCallback(() => {
    return getPostsByCommunity(id, page).then((data) => {
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    });
  }, [id, page]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCommunity(), loadPosts()]).finally(() =>
      setLoading(false),
    );
  }, [loadCommunity, loadPosts]);

  async function handleJoin() {
    setJoining(true);
    try {
      const updated = await joinCommunity(id);
      setCommunity(updated);
      toast.success(`Joined ${updated.name}!`);
    } catch (err) {
      toast.error("Could not join community");
    } finally {
      setJoining(false);
    }
  }

  function handlePostCreated(newPost) {
    setPosts((prev) => [newPost, ...prev]);
  }

  if (loading) return <Loader label="Loading community…" />;
  if (!community) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-text-muted text-sm mt-1.5">
                {community.description}
              </p>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted mt-3">
              <Users size={14} />
              {community.members?.length ?? 0} members
            </span>
          </div>

          {user &&
            (isMember ? (
              <span className="shrink-0 text-xs font-semibold text-secondary bg-secondary-light px-3 py-1.5 rounded-full">
                Joined
              </span>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="shrink-0 px-4 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {joining ? "Joining…" : "Join"}
              </button>
            ))}
        </div>
      </div>

      {user && (
        <div className="mb-5">
          <CreatePostForm communityId={id} onCreated={handlePostCreated} />
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Be the first to share something in this community."
        />
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-full border border-border disabled:opacity-40 hover:bg-bg transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-full border border-border disabled:opacity-40 hover:bg-bg transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
