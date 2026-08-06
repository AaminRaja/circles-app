import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getCommunities } from '../api/communities';
import CommunityCard from '../components/CommunityCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCommunities(page)
      .then((data) => {
        setCommunities(data.communities);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Communities</h1>
          <p className="text-text-muted text-sm mt-1">Find a circle that fits your interests.</p>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading communities…" />
      ) : communities.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No communities yet"
          description="Be the first to create one and start a conversation."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community) => (
              <CommunityCard key={community._id} community={community} />
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
