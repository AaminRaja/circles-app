import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function CommunityCard({ community }) {
  return (
    <Link
      to={`/communities/${community._id}`}
      className="group block bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-lg text-text group-hover:text-primary-dark transition-colors">
          {community.name}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-bg px-2.5 py-1 rounded-full border border-border">
          <Users size={13} />
          {community.members?.length ?? 0}
        </span>
      </div>
      {community.description && (
        <p className="mt-2 text-sm text-text-muted line-clamp-2">{community.description}</p>
      )}
    </Link>
  );
}
