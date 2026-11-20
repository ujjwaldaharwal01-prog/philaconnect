import { CONDITIONS } from '../../data/stamps';
import { BUDGETS, ERAS } from '../../utils/recommend';
import ChipGroup from './ChipGroup';

/**
 * "Tell us your taste" panel. Fully controlled: the page owns `prefs`, this only calls
 * onChange(newPrefs) and onReset(). `countries` and `categories` come from the stamp data.
 */
export default function PreferencesForm({ prefs, onChange, onReset, countries, categories }) {
  const set = (key) => (value) => onChange({ ...prefs, [key]: value });
  const selectClass =
    'w-full rounded-xl border border-forest-800/20 bg-white px-4 py-2.5 text-sm text-ink focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/60';

  return (
    <section aria-label="Your collecting taste" className="rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">Your collecting taste</h2>
        <button type="button" onClick={onReset} className="text-sm font-medium text-forest-800 underline-offset-4 hover:underline">
          Clear
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/60">Pick anything that interests you. Suggestions update instantly.</p>

      <div className="mt-6 space-y-6">
        <ChipGroup label="Themes" options={categories} selected={prefs.categories} onChange={set('categories')} />
        <ChipGroup label="Countries" options={countries} selected={prefs.countries} onChange={set('countries')} />
        <ChipGroup label="Condition" options={CONDITIONS} selected={prefs.conditions} onChange={set('conditions')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pref-era" className="mb-1.5 block text-sm font-semibold text-forest-900">
              Era
            </label>
            <select id="pref-era" className={selectClass} value={prefs.era} onChange={(e) => set('era')(e.target.value)}>
              {ERAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pref-budget" className="mb-1.5 block text-sm font-semibold text-forest-900">
              Budget per stamp
            </label>
            <select id="pref-budget" className={selectClass} value={prefs.budget} onChange={(e) => set('budget')(Number(e.target.value))}>
              {BUDGETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
