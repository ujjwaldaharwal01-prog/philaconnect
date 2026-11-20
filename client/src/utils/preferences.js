// utils/preferences.js
// Saves the collector's taste in this browser (localStorage) so it is still there next visit.
// Everything read back is cleaned, so a damaged or hand-edited value can never crash the page.
import { EMPTY_PREFS, ERAS, BUDGETS } from './recommend';

const KEY = 'philaconnect_prefs_v1';

const strings = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 30) : []);

/** Turns any unknown value into a valid preferences object. */
export function sanitizePrefs(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    countries: strings(r.countries),
    categories: strings(r.categories),
    conditions: strings(r.conditions),
    budget: BUDGETS.some((b) => b.value === r.budget) ? r.budget : 0,
    era: ERAS.some((e) => e.value === r.era) ? r.era : 'any',
  };
}

export function loadPrefs() {
  try {
    const text = localStorage.getItem(KEY);
    return text ? sanitizePrefs(JSON.parse(text)) : { ...EMPTY_PREFS };
  } catch {
    return { ...EMPTY_PREFS }; // storage blocked or invalid JSON
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sanitizePrefs(prefs)));
  } catch {
    /* storage full or blocked: the page still works, it just will not remember */
  }
}
