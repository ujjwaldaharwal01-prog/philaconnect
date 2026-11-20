/**
 * A titled group of checkboxes (used for category, country and condition filters).
 * - `options`: [{ value, count }]
 * - `selected`: array of currently selected values
 * - `onToggle(value)`: called when a box is ticked or unticked
 * Wrapped in <fieldset>/<legend> so screen readers announce the group name.
 */
export default function CheckboxGroup({ title, options, selected, onToggle }) {
  if (!options.length) return null;
  return (
    <fieldset className="border-t border-forest-800/10 pt-5">
      <legend className="mb-3 font-display text-base font-semibold text-forest-900">{title}</legend>
      <ul className="space-y-2">
        {options.map(({ value, count }) => {
          const id = `${title}-${value}`.replace(/\s+/g, '-').toLowerCase();
          return (
            <li key={value}>
              <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm text-ink/80">
                <input
                  id={id}
                  type="checkbox"
                  checked={selected.includes(value)}
                  onChange={() => onToggle(value)}
                  className="h-4 w-4 rounded border-forest-800/30 accent-forest-800"
                />
                <span className="flex-1">{value}</span>
                <span className="text-xs text-ink/45">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
