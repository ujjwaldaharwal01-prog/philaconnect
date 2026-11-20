/** Small coloured pill for an order or payment status. `map` is ORDER_STATUS or PAYMENT_STATUS. */
export default function StatusBadge({ value, map }) {
  const entry = map[value] ?? { label: value, className: 'bg-parchment text-ink/70' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${entry.className}`}>{entry.label}</span>
  );
}
