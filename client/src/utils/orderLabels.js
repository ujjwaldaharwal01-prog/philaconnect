// Display text and colours for order and payment statuses (used by StatusBadge).
// The keys match the values stored in the database (see server/setup-orders.js).

export const ORDER_STATUS = {
  placed: { label: 'Order placed', className: 'bg-gold-500/20 text-gold-600 ring-1 ring-gold-500/40' },
  confirmed: { label: 'Confirmed', className: 'bg-forest-600 text-cream' },
  shipped: { label: 'Shipped', className: 'bg-forest-800 text-gold-300' },
  delivered: { label: 'Delivered', className: 'bg-forest-900 text-gold-300' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 ring-1 ring-red-300' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Payment pending', className: 'bg-parchment text-forest-800 ring-1 ring-forest-800/20' },
  paid: { label: 'Paid', className: 'bg-forest-800 text-gold-300' },
  refunded: { label: 'Refunded', className: 'bg-parchment text-ink/70 ring-1 ring-ink/15' },
};
