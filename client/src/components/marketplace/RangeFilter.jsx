import { useEffect, useState } from 'react';
import { validateRange } from '../../utils/stampFilters';

/**
 * Min/max numeric filter (used for price and year) with validation.
 * - Props: `title`, `label` (used in error text), `min`/`max` (applied values or null),
 *   `placeholderMin`/`placeholderMax` (the data bounds), `onApply(min, max)`, `prefix` (e.g. "₹").
 * - Typed values are applied with the Apply button or Enter. Invalid input (negative,
 *   not a number, min greater than max) shows an error and is NOT applied.
 */
export default function RangeFilter({
  title,
  label,
  min,
  max,
  placeholderMin,
  placeholderMax,
  onApply,
  prefix = '',
}) {
  const [minText, setMinText] = useState(min ?? '');
  const [maxText, setMaxText] = useState(max ?? '');
  const [error, setError] = useState('');

  // Keep inputs in sync when filters are cleared or changed from the URL.
  useEffect(() => {
    setMinText(min ?? '');
    setMaxText(max ?? '');
    setError('');
  }, [min, max]);

  const submit = (e) => {
    e.preventDefault();
    const result = validateRange(minText, maxText, label);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    onApply(result.min, result.max);
  };

  const idBase = title.replace(/\s+/g, '-').toLowerCase();
  const inputClass =
    'w-full rounded-lg border border-forest-800/20 bg-white py-2 pr-2 text-sm focus:border-gold-500 focus:outline-none';

  return (
    <form onSubmit={submit} noValidate className="border-t border-forest-800/10 pt-5">
      <h3 className="mb-3 font-display text-base font-semibold text-forest-900">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefix && <span className="pointer-events-none absolute left-2.5 top-2 text-sm text-ink/50">{prefix}</span>}
          <input
            id={`${idBase}-min`}
            type="text"
            inputMode="numeric"
            aria-label={`Minimum ${label.toLowerCase()}`}
            aria-invalid={Boolean(error)}
            placeholder={String(placeholderMin)}
            value={minText}
            onChange={(e) => setMinText(e.target.value)}
            className={`${inputClass} ${prefix ? 'pl-6' : 'pl-3'}`}
          />
        </div>
        <span className="text-ink/40" aria-hidden="true">–</span>
        <div className="relative flex-1">
          {prefix && <span className="pointer-events-none absolute left-2.5 top-2 text-sm text-ink/50">{prefix}</span>}
          <input
            id={`${idBase}-max`}
            type="text"
            inputMode="numeric"
            aria-label={`Maximum ${label.toLowerCase()}`}
            aria-invalid={Boolean(error)}
            placeholder={String(placeholderMax)}
            value={maxText}
            onChange={(e) => setMaxText(e.target.value)}
            className={`${inputClass} ${prefix ? 'pl-6' : 'pl-3'}`}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-forest-800 px-3 py-2 text-sm font-semibold text-gold-300 transition hover:bg-forest-700"
        >
          Apply
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
