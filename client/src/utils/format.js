import { CURRENCY } from '../constants/site';

// Shared Intl formatter so every price on the site looks identical.
const priceFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency',
  currency: CURRENCY.code,
  maximumFractionDigits: 0,
});

/**
 * Formats a numeric amount as currency, e.g. 1850 -> "₹1,850".
 * Returns an em dash for anything that is not a finite number, so a bad
 * value in the data never crashes the UI or shows "NaN".
 */
export function formatPrice(amount) {
  return Number.isFinite(amount) ? priceFormatter.format(amount) : '—';
}

const dateFormatter = new Intl.DateTimeFormat(CURRENCY.locale, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** Formats a date/ISO string as e.g. "14 Nov 2026, 9:04 pm". Returns "—" for invalid dates. */
export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}
