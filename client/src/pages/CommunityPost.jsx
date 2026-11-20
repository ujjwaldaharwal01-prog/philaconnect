import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getToken } from '../utils/auth';
import { addComment, deleteComment, deletePost, fetchPost } from '../services/communityService';
import { formatDate } from '../utils/format';
import FormField from '../components/ui/FormField';

/** One discussion with its replies (route: /community/:id). Visitors can read; members can reply. */
export default function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedIn = Boolean(getToken());
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [textError, setTextError] = useState('');
  const [busy, setBusy] = useState(false);
  useDocumentTitle(data ? data.post.title : 'Discussion');

  const load = useCallback(() => {
    let cancelled = false;
    fetchPost(id)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setStatus('loading');
    return load();
  }, [load]);

  const shell = (children) => (
    <div className="bg-cream">
      <div className="container-page max-w-3xl py-12">{children}</div>
    </div>
  );

  if (status === 'loading') return shell(<p className="py-20 text-center text-ink/60">Loading discussion…</p>);
  if (status === 'error') {
    return shell(
      <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-10 text-center">
        <h1 className="text-2xl font-semibold text-red-900">{error?.status === 404 ? 'Discussion not found' : 'Could not load the discussion'}</h1>
        <p className="mt-2 text-sm text-red-800/80">{error?.message}</p>
        <Link to="/community" className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-cream">
          Back to community
        </Link>
      </div>,
    );
  }

  const { post, comments } = data;

  const submitComment = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (text.trim().length < 2) {
      setTextError('Please write a comment.');
      return;
    }
    setBusy(true);
    setTextError('');
    try {
      await addComment(id, text);
      setText('');
      load();
    } catch (ex) {
      setTextError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (fn, message, after) => {
    if (!window.confirm(message)) return;
    try {
      await fn();
      after();
    } catch (ex) {
      window.alert(ex.message);
    }
  };

  return shell(
    <>
      <Link to="/community" className="text-sm font-medium text-forest-800 underline-offset-4 hover:underline">
        ← All discussions
      </Link>

      <article className="mt-4 rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card" data-testid="post-detail">
        <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-xs font-semibold text-gold-600">{post.topic}</span>
        <h1 className="mt-3 text-3xl font-semibold text-forest-900">{post.title}</h1>
        <p className="mt-1 text-xs text-ink/50">
          by {post.author} · {formatDate(post.createdAt)}
        </p>
        <p className="mt-5 whitespace-pre-wrap break-words text-ink/80">{post.body}</p>
        {post.mine && (
          <button
            type="button"
            onClick={() => remove(() => deletePost(id), 'Delete this discussion and all its replies?', () => navigate('/community'))}
            className="mt-5 text-sm font-medium text-red-700 underline-offset-4 hover:underline"
          >
            Delete my discussion
          </button>
        )}
      </article>

      <section aria-label="Replies" className="mt-8">
        <h2 className="font-display text-xl font-semibold text-forest-900" data-testid="reply-count">
          {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
        </h2>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-offwhite p-4" data-testid="comment">
              <p className="text-xs text-ink/50">
                {c.author} · {formatDate(c.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink/80">{c.body}</p>
              {c.mine && (
                <button
                  type="button"
                  onClick={() => remove(() => deleteComment(c.id), 'Delete this reply?', load)}
                  className="mt-2 text-xs font-medium text-red-700 underline-offset-4 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {loggedIn ? (
          <form onSubmit={submitComment} noValidate className="mt-6">
            <FormField id="comment-body" label="Add a reply" as="textarea" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} error={textError} />
            <button type="submit" disabled={busy} className="mt-3 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-forest-700 disabled:opacity-60">
              {busy ? 'Posting…' : 'Reply'}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ink/70">
            <Link to="/login" className="font-semibold text-forest-800 underline">Log in</Link> to reply.
          </p>
        )}
      </section>
    </>,
  );
}
