/**
 * Cart storage helpers: save/load the cart in the browser (localStorage) safely.
 *
 * localStorage can be empty, blocked (private mode) or edited by hand, so every
 * read is wrapped in try/catch and the data is VALIDATED before it is trusted.
 * Bad entries are dropped instead of crashing the site.
 *
 * LATER (orders step): the cart will also be saved on the server for logged-in users.
 */

export const CART_KEY = 'philaconnect_cart_v1';
export const MAX_QTY = 5; // per stamp (sample limit; real stock comes with the backend)

/** Whole number between 1 and MAX_QTY; anything invalid becomes 1. */
export function clampQty(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_QTY);
}

/** Copies only the stamp fields the cart needs (a snapshot, so the cart never breaks if data changes). */
function pickFields(stamp) {
  return {
    id: stamp.id,
    name: stamp.name,
    country: stamp.country,
    year: stamp.year,
    category: stamp.category,
    condition: stamp.condition,
    price: stamp.price,
    denomination: stamp.denomination,
    scene: stamp.scene,
    palette: stamp.palette,
  };
}

/** Builds a cart line from a stamp and a quantity. */
export function toCartItem(stamp, qty = 1) {
  return { ...pickFields(stamp), qty: clampQty(qty) };
}

/**
 * Cleans an unknown value into a valid items array:
 * drops non-objects, missing id/name, bad prices and duplicates; clamps quantities.
 */
export function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const clean = [];
  raw.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    if (typeof item.id !== 'string' || !item.id || seen.has(item.id)) return;
    if (typeof item.name !== 'string' || !item.name) return;
    if (!Number.isFinite(item.price) || item.price < 0) return;
    seen.add(item.id);
    clean.push({ ...pickFields(item), qty: clampQty(item.qty) });
  });
  return clean;
}

/** Reads the saved cart. Returns [] when nothing is saved or the data is unreadable. */
export function loadCart() {
  try {
    const text = window.localStorage.getItem(CART_KEY);
    return text ? sanitizeItems(JSON.parse(text)) : [];
  } catch {
    return [];
  }
}

/** Saves the cart. Returns false (instead of throwing) if the browser blocks storage. */
export function saveCart(items) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
