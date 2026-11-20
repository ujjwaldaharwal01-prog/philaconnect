import { useEffect, useMemo, useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useCart } from '../context/CartContext';
import { stamps } from '../data/stamps';
import { EMPTY_PREFS, recommend } from '../utils/recommend';
import { loadPrefs, savePrefs } from '../utils/preferences';
import StampCard from '../components/stamps/StampCard';
import PreferencesForm from '../components/recommendations/PreferencesForm';
import Button from '../components/ui/Button';

// Filter lists built once from the data, so new stamps appear as options automatically.
const COUNTRIES = [...new Set(stamps.map((s) => s.country))].sort();
const CATEGORIES = [...new Set(stamps.map((s) => s.category))];

/**
 * Recommendations page (route: /recommendations).
 * Left: the collector's taste (saved in this browser). Right: stamps ranked by how well they fit,
 * each with a match % and the reasons. Items already in the cart also shape the suggestions.
 */
export default function Recommendations() {
  useDocumentTitle('Recommendations');
  const { items } = useCart();
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  // Recalculated only when taste or cart changes.
  const { mode, picks } = useMemo(() => recommend(stamps, prefs, items, 8), [prefs, items]);
  const personal = mode === 'personal';

  return (
    <div className="bg-cream">
      <div className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">For you</p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">Recommended stamps</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Tell us what you collect and we will rank the marketplace for you. Stamps in your cart also guide the suggestions.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <PreferencesForm
              prefs={prefs}
              onChange={setPrefs}
              onReset={() => setPrefs({ ...EMPTY_PREFS })}
              countries={COUNTRIES}
              categories={CATEGORIES}
            />
          </div>

          <section aria-label="Suggestions">
            <p className="mb-5 text-sm text-ink/60" role="status" data-testid="reco-summary">
              {personal
                ? picks.length > 0
                  ? `Top ${picks.length} picks for you`
                  : 'No stamps match all of this. Try removing a filter or raising your budget.'
                : 'Starter selection: choose your interests on the left to personalise this list.'}
            </p>

            {picks.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="reco-list">
                {picks.map(({ stamp, match, reasons }) => (
                  <li key={stamp.id} className="flex flex-col" data-testid="reco-item">
                    {personal && (
                      <div className="mb-2 flex items-center justify-between rounded-t-xl bg-forest-800 px-4 py-2 text-xs font-semibold text-gold-300">
                        <span>{match}% match</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <StampCard stamp={stamp} />
                    </div>
                    <ul className="mt-2 space-y-1 rounded-xl bg-parchment p-3 text-xs text-ink/75" aria-label="Why this stamp">
                      {reasons.map((r) => (
                        <li key={r}>✓ {r}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {picks.length === 0 && personal && (
              <Button variant="dark" onClick={() => setPrefs({ ...EMPTY_PREFS })}>
                Clear my taste
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
