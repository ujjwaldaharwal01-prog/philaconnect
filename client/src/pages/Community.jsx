import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getToken } from '../utils/auth';
import { TOPICS, fetchPosts } from '../services/communityService';
import NewPostForm from '../components/community/NewPostForm';
import PostRow from '../components/community/PostRow';
import ChatSection from '../components/community/ChatSection';
import Button from '../components/ui/Button';
import { COMMUNITY_PERKS, COMMUNITY_RULES } from '../constants/community';

/**
 * Community page (route: /community).
 * Our own discussion board plus a doorway to the global communities directory (/communities).
 */
export default function Community() {
  useDocumentTitle('Community');
  const navigate = useNavigate();
  const loggedIn = Boolean(getToken());

  // Filters live in the URL (?topic=&q=&page=) so a refresh or shared link keeps them.
  const [params, setParams] = useSearchParams();
  const topic = TOPICS.includes(params.get('topic')) ? params.get('topic') : '';
  const q = (params.get('q') || '').slice(0, 80);
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const [search, setSearch] = useState(q);

  const [data, setData] = useState({ posts: [], total: 0, pageSize: 10 });
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page'); // a new filter starts from page 1
    setParams(next);
  };

  const load = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    fetchPosts({ topic, q, page })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [topic, q, page]);

  useEffect(() => load(), [load]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="bg-cream">
      <div className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Collectors together</p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">PHILAConnect Community</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Talk with fellow philatelists, ask questions, show your finds, and connect with collector communities around the world.
        </p>

        <section aria-label="Global communities" className="mt-10 rounded-3xl bg-forest-900 p-8 text-cream shadow-card sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-gold-300">Connect with philatelists worldwide</h2>
          <p className="mt-2 max-w-xl text-sm text-cream/80">
            Browse real stamp societies, federations and online forums from India, the UK, the USA and beyond, and join the ones that match your interests.
          </p>
          <div className="mt-6">
            <Button to="/communities" variant="primary" data-testid="global-link">
              Explore global communities
            </Button>
          </div>
        </section>


        <ChatSection />

        <section aria-label="Discussion board" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-forest-900">Discussion board</h2>
              <p className="mt-1 text-sm text-ink/60">Ask questions, show your finds and help other collectors.</p>
            </div>
            {loggedIn ? (
              !composing && (
                <button type="button" onClick={() => setComposing(true)} className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-forest-700">
                  Start a discussion
                </button>
              )
            ) : (
              <p className="text-sm text-ink/70">
                <Link to="/login" className="font-semibold text-forest-800 underline">Log in</Link> to join the discussion.
              </p>
            )}
          </div>

          {composing && (
            <div className="mt-6">
              <NewPostForm onCreated={(id) => navigate(`/community/${id}`)} onCancel={() => setComposing(false)} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by topic">
            {['', ...TOPICS].map((t) => (
              <button
                key={t || 'all'}
                type="button"
                aria-pressed={topic === t}
                onClick={() => update({ topic: t })}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  topic === t ? 'border-forest-800 bg-forest-800 text-gold-300' : 'border-forest-800/25 bg-white text-forest-800 hover:bg-forest-800/5'
                }`}
              >
                {t || 'All topics'}
              </button>
            ))}
          </div>

          <form
            role="search"
            className="mt-4 flex max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: search.trim() });
            }}
          >
            <input
              type="search"
              aria-label="Search discussions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={80}
              placeholder="Search discussions"
              className="w-full rounded-full border border-forest-800/20 bg-white px-4 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
            />
            <button type="submit" className="rounded-full bg-forest-800 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-forest-700">
              Search
            </button>
          </form>

          <div className="mt-6" aria-live="polite">
            {status === 'loading' && <p className="py-10 text-center text-ink/60">Loading discussions…</p>}
            {status === 'error' && (
              <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-800">{error}</p>
                <button type="button" onClick={load} className="mt-3 rounded-full bg-red-800 px-5 py-2 text-sm font-semibold text-white">
                  Try again
                </button>
              </div>
            )}
            {status === 'ready' && data.posts.length === 0 && (
              <p data-testid="no-posts" className="rounded-2xl border border-dashed border-forest-800/20 p-10 text-center text-ink/60">
                {topic || q ? 'No discussions match. Try another topic or search.' : 'No discussions yet. Be the first to start one!'}
              </p>
            )}
            {status === 'ready' && data.posts.length > 0 && (
              <ul className="space-y-4" data-testid="post-list">
                {data.posts.map((p) => (
                  <PostRow key={p.id} post={p} />
                ))}
              </ul>
            )}
          </div>

          {status === 'ready' && totalPages > 1 && (
            <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-4 text-sm">
              <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="rounded-full border border-forest-800/25 px-4 py-1.5 disabled:opacity-40">
                Previous
              </button>
              <span data-testid="page-info">
                Page {page} of {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })} className="rounded-full border border-forest-800/25 px-4 py-1.5 disabled:opacity-40">
                Next
              </button>
            </nav>
          )}
        </section>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {COMMUNITY_PERKS.map((p) => (
            <li key={p.title} className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold text-forest-900">{p.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{p.text}</p>
            </li>
          ))}
        </ul>

        <section aria-label="Community rules" className="mt-10 rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-forest-900">Community rules</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/75">
            {COMMUNITY_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </section>

        <div className="mt-10">
          <Button to="/marketplace" variant="dark">
            Browse the marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
