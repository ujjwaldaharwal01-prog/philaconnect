import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { fetchStamps } from '../services/stampService';
import {
  PAGE_SIZE,
  buildOptions,
  countActiveFilters,
  filterStamps,
  readFilters,
  sortStamps,
  writeFilters,
} from '../utils/stampFilters';
import StampCard from '../components/stamps/StampCard';
import SearchBar from '../components/marketplace/SearchBar';
import FilterPanel from '../components/marketplace/FilterPanel';
import ActiveFilters from '../components/marketplace/ActiveFilters';
import SortSelect from '../components/marketplace/SortSelect';
import Pagination from '../components/marketplace/Pagination';
import StampGridSkeleton from '../components/marketplace/StampGridSkeleton';
import StampDetailModal from '../components/marketplace/StampDetailModal';
import { CloseIcon } from '../components/ui/Icons';

/**
 * Marketplace page (route: /marketplace).
 *
 * All filter choices live in the URL (?q=...&category=...&sort=...&page=2), which means
 * the browser Back button works, a filtered page can be bookmarked or shared, and the
 * homepage search/category links (/marketplace?q=birds) work with no extra code.
 *
 * Flow: load stamps (loading / error / ready) -> filter -> sort -> paginate -> render cards.
 */
export default function Marketplace() {
  useDocumentTitle('Marketplace');

  const [searchParams, setSearchParams] = useSearchParams();
  const [stamps, setStamps] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // stamp shown in the details window
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile filter drawer
  const resultsRef = useRef(null);

  // Load listings. Re-run via the "Try again" button on failure.
  const load = useCallback(() => {
    setStatus('loading');
    setError('');
    fetchStamps()
      .then((data) => {
        setStamps(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong while loading stamps.');
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const options = useMemo(() => buildOptions(stamps), [stamps]);
  const filtered = useMemo(
    () => sortStamps(filterStamps(stamps, filters), filters.sort),
    [stamps, filters],
  );

  // Merge a partial change into the filters. Any change resets to page 1,
  // unless the patch itself sets a page (pagination).
  const update = useCallback(
    (patch) => {
      setSearchParams(writeFilters({ ...filters, page: 1, ...patch }));
    },
    [filters, setSearchParams],
  );
  const clearAll = () => setSearchParams({});

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = countActiveFilters(filters);

  const changePage = (n) => {
    update({ page: n });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeDetails = useCallback(() => setSelected(null), []);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      options={options}
      update={update}
      onClear={clearAll}
      hasFilters={activeCount > 0}
    />
  );

  return (
    <div className="bg-cream">
      {/* Page header */}
      <section className="border-b border-forest-800/10 bg-gradient-to-b from-cream to-parchment/60">
        <div className="container-page py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Marketplace</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest-900 sm:text-5xl">Find your next stamp</h1>
          <p className="mt-3 max-w-xl text-ink/65">
            Browse stamps from collectors around the world. Sample listings for demonstration.
          </p>
          <div className="mt-8 max-w-3xl">
            <SearchBar value={filters.q} onSearch={(q) => update({ q })} />
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[17rem_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-forest-800/10 bg-offwhite p-5 shadow-card">
            {status === 'ready' ? filterPanel : <p className="text-sm text-ink/50">Filters load with the stamps.</p>}
          </div>
        </aside>

        <section ref={resultsRef} className="scroll-mt-24" aria-label="Search results">
          {/* Toolbar: result count, mobile filter button, sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/65" aria-live="polite" data-testid="result-count">
              {status === 'ready'
                ? filtered.length === 0
                  ? 'No stamps found'
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + pageItems.length} of ${filtered.length} stamps`
                : status === 'loading'
                  ? 'Loading stamps…'
                  : ''}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                disabled={status !== 'ready'}
                className="rounded-full border border-forest-800/25 bg-white px-4 py-2 text-sm font-medium text-forest-800 transition hover:bg-forest-800/5 disabled:opacity-50 lg:hidden"
              >
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
              <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} />
            </div>
          </div>

          {status === 'ready' && activeCount > 0 && (
            <div className="mt-4">
              <ActiveFilters filters={filters} update={update} />
            </div>
          )}

          <div className="mt-6">
            {status === 'loading' && <StampGridSkeleton count={6} />}

            {status === 'error' && (
              <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center">
                <h2 className="text-xl font-semibold text-red-900">We could not load the stamps</h2>
                <p className="mt-2 text-sm text-red-800/80">{error}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-5 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-forest-700"
                >
                  Try again
                </button>
              </div>
            )}

            {status === 'ready' && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-forest-800/25 bg-offwhite p-10 text-center">
                <h2 className="text-xl font-semibold text-forest-900">No stamps match your search</h2>
                <p className="mt-2 text-sm text-ink/60">Try removing a filter or searching for something broader.</p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-forest-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {status === 'ready' && filtered.length > 0 && (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="stamp-grid">
                  {pageItems.map((stamp) => (
                    <li key={stamp.id}>
                      <StampCard stamp={stamp} onViewDetails={setSelected} />
                    </li>
                  ))}
                </ul>
                <Pagination page={page} totalPages={totalPages} onChange={changePage} />
              </>
            )}
          </div>
        </section>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[65] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-forest-950/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-offwhite p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="mb-2 ml-auto flex rounded-full p-2 text-forest-900 hover:bg-forest-800/5"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            {filterPanel}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-gold-300"
            >
              Show {filtered.length} stamp{filtered.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      )}

      <StampDetailModal stamp={selected} onClose={closeDetails} />
    </div>
  );
}
