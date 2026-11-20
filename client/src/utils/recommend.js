// utils/recommend.js
// The recommendation "brain". Pure functions (no React, no network) so it is easy to test.
//
// How it works (content-based matching):
//   Every stamp gets a score from how well it fits what the collector told us (preferences)
//   and what they already put in their cart. Each rule that fires also adds a plain-English
//   reason, so the website can say WHY a stamp was suggested.
//   This is a rule-based recommender, not machine learning. It can later be swapped for a real
//   model on the server without changing the page, because the page only uses recommend().

export const EMPTY_PREFS = { countries: [], categories: [], conditions: [], budget: 0, era: 'any' };

// Era options: label + inclusive year range. "any" means no era preference.
export const ERAS = [
  { value: 'any', label: 'Any era', min: 0, max: 9999 },
  { value: '1950s', label: '1950s', min: 1950, max: 1959 },
  { value: '1960s', label: '1960s', min: 1960, max: 1969 },
  { value: '1970s', label: '1970s', min: 1970, max: 1979 },
  { value: '1980s', label: '1980s', min: 1980, max: 1989 },
];

// Budget options (max price in rupees; 0 = no limit).
export const BUDGETS = [
  { value: 0, label: 'No limit' },
  { value: 500, label: 'Up to ₹500' },
  { value: 1000, label: 'Up to ₹1,000' },
  { value: 2000, label: 'Up to ₹2,000' },
  { value: 3000, label: 'Up to ₹3,000' },
];

const WEIGHTS = { country: 30, category: 30, cartCategory: 18, cartCountry: 12, era: 15, budget: 15, condition: 10 };
const MAX_SCORE = WEIGHTS.country + WEIGHTS.category + WEIGHTS.era + WEIGHTS.budget + WEIGHTS.condition;

/** True when the collector has told us nothing at all. */
export function hasPreferences(prefs) {
  const p = prefs || EMPTY_PREFS;
  return p.countries.length > 0 || p.categories.length > 0 || p.conditions.length > 0 || p.budget > 0 || p.era !== 'any';
}

/**
 * Scores one stamp. Returns { score, reasons }.
 * `cartTaste` = { categories:Set, countries:Set } built from the stamps in the cart.
 */
function scoreStamp(stamp, prefs, cartTaste) {
  let score = 0;
  const reasons = [];
  const era = ERAS.find((e) => e.value === prefs.era) || ERAS[0];

  if (prefs.countries.includes(stamp.country)) {
    score += WEIGHTS.country;
    reasons.push(`You like stamps from ${stamp.country}`);
  } else if (cartTaste.countries.has(stamp.country)) {
    score += WEIGHTS.cartCountry;
    reasons.push(`Matches ${stamp.country} stamps in your cart`);
  }

  if (prefs.categories.includes(stamp.category)) {
    score += WEIGHTS.category;
    reasons.push(`You collect ${stamp.category}`);
  } else if (cartTaste.categories.has(stamp.category)) {
    score += WEIGHTS.cartCategory;
    reasons.push(`Similar to the ${stamp.category} in your cart`);
  }

  if (prefs.era !== 'any' && stamp.year >= era.min && stamp.year <= era.max) {
    score += WEIGHTS.era;
    reasons.push(`From the ${era.label}`);
  }

  if (prefs.budget > 0 && stamp.price <= prefs.budget) {
    score += WEIGHTS.budget;
    reasons.push('Fits your budget');
  }

  if (prefs.conditions.includes(stamp.condition)) {
    score += WEIGHTS.condition;
    reasons.push(`${stamp.condition} condition, as you prefer`);
  }

  return { score, reasons };
}

/**
 * Main entry point.
 *   stamps     – the full catalogue
 *   prefs      – { countries[], categories[], conditions[], budget, era }
 *   cartItems  – items from useCart() (only their ids are used)
 *   limit      – how many picks to return (default 8)
 *
 * Returns { mode, picks }. Each pick is { stamp, match (0-100), reasons[] }.
 *   mode 'personal'  – we had preferences or cart signals to work with
 *   mode 'popular'   – nothing to go on yet, so we show a starter selection
 * Stamps already in the cart are never suggested again. If a budget is set, stamps above it are
 * dropped completely (nobody wants suggestions they cannot afford).
 */
export function recommend(stamps, prefs, cartItems = [], limit = 8) {
  const safePrefs = { ...EMPTY_PREFS, ...(prefs || {}) };
  const inCart = new Set(cartItems.map((i) => i.id));

  const cartTaste = { categories: new Set(), countries: new Set() };
  stamps.forEach((s) => {
    if (inCart.has(s.id)) {
      cartTaste.categories.add(s.category);
      cartTaste.countries.add(s.country);
    }
  });

  const candidates = stamps.filter((s) => !inCart.has(s.id) && (safePrefs.budget === 0 || s.price <= safePrefs.budget));
  const personal = hasPreferences(safePrefs) || inCart.size > 0;

  if (!personal) {
    // Starter selection: one stamp from each category first, so the page is varied.
    const seen = new Set();
    const varied = candidates.filter((s) => (seen.has(s.category) ? false : seen.add(s.category)));
    const rest = candidates.filter((s) => !varied.includes(s));
    return {
      mode: 'popular',
      picks: [...varied, ...rest].slice(0, limit).map((stamp) => ({ stamp, match: 0, reasons: ['Popular with new collectors'] })),
    };
  }

  const picks = candidates
    .map((stamp) => ({ stamp, ...scoreStamp(stamp, safePrefs, cartTaste) }))
    .filter((p) => p.score > 0)
    // Highest score first; equal scores: cheaper first, then id, so the order never jumps around.
    .sort((a, b) => b.score - a.score || a.stamp.price - b.stamp.price || a.stamp.id.localeCompare(b.stamp.id))
    .slice(0, limit)
    .map((p) => ({ stamp: p.stamp, reasons: p.reasons, match: Math.min(100, Math.round((p.score / MAX_SCORE) * 100)) }));

  return { mode: 'personal', picks };
}
