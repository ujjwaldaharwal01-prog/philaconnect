import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getToken } from '../utils/auth';
import { fetchMe, fetchMyOrders } from '../services/orderService';
import { formatDate, formatPrice } from '../utils/format';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/orderLabels';
import StatusBadge from '../components/orders/StatusBadge';
import LoginPrompt from '../components/orders/LoginPrompt';
import Button from '../components/ui/Button';

// "Anaya Rao" -> "AR" for the avatar circle.
const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

/**
 * Profile page (route: /profile): who you are, a few totals, and your order history.
 * Loads the profile and the orders in parallel from the server (login required).
 */
export default function Profile() {
  useDocumentTitle('My profile');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0); // bump to retry
  const loggedIn = Boolean(getToken());

  useEffect(() => {
    if (!loggedIn) return undefined;
    let cancelled = false;
    setStatus('loading');
    Promise.all([fetchMe(), fetchMyOrders()])
      .then(([me, mine]) => {
        if (cancelled) return;
        setUser(me.user);
        setOrders(mine.orders);
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
  }, [loggedIn, attempt]);

  const shell = (children) => (
    <div className="bg-cream">
      <div className="container-page py-12">{children}</div>
    </div>
  );

  if (!loggedIn) {
    return shell(<LoginPrompt title="Log in to see your profile" message="Your profile and order history are private to your account." />);
  }
  if (status === 'loading') {
    return shell(<p className="py-20 text-center text-ink/60">Loading your profile…</p>);
  }
  if (status === 'error') {
    return shell(
      <div role="alert" className="mx-auto max-w-lg rounded-3xl border border-red-300 bg-red-50 p-10 text-center">
        <h1 className="text-2xl font-semibold text-red-900">Could not load your profile</h1>
        <p className="mt-2 text-sm text-red-800/80">{error?.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-gold-300">
            Try again
          </button>
          {error?.status === 401 && (
            <Button to="/login" variant="outlineDark">
              Log in again
            </Button>
          )}
        </div>
      </div>,
    );
  }

  const countable = orders.filter((o) => o.status !== 'cancelled');
  const totalSpent = countable.reduce((sum, o) => sum + o.subtotal, 0);

  return shell(
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">My account</p>
      <div className="mt-4 flex flex-wrap items-center gap-5 rounded-3xl border border-forest-800/10 bg-offwhite p-6 shadow-card">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-800 font-display text-2xl font-semibold text-gold-300" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-forest-900" data-testid="profile-name">
            {user.name}
          </h1>
          <p className="text-ink/65" data-testid="profile-email">
            {user.email}
          </p>
        </div>
        <dl className="flex gap-8 text-center">
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink/50">Orders</dt>
            <dd className="font-display text-2xl font-semibold text-forest-900" data-testid="profile-order-count">
              {countable.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink/50">Total ordered</dt>
            <dd className="font-display text-2xl font-semibold text-forest-900">{formatPrice(totalSpent)}</dd>
          </div>
        </dl>
      </div>

      <h2 className="mt-12 text-2xl font-semibold text-forest-900">Order history</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-forest-800/25 bg-offwhite px-6 py-14 text-center" data-testid="no-orders">
          <p className="font-display text-xl font-semibold text-forest-900">No orders yet</p>
          <p className="mt-2 text-ink/60">When you place an order, it will appear here.</p>
          <Button to="/marketplace" variant="dark" className="mt-6">
            Browse the marketplace
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4" data-testid="order-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-800/10 bg-white p-5 shadow-card transition motion-safe:hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-forest-900">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {order.paymentMethodLabel}
                  </p>
                  <p className="mt-1 text-sm text-ink/50">{order.items.map((i) => i.name).join(', ')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-display text-xl font-semibold text-forest-900">{formatPrice(order.subtotal)}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <StatusBadge value={order.status} map={ORDER_STATUS} />
                    <StatusBadge value={order.paymentStatus} map={PAYMENT_STATUS} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>,
  );
}
