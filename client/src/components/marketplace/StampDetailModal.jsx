import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import { CloseIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';
import { CONDITION_INFO } from '../../data/stamps';

/**
 * Details window for one stamp, opened from "View details".
 * Accessibility: role="dialog", Escape and backdrop click close it, focus moves into it
 * on open and returns to the trigger on close, and page scrolling is locked while open.
 * "Add to cart" uses the shared cart (CartContext).
 */
export default function StampDetailModal({ stamp, onClose }) {
  const closeRef = useRef(null);
  const { addItem, getQuantity } = useCart();

  useEffect(() => {
    if (!stamp) return undefined;
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [stamp, onClose]);

  if (!stamp) return null;
  const { name, country, year, category, condition, price, denomination, scene, palette } = stamp;
  const inCart = getQuantity(stamp.id);

  const facts = [
    ['Country', country],
    ['Year', year],
    ['Category', category],
    ['Condition', condition],
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-forest-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stamp-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-offwhite shadow-2xl sm:rounded-3xl md:grid-cols-[1fr_1.2fr]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-forest-900 shadow transition hover:bg-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center bg-gradient-to-b from-cream to-parchment p-8">
          <StampFrame className="w-48 sm:w-56">
            <StampArt scene={scene} palette={palette} country={country} year={year} denomination={denomination} className="block w-full" />
          </StampFrame>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">{category}</p>
          <h2 id="stamp-modal-title" className="mt-2 text-2xl font-semibold text-forest-900">
            {name}
          </h2>
          <p className="mt-3 font-display text-3xl font-semibold text-forest-900">{formatPrice(price)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-ink/50">{label}</dt>
                <dd className="font-medium text-forest-900">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 rounded-xl bg-cream p-4 text-sm leading-relaxed text-ink/75">
            <span className="font-semibold text-forest-900">{condition}: </span>
            {CONDITION_INFO[condition] ?? 'Condition as described by the seller.'}
          </p>

          <button
            type="button"
            onClick={() => addItem(stamp)}
            className="mt-6 w-full rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-gold-300 transition hover:bg-forest-700"
          >
            {inCart > 0 ? `Add another (${inCart} in cart)` : 'Add to cart'}
          </button>
          {inCart > 0 && (
            <Link
              to="/cart"
              onClick={onClose}
              className="mt-3 block text-center text-sm font-medium text-forest-800 underline-offset-4 hover:underline"
            >
              View cart
            </Link>
          )}
          <p className="mt-3 text-xs text-ink/45">Sample listing for demonstration. No payment is taken.</p>
        </div>
      </div>
    </div>
  );
}
