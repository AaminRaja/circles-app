import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { createPost } from '../api/posts';
import toast from 'react-hot-toast';

export default function CreatePostForm({ communityId, onCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImage(null);
    setPreview('');
  }

  function resetForm() {
    setTitle('');
    setBody('');
    clearImage();
    setExpanded(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Give your post a title');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('community', communityId);
    if (image) formData.append('image', image);

    setSubmitting(true);
    try {
      const post = await createPost(formData);
      toast.success('Post created!');
      onCreated(post);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left bg-surface border border-border rounded-2xl px-5 py-3.5 text-text-muted hover:border-primary/40 transition-colors"
      >
        Share something with this community…
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-2xl p-5 space-y-3"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        autoFocus
        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind? (optional)"
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
      />

      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="" className="max-h-48 rounded-xl border border-border" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-text text-white rounded-full p-1 hover:bg-danger transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="flex items-center justify-between pt-1">
        <label className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary cursor-pointer transition-colors">
          <ImageIcon size={18} />
          Add image
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm rounded-full hover:bg-bg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}
