import CheckboxGroup from './CheckboxGroup';
import RangeFilter from './RangeFilter';
import { formatPrice } from '../../utils/format';

/**
 * The full set of filters. Rendered in a sticky sidebar on desktop and inside a
 * slide-over drawer on mobile (the page decides where it appears).
 * All state lives in the URL via `filters` / `update`, so this component is stateless
 * apart from the inputs inside RangeFilter.
 *
 * - `options`: derived from the data (categories, countries, conditions, price/year bounds)
 * - `update(patch)`: merges a partial filters object and resets to page 1
 */
export default function FilterPanel({ filters, options, update, onClear, hasFilters }) {
  // Adds the value if absent, removes it if present.
  const toggle = (key) => (value) => {
    const current = filters[key];
    update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-forest-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-gold-600 underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <CheckboxGroup
        title="Category"
        options={options.categories}
        selected={filters.categories}
        onToggle={toggle('categories')}
      />
      <CheckboxGroup
        title="Condition"
        options={options.conditions}
        selected={filters.conditions}
        onToggle={toggle('conditions')}
      />
      <CheckboxGroup
        title="Country"
        options={options.countries}
        selected={filters.countries}
        onToggle={toggle('countries')}
      />

      <RangeFilter
        title="Price"
        label="Price"
        prefix="₹"
        min={filters.minPrice}
        max={filters.maxPrice}
        placeholderMin={options.priceMin}
        placeholderMax={options.priceMax}
        onApply={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
      />
      <RangeFilter
        title="Year"
        label="Year"
        min={filters.minYear}
        max={filters.maxYear}
        placeholderMin={options.yearMin}
        placeholderMax={options.yearMax}
        onApply={(minYear, maxYear) => update({ minYear, maxYear })}
      />

      <p className="text-xs text-ink/45">
        Prices range from {formatPrice(options.priceMin)} to {formatPrice(options.priceMax)}.
      </p>
    </div>
  );
}
