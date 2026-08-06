import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '../api/communities';
import toast from 'react-hot-toast';

export default function CreateCommunityPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const community = await createCommunity(name, description);
      toast.success('Community created!');
      navigate(`/communities/${community._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">Start a new circle</h1>
      <p className="text-text-muted text-sm mb-6">
        Give it a clear name and a short description so people know what it's about.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-border rounded-2xl p-6">
        <div>
          <label className="text-sm font-medium block mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            placeholder="e.g. React Developers"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What's this community about?"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create community'}
        </button>
      </form>
    </div>
  );
}
