import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { COMMUNITIES_CHECKED, COMMUNITY_REGIONS, COMMUNITY_TYPES, communities } from '../data/communities';
import OrgCard from '../components/community/OrgCard';

/**
 * Global philatelic communities (route: /communities).
 * A searchable directory of real societies, federations and online forums, so collectors can
 * connect beyond PHILAConnect. The list lives in data/communities.js.
 */
export default function Communities() {
  useDocumentTitle('Global communities');
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return communities.filter(
      (c) =>
        (!region || c.region === region) &&
        (!type || c.type === type) &&
        (!needle || `${c.name} ${c.description} ${c.region} ${c.type}`.toLowerCase().includes(needle)),
    );
  }, [q, region, type]);

  const selectClass =
    'rounded-xl border border-forest-800/20 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/60';
  const filtered = Boolean(q || region || type);

  return (
    <div className="bg-cream">
      <div className="container-page py-12">
        <Link to="/community" className="text-sm font-medium text-forest-800 underline-offset-4 hover:underline">
          ← Community
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Collectors worldwide</p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">Global philatelic communities</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Stamp collecting is a worldwide hobby. Find societies, federations and online forums to meet fellow philatelists, learn from experts and
          discover shows near you.
        </p>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-wrap gap-3">
          <input
            type="search"
            aria-label="Search communities"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={80}
            placeholder="Search communities"
            className={`${selectClass} w-full sm:w-72`}
          />
          <select aria-label="Filter by region" value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            <option value="">All regions</option>
            {COMMUNITY_REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            <option value="">All types</option>
            {COMMUNITY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setRegion('');
                setType('');
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-forest-800 underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          )}
        </form>

        <p className="mt-5 text-sm text-ink/60" role="status" data-testid="org-count">
          {shown.length} {shown.length === 1 ? 'community' : 'communities'}
        </p>

        {shown.length > 0 ? (
          <ul className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </ul>
        ) : (
          <p data-testid="no-orgs" className="mt-4 rounded-2xl border border-dashed border-forest-800/20 p-10 text-center text-ink/60">
            No community matches. Try clearing the filters.
          </p>
        )}

        <p className="mt-10 rounded-xl bg-parchment p-4 text-xs leading-relaxed text-ink/65">
          These are independent websites. PHILAConnect is not affiliated with them and is not responsible for their content. Links were checked in{' '}
          {COMMUNITIES_CHECKED}; websites can change over time. Never share bank details, passwords or OTPs with anyone you meet online.
        </p>
      </div>
    </div>
  );
}
