import { SORT_OPTIONS } from '../../utils/stampFilters';

/** Dropdown to choose how results are ordered. `value` is one of SORT_OPTIONS' values. */
export default function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-ink/60">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-forest-800/20 bg-white px-4 py-2 text-sm text-forest-900 focus:border-gold-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
