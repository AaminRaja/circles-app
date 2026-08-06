import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { deleteComment } from '../api/comments';
import toast from 'react-hot-toast';

export default function CommentItem({ comment, postAuthorId, onDeleted }) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const canDelete =
    user && (comment.author?._id === user.id || postAuthorId === user.id);

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return;
    setDeleting(true);
    try {
      await deleteComment(comment._id);
      onDeleted(comment._id);
    } catch (err) {
      toast.error('Could not delete comment');
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-secondary-light text-secondary font-semibold text-sm flex items-center justify-center shrink-0">
        {comment.author?.username?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-0.5">
          <span className="font-medium text-text">{comment.author?.username ?? 'unknown'}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        </div>
        <p className="text-sm text-text break-words">{comment.body}</p>
      </div>
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 text-text-muted hover:text-danger transition-colors self-start"
          aria-label="Delete comment"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
