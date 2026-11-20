import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

/**
 * Order summary box beside the cart list.
 * "Proceed to checkout" opens /checkout, where the customer picks Cash on Delivery or
 * Pay later. NO online payment is taken (no fake payment integration).
 */
export default function CartSummary({ itemCount, subtotal }) {
  return (
    <aside
      aria-label="Order summary"
      className="h-fit rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card lg:sticky lg:top-24"
    >
      <h2 className="font-display text-xl font-semibold text-forest-900">Order summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/65">Items</dt>
          <dd className="font-medium text-forest-900" data-testid="summary-count">
            {itemCount}
          </dd>
        </div>
        <div className="flex justify-between border-t border-forest-800/10 pt-3 text-base">
          <dt className="font-semibold text-forest-900">Subtotal</dt>
          <dd className="font-display text-xl font-semibold text-forest-900" data-testid="summary-subtotal">
            {formatPrice(subtotal)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-ink/50">Shipping is confirmed when we contact you.</p>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded-full bg-forest-800 px-6 py-3 text-center text-sm font-semibold text-gold-300 transition hover:bg-forest-700"
      >
        Proceed to checkout
      </Link>

      <div className="mt-4 rounded-xl bg-cream p-3 text-xs leading-relaxed text-ink/65">
        <p className="font-semibold text-forest-900">Pay your way</p>
        <p className="mt-1">Choose Cash on Delivery or Pay later by bank / UPI transfer at checkout. No online payment is taken.</p>
      </div>

      <Link
        to="/marketplace"
        className="mt-5 block text-center text-sm font-medium text-forest-800 underline-offset-4 hover:underline"
      >
        Continue shopping
      </Link>
    </aside>
  );
}
