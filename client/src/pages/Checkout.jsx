import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getStoredUser, getToken } from '../utils/auth';
import { validateCheckout } from '../utils/checkoutValidation';
import { placeOrder } from '../services/orderService';
import { PAYMENT_METHODS } from '../constants/payment';
import { formatPrice } from '../utils/format';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import LoginPrompt from '../components/orders/LoginPrompt';

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  paymentMethod: '',
  notes: '',
};

/**
 * Checkout page (route: /checkout).
 *
 * Flow: must be logged in -> cart must have items -> fill delivery details -> choose
 * Cash on Delivery or Pay later -> "Place order". The order is saved on the server as
 * "Payment pending". NO online payment is taken.
 *
 * Validation runs in the browser first (checkoutValidation.js) and again on the server.
 */
export default function Checkout() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const { items, itemCount, subtotal, clearCart } = useCart();

  // Start with the saved name filled in (when we can find it).
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, fullName: getStoredUser()?.name ?? '' }));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voucher, setVoucher] = useState(null);

  const loggedIn = Boolean(getToken());

  // Check for an active daily-spin discount voucher and show it in the order summary.
  useEffect(() => {
    if (!loggedIn) return;
    fetch('/api/game/spin-status', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.activeVoucherPercent > 0) setVoucher(data.activeVoucherPercent);
      })
      .catch(() => {});
  }, [loggedIn]);

  // Updates one field and clears that field's error as the user types.
  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return; // ignore double clicks

    const found = validateCheckout(form);
    setErrors(found);
    setServerError('');
    setSessionExpired(false);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      // Move the cursor to the first field that needs fixing.
      document.getElementById(firstBad === 'paymentMethod' ? 'payment-cod' : firstBad)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { order } = await placeOrder({
        ...form,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        spinVoucherPercent: voucher || 0,
      });
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
      clearCart();
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      if (err.status === 401) setSessionExpired(true);
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div className="bg-cream">
      <div className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Almost there</p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">Checkout</h1>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );

  if (!loggedIn) {
    return shell(
      <LoginPrompt
        title="Log in to place your order"
        message="Your cart is saved. Log in or create an account, then come back to finish checkout."
      />,
    );
  }

  if (items.length === 0) {
    return shell(
      <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-forest-800/25 bg-offwhite px-6 py-14 text-center" data-testid="checkout-empty">
        <h2 className="font-display text-2xl font-semibold text-forest-900">Your cart is empty</h2>
        <p className="mt-3 text-ink/65">Add a few stamps before checking out.</p>
        <Button to="/marketplace" variant="dark" className="mt-8">
          Browse the marketplace
        </Button>
      </div>,
    );
  }

  return shell(
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem]" data-testid="checkout-form">
      <div className="space-y-8">
        {serverError && (
          <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900" data-testid="server-error">
            {serverError}{' '}
            {sessionExpired && (
              <Link to="/login" className="font-semibold underline">
                Log in again
              </Link>
            )}
          </div>
        )}

        {/* Delivery details */}
        <fieldset className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
          <legend className="px-2 font-display text-xl font-semibold text-forest-900">Delivery details</legend>
          <div className="mt-2 grid gap-5 sm:grid-cols-2">
            <FormField id="fullName" label="Full name" required value={form.fullName} onChange={setField('fullName')} error={errors.fullName} autoComplete="name" maxLength={100} />
            <FormField id="phone" label="Phone number" required value={form.phone} onChange={setField('phone')} error={errors.phone} autoComplete="tel" inputMode="tel" placeholder="e.g. 9876543210" maxLength={20} />
            <FormField id="addressLine1" label="Street address" required className="sm:col-span-2" value={form.addressLine1} onChange={setField('addressLine1')} error={errors.addressLine1} autoComplete="address-line1" maxLength={150} />
            <FormField id="addressLine2" label="Apartment, landmark (optional)" className="sm:col-span-2" value={form.addressLine2} onChange={setField('addressLine2')} error={errors.addressLine2} autoComplete="address-line2" maxLength={150} />
            <FormField id="city" label="City" required value={form.city} onChange={setField('city')} error={errors.city} autoComplete="address-level2" maxLength={80} />
            <FormField id="state" label="State" required value={form.state} onChange={setField('state')} error={errors.state} autoComplete="address-level1" maxLength={80} />
            <FormField id="postalCode" label="PIN code" required value={form.postalCode} onChange={setField('postalCode')} error={errors.postalCode} autoComplete="postal-code" inputMode="numeric" placeholder="6 digits" maxLength={6} />
            <FormField id="country" label="Country" value={form.country} onChange={setField('country')} error={errors.country} autoComplete="country-name" maxLength={60} />
          </div>
        </fieldset>

        {/* Payment method */}
        <fieldset className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
          <legend className="px-2 font-display text-xl font-semibold text-forest-900">Payment method</legend>
          <p className="mt-1 text-sm text-ink/60">No online payment is taken. You pay after the order is placed.</p>
          <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
            {PAYMENT_METHODS.map((method) => {
              const selected = form.paymentMethod === method.value;
              return (
                <label
                  key={method.value}
                  htmlFor={`payment-${method.value}`}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                    selected ? 'border-gold-500 bg-gold-400/10' : 'border-forest-800/15 hover:bg-forest-800/5'
                  }`}
                >
                  <input
                    id={`payment-${method.value}`}
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={selected}
                    onChange={setField('paymentMethod')}
                    className="mt-1 h-4 w-4 accent-forest-800"
                  />
                  <span>
                    <span className="block font-semibold text-forest-900">{method.label}</span>
                    <span className="mt-0.5 block text-sm text-ink/65">{method.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.paymentMethod && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {errors.paymentMethod}
            </p>
          )}
        </fieldset>

        <FormField
          id="notes"
          as="textarea"
          rows={3}
          label="Order notes (optional)"
          hint="Anything we should know about delivery. Up to 300 characters."
          value={form.notes}
          onChange={setField('notes')}
          error={errors.notes}
          maxLength={300}
        />
      </div>

      {/* Summary */}
      <aside aria-label="Order summary" className="h-fit rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold text-forest-900">Your order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="text-ink/80">
                {item.name} <span className="text-ink/50">× {item.qty}</span>
              </span>
              <span className="font-medium text-forest-900">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        {voucher && (
          <div className="mt-4 flex justify-between text-sm text-green-700 font-medium">
            <span>🎉 Spin voucher ({voucher}% off)</span>
            <span>− {formatPrice(subtotal * (voucher / 100))}</span>
          </div>
        )}
        <div className="mt-4 flex justify-between border-t border-forest-800/10 pt-4">
          <span className="font-semibold text-forest-900">Total ({itemCount} items)</span>
          <span className="font-display text-xl font-semibold text-forest-900" data-testid="checkout-total">
            {formatPrice(voucher ? subtotal * (1 - voucher / 100) : subtotal)}
          </span>
        </div>
        <p className="mt-2 text-xs text-ink/50">Shipping is confirmed when we contact you.</p>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-gold-300 transition hover:bg-forest-700 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? 'Placing your order…' : 'Place order'}
        </button>
        <Link to="/cart" className="mt-4 block text-center text-sm font-medium text-forest-800 underline-offset-4 hover:underline">
          Back to cart
        </Link>
      </aside>
    </form>,
  );
}