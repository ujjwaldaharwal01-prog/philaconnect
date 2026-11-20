/**
 * Reusable "- 2 +" quantity control.
 * Props: value, onChange(newValue), min (default 1), max, label (for screen readers).
 * Buttons disable at the limits so the user can never enter an invalid quantity.
 */
export default function QuantityStepper({ value, onChange, min = 1, max, label = 'Quantity' }) {
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-forest-800/25 text-lg leading-none text-forest-800 transition hover:bg-forest-800/5 disabled:cursor-not-allowed disabled:opacity-35';
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        className={btn}
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="min-w-6 text-center font-medium text-forest-900" aria-live="polite" data-testid="qty-value">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
