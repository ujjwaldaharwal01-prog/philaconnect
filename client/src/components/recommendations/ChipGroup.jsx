/**
 * A row of toggle "chips" (pill buttons) for choosing several options.
 * `selected` is an array of values; clicking a chip adds or removes it via onChange(newArray).
 * aria-pressed tells screen readers which chips are on.
 */
export default function ChipGroup({ label, options, selected, onChange }) {
  const toggle = (value) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-forest-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(opt)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                on
                  ? 'border-forest-800 bg-forest-800 text-gold-300'
                  : 'border-forest-800/25 bg-white text-forest-800 hover:bg-forest-800/5'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
