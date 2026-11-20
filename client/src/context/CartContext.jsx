import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import { CART_KEY, MAX_QTY, clampQty, loadCart, saveCart, toCartItem } from '../utils/cartStorage';

/**
 * CartContext: one shared cart for the whole site.
 *
 * Any component can call `useCart()` to read the cart (items, itemCount, subtotal) or change
 * it (addItem, setQuantity, removeItem, clearCart). The navbar badge, the stamp cards, the
 * details window and the cart page all use the SAME cart, so they always agree.
 *
 * <CartProvider> must wrap <App /> (inside <BrowserRouter>) in main.jsx.
 * It also draws the small "added to cart" message (toast) at the bottom of the screen.
 */
const CartContext = createContext(null);

const TOAST_MS = 3200;

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart); // lazy init: reads saved cart once
  const [toast, setToast] = useState(null); // { message, kind: 'success' | 'error' }
  const timerRef = useRef(null);
  const inRouter = useInRouterContext();

  // Save every change.
  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) setItems(loadCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showToast = useCallback((message, kind = 'success') => {
    clearTimeout(timerRef.current);
    setToast({ message, kind });
    timerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  /** Adds a stamp (or increases its quantity). Returns { ok, reason }. */
  const addItem = useCallback(
    (stamp, qty = 1) => {
      if (!stamp || typeof stamp.id !== 'string' || !Number.isFinite(stamp.price)) {
        showToast('Sorry, this stamp could not be added to the cart.', 'error');
        return { ok: false, reason: 'invalid' };
      }
      const existing = items.find((i) => i.id === stamp.id);
      const current = existing ? existing.qty : 0;
      if (current >= MAX_QTY) {
        showToast(`You already have the maximum of ${MAX_QTY} for "${stamp.name}".`, 'error');
        return { ok: false, reason: 'max' };
      }
      const next = Math.min(current + clampQty(qty), MAX_QTY);
      setItems((prev) =>
        prev.some((i) => i.id === stamp.id)
          ? prev.map((i) => (i.id === stamp.id ? { ...i, qty: next } : i))
          : [...prev, toCartItem(stamp, next)],
      );
      showToast(`"${stamp.name}" added to your cart.`, 'success');
      return { ok: true };
    },
    [items, showToast],
  );

  /** Sets an exact quantity (clamped to 1..MAX_QTY). Use removeItem to delete a line. */
  const setQuantity = useCallback((id, qty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantity = useCallback((id) => items.find((i) => i.id === id)?.qty ?? 0, [items]);

  // Derived totals (recomputed only when items change).
  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    [items],
  );

  const value = useMemo(
    () => ({ items, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart, getQuantity }),
    [items, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart, getQuantity],
  );

  const viewCart =
    toast?.kind === 'success' &&
    (inRouter ? (
      <Link to="/cart" className="font-semibold text-gold-300 underline underline-offset-4">
        View cart
      </Link>
    ) : (
      <a href="/cart" className="font-semibold text-gold-300 underline underline-offset-4">
        View cart
      </a>
    ));

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="cart-toast"
          className={`fixed bottom-6 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-sm shadow-2xl ${
            toast.kind === 'error' ? 'bg-red-800 text-white' : 'bg-forest-900 text-cream'
          }`}
        >
          <span>{toast.message}</span>
          {viewCart}
        </div>
      )}
    </CartContext.Provider>
  );
}

/** Hook to use the cart. Throws a clear message if <CartProvider> is missing. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>. Check that main.jsx wraps <App /> with it.');
  }
  return ctx;
}
