import { CloseIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/**
 * Row of removable "chips" summarising every applied filter, so users can
 * see and undo them at a glance. Clicking a chip removes just that filter.
 */
export default function ActiveFilters({ filters, update }) {
  const chips = [];

  if (filters.q) chips.push({ key: 'q', label: `Search: "${filters.q}"`, remove: () => update({ q: '' }) });
  filters.categories.forEach((v) =>
    chips.push({ key: `c-${v}`, label: v, remove: () => update({ categories: filters.categories.filter((x) => x !== v) }) }),
  );
  filters.conditions.forEach((v) =>
    chips.push({ key: `d-${v}`, label: v, remove: () => update({ conditions: filters.conditions.filter((x) => x !== v) }) }),
  );
  filters.countries.forEach((v) =>
    chips.push({ key: `n-${v}`, label: v, remove: () => update({ countries: filters.countries.filter((x) => x !== v) }) }),
  );
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const lo = filters.minPrice !== null ? formatPrice(filters.minPrice) : 'Any';
    const hi = filters.maxPrice !== null ? formatPrice(filters.maxPrice) : 'Any';
    chips.push({ key: 'price', label: `Price: ${lo} – ${hi}`, remove: () => update({ minPrice: null, maxPrice: null }) });
  }
  if (filters.minYear !== null || filters.maxYear !== null) {
    chips.push({
      key: 'year',
      label: `Year: ${filters.minYear ?? 'Any'} – ${filters.maxYear ?? 'Any'}`,
      remove: () => update({ minYear: null, maxYear: null }),
    });
  }

  if (!chips.length) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Applied filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.remove}
            aria-label={`Remove filter ${chip.label}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/50 bg-gold-400/10 px-3 py-1 text-sm text-forest-900 transition hover:bg-gold-400/25"
          >
            {chip.label}
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
