import { useState } from 'react';
import FormField from '../ui/FormField';
import { TOPICS, createPost } from '../../services/communityService';

/**
 * "Start a discussion" form. Checks the fields in the browser first (same rules as the server),
 * then calls onCreated(newPostId) after the server saves the post.
 */
export default function NewPostForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ topic: 'General', title: '', body: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const err = {};
    if (form.title.trim().length < 5) err.title = 'Title must be at least 5 characters.';
    if (form.body.trim().length < 10) err.body = 'Please write at least 10 characters.';
    return err;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return; // stops double-click double posts
    const err = validate();
    setErrors(err);
    setFormError('');
    if (Object.keys(err).length > 0) return;
    setBusy(true);
    try {
      const { id } = await createPost(form);
      onCreated(id);
    } catch (ex) {
      setErrors(ex.fieldErrors || {});
      setFormError(ex.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Start a discussion" className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold text-forest-900">Start a discussion</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="post-topic" className="mb-1.5 block text-sm font-medium text-forest-900">
            Topic
          </label>
          <select
            id="post-topic"
            value={form.topic}
            onChange={set('topic')}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          >
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {errors.topic && <p className="mt-1 text-xs text-red-700">{errors.topic}</p>}
        </div>
        <FormField id="post-title" label="Title" required maxLength={120} value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Can anyone identify this 1962 stamp?" />
        <FormField id="post-body" label="Your message" required as="textarea" rows={5} maxLength={2000} value={form.body} onChange={set('body')} error={errors.body} hint={`${form.body.length}/2000`} />
      </div>
      {formError && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </p>
      )}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-forest-700 disabled:opacity-60">
          {busy ? 'Posting…' : 'Post'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-forest-800/25 px-6 py-2.5 text-sm font-medium text-forest-800 hover:bg-forest-800/5">
          Cancel
        </button>
      </div>
    </form>
  );
}
