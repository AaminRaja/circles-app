import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createComment } from '../api/comments';
import toast from 'react-hot-toast';

export default function CreateCommentForm({ postId, onCreated }) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      const data = await createComment(postId, body);
      onCreated(data.comment, data.commentCount);
      setBody('');
    } catch (err) {
      toast.error('Could not post comment');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-text-muted py-3 border-t border-border">
        Log in to join the conversation.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 py-3 border-t border-border">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="px-4 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        Post
      </button>
    </form>
  );
}
