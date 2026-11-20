import { getToken } from '../utils/auth';

/**
 * Talks to the Express server for orders and the profile.
 * Every call sends the login token in the "Authorization: Bearer ..." header.
 * Failures are turned into ApiError with a plain-English message the page can show.
 * (Relative URLs like /api/orders work because vite.config.js proxies /api to port 5000.)
 */
export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors; // per-field messages from server validation
  }
}

async function request(path, options = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Please check that it is running on port 5000.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null; // server returned no JSON (for example when it is stopped)
  }

  if (!response.ok) {
    const fallback =
      response.status >= 500
        ? 'The server is not responding. Please check that it is running, then try again.'
        : 'Something went wrong. Please try again.';
    throw new ApiError(data?.message || fallback, response.status, data?.errors || null);
  }
  return data;
}

/** Places an order. `payload` = shipping fields + paymentMethod + items [{ id, qty }]. */
export function placeOrder(payload) {
  return request('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

/** The logged-in user's orders, newest first. Resolves to { orders: [...] }. */
export function fetchMyOrders() {
  return request('/orders');
}

/** One of my orders. Resolves to { order }. */
export function fetchOrder(id) {
  return request(`/orders/${encodeURIComponent(id)}`);
}

/** The logged-in user's profile. Resolves to { user: { id, name, email } }. */
export function fetchMe() {
  return request('/users/me');
}
