import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getToken } from '../utils/auth';
import { fetchOrder } from '../services/orderService';
import { formatDate, formatPrice } from '../utils/format';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/orderLabels';
import StatusBadge from '../components/orders/StatusBadge';
import LoginPrompt from '../components/orders/LoginPrompt';
import Button from '../components/ui/Button';

/**
 * One order (route: /orders/:id). Also the "thank you" page right after checkout
 * (the checkout page passes { justPlaced: true } so a confirmation banner is shown).
 * The server only returns the order when it belongs to the logged-in user.
 */
export default function OrderDetail() {
  const { id } = useParams();
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  useDocumentTitle(`Order #${id}`);

  // Remember "just placed" for this visit, then wipe it from the browser history entry,
  // so refreshing the page later does not show the thank-you banner again.
  const [justPlaced] = useState(() => Boolean(state?.justPlaced));
  useEffect(() => {
    if (justPlaced) navigate(pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (!loggedIn) return undefined;
    let cancelled = false; // ignore the answer if the user already left this page
    setStatus('loading');
    fetchOrder(id)
      .then((data) => {
        if (cancelled) return;
        setOrder(data.order);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, loggedIn]);

  const shell = (children) => (
    <div className="bg-cream">
      <div className="container-page py-12">{children}</div>
    </div>
  );

  if (!loggedIn) {
    return shell(<LoginPrompt title="Log in to see your order" message="Orders are private to your account." />);
  }
  if (status === 'loading') {
    return shell(<p className="py-20 text-center text-ink/60">Loading your order…</p>);
  }
  if (status === 'error') {
    return shell(
      <div role="alert" className="mx-auto max-w-lg rounded-3xl border border-red-300 bg-red-50 p-10 text-center">
        <h1 className="text-2xl font-semibold text-red-900">{error?.status === 404 ? 'Order not found' : 'Could not load the order'}</h1>
        <p className="mt-2 text-sm text-red-800/80">{error?.message}</p>
        <Button to="/profile" variant="dark" className="mt-6">
          Go to my orders
        </Button>
      </div>,
    );
  }

  const s = order.shipping;
  return shell(
    <>
      {justPlaced && (
        <div role="status" className="mb-8 rounded-2xl border border-gold-500/50 bg-gold-400/10 p-6" data-testid="order-success">
          <h2 className="font-display text-2xl font-semibold text-forest-900">Thank you! Your order is placed.</h2>
          <p className="mt-2 text-sm text-ink/75">
            Your order number is <strong>#{order.id}</strong>.{' '}
            {order.paymentMethod === 'cod'
              ? `Please keep ${formatPrice(order.subtotal)} ready to pay in cash on delivery.`
              : `We will message you on ${s.phone} with the bank / UPI transfer details once your order is confirmed.`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Order</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest-900" data-testid="order-title">
            Order #{order.id}
          </h1>
          <p className="mt-2 text-sm text-ink/60">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={order.status} map={ORDER_STATUS} />
          <StatusBadge value={order.paymentStatus} map={PAYMENT_STATUS} />
        </div>
      </div>
<div className="mt-8 rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
  <h2 className="font-display text-xl font-semibold text-forest-900 mb-5">Track your order</h2>
  <div className="flex items-center justify-between">
    {['placed', 'confirmed', 'shipped', 'delivered'].map((stage, i, arr) => {
      const stageOrder = ['placed', 'confirmed', 'shipped', 'delivered'];
      const currentIndex = stageOrder.indexOf(order.status);
      const thisIndex = stageOrder.indexOf(stage);
      const done = order.status !== 'cancelled' && thisIndex <= currentIndex;
      return (
        <div key={stage} className="flex flex-1 items-center">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
              done ? 'bg-forest-800 text-gold-300' : 'bg-gray-200 text-gray-400'
            }`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`mt-2 text-xs text-center ${done ? 'text-forest-900 font-semibold' : 'text-gray-400'}`}>
              {ORDER_STATUS[stage]?.label}
            </span>
          </div>
          {i < arr.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-forest-800' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
  {order.status === 'cancelled' && (
    <p className="mt-4 text-center text-sm text-red-700 font-medium">This order has been cancelled.</p>
  )}
</div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Items" className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-forest-900">Items</h2>
          <ul className="mt-4 divide-y divide-forest-800/10">
            {order.items.map((item) => (
              <li key={item.stampId} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-forest-900">{item.name}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {item.country} · {item.year} · {item.condition}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="font-display text-lg font-semibold text-forest-900">{formatPrice(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-forest-800/10 pt-4">
            <span className="font-semibold text-forest-900">Total</span>
            <span className="font-display text-2xl font-semibold text-forest-900" data-testid="order-total">
              {formatPrice(order.subtotal)}
            </span>
          </div>
        </section>

        <div className="space-y-6">
          <section aria-label="Payment" className="rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-forest-900">Payment</h2>
            <p className="mt-2 text-sm font-medium text-forest-900" data-testid="order-payment-method">
              {order.paymentMethodLabel}
            </p>
            <p className="mt-1 text-sm text-ink/65">
              {order.paymentStatus === 'paid'
                ? 'Payment received. Thank you!'
                : order.paymentMethod === 'cod'
                  ? 'Pay in cash when your order is delivered.'
                  : 'Waiting for your transfer. We will send the details after confirming your order.'}
            </p>
          </section>
          <section aria-label="Delivery address" className="rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-forest-900">Deliver to</h2>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ink/75">
              {s.fullName}
              <br />
              {s.addressLine1}
              {s.addressLine2 && (
                <>
                  <br />
                  {s.addressLine2}
                </>
              )}
              <br />
              {s.city}, {s.state} {s.postalCode}
              <br />
              {s.country}
              <br />
              Phone: {s.phone}
            </address>
            {order.notes && <p className="mt-3 text-sm text-ink/60">Note: {order.notes}</p>}
          </section>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button to="/profile" variant="dark">
          All my orders
        </Button>
        <Button to="/marketplace" variant="outlineDark">
          Continue shopping
        </Button>
      </div>
      <p className="mt-6 text-xs text-ink/45">
        Questions about this order? Visit the <Link to="/community" className="underline">community</Link>.
      </p>
    </>,
  );
}
