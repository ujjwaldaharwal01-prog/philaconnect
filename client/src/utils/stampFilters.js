import { CONDITIONS } from '../data/stamps';

/**
 * Pure helper functions for the marketplace: read/write filters in the URL,
 * filter, sort and describe the available options. No React in here, so it is
 * easy to test and to reuse (the backend will implement the same rules in SQL).
 */

export const PAGE_SIZE = 12;
export const MAX_QUERY_LENGTH = 80;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-asc', label: 'Year: oldest first' },
  { value: 'year-desc', label: 'Year: newest first' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

// Words ignored in searches so "mint condition" or "bird stamps" still match.
const STOP_WORDS = new Set(['condition', 'stamp', 'stamps', 'the', 'of', 'and', 'a']);

/** Converts a URL value to a non-negative number, or null when empty/invalid. */
function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Builds a clean filters object from URL search params (bad values fall back to defaults). */
export function readFilters(params) {
  const sort = params.get('sort');
  const page = parseInt(params.get('page'), 10);
  return {
    q: (params.get('q') ?? '').slice(0, MAX_QUERY_LENGTH),
    categories: params.getAll('category'),
    countries: params.getAll('country'),
    conditions: params.getAll('condition'),
    minPrice: toNumber(params.get('minPrice')),
    maxPrice: toNumber(params.get('maxPrice')),
    minYear: toNumber(params.get('minYear')),
    maxYear: toNumber(params.get('maxYear')),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'featured',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Turns a filters object back into URL params. Default values are omitted for tidy URLs. */
export function writeFilters(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  filters.categories.forEach((v) => p.append('category', v));
  filters.countries.forEach((v) => p.append('country', v));
  filters.conditions.forEach((v) => p.append('condition', v));
  if (filters.minPrice !== null) p.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) p.set('maxPrice', String(filters.maxPrice));
  if (filters.minYear !== null) p.set('minYear', String(filters.minYear));
  if (filters.maxYear !== null) p.set('maxYear', String(filters.maxYear));
  if (filters.sort !== 'featured') p.set('sort', filters.sort);
  if (filters.page > 1) p.set('page', String(filters.page));
  return p;
}

/**
 * Applies the filters to a list of stamps.
 * Search: every word typed must appear in the name, country, category, condition or year.
 * A decade such as "1960s" matches years 1960 to 1969.
 */
export function filterStamps(list, f) {
  const tokens = f.q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t && !STOP_WORDS.has(t));

  return list.filter((s) => {
    if (tokens.length) {
      const haystack = [s.name, s.country, s.category, s.condition, s.year].join(' ').toLowerCase();
      const matches = tokens.every((token) => {
        const decade = token.match(/^(\d{3})0s$/);
        if (decade) {
          const start = Number(`${decade[1]}0`);
          return s.year >= start && s.year <= start + 9;
        }
        return haystack.includes(token);
      });
      if (!matches) return false;
    }
    if (f.categories.length && !f.categories.includes(s.category)) return false;
    if (f.countries.length && !f.countries.includes(s.country)) return false;
    if (f.conditions.length && !f.conditions.includes(s.condition)) return false;
    if (f.minPrice !== null && s.price < f.minPrice) return false;
    if (f.maxPrice !== null && s.price > f.maxPrice) return false;
    if (f.minYear !== null && s.year < f.minYear) return false;
    if (f.maxYear !== null && s.year > f.maxYear) return false;
    return true;
  });
}

/** Returns a sorted copy of the list. "featured" keeps the original order. */
export function sortStamps(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'year-asc':
      return copy.sort((a, b) => a.year - b.year);
    case 'year-desc':
      return copy.sort((a, b) => b.year - a.year);
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

/** Counts how many stamps have each value of a field, sorted alphabetically. */
function countBy(list, field) {
  const counts = new Map();
  list.forEach((s) => counts.set(s[field], (counts.get(s[field]) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([value, count]) => ({ value, count }));
}

/** Derives the filter choices (with counts) and numeric bounds from the loaded data. */
export function buildOptions(list) {
  const conditionCounts = new Map(countBy(list, 'condition').map((o) => [o.value, o.count]));
  const prices = list.map((s) => s.price);
  const years = list.map((s) => s.year);
  return {
    categories: countBy(list, 'category'),
    countries: countBy(list, 'country'),
    // Keep conditions in grading order (best first) rather than alphabetical.
    conditions: CONDITIONS.filter((c) => conditionCounts.has(c)).map((c) => ({
      value: c,
      count: conditionCounts.get(c),
    })),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    yearMin: years.length ? Math.min(...years) : 0,
    yearMax: years.length ? Math.max(...years) : 0,
  };
}

/** Number of filters currently applied (used for the mobile "Filters (n)" badge). */
export function countActiveFilters(f) {
  return (
    f.categories.length +
    f.countries.length +
    f.conditions.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.minYear !== null || f.maxYear !== null ? 1 : 0) +
    (f.q ? 1 : 0)
  );
}

/**
 * Validates a min/max pair typed by the user.
 * Returns { min, max, error }. Empty fields are allowed (meaning "no limit").
 */
export function validateRange(minRaw, maxRaw, label) {
  const parse = (raw) => {
    const text = String(raw).trim();
    if (text === '') return { value: null };
    const n = Number(text);
    if (!Number.isFinite(n) || n < 0) return { error: `${label} must be a positive number.` };
    return { value: n };
  };
  const min = parse(minRaw);
  const max = parse(maxRaw);
  if (min.error || max.error) return { error: min.error || max.error };
  if (min.value !== null && max.value !== null && min.value > max.value) {
    return { error: `Minimum ${label.toLowerCase()} cannot be greater than the maximum.` };
  }
  return { min: min.value, max: max.value, error: '' };
}
