/** Pulsing placeholder cards shown while stamps are loading, so the layout does not jump. */
export default function StampGridSkeleton({ count = 6 }) {
  return (
    <ul
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading stamps"
      data-testid="skeleton"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-2xl border border-forest-800/10 bg-white">
          <div className="h-52 bg-parchment/70" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 rounded bg-parchment" />
            <div className="h-5 w-3/4 rounded bg-parchment" />
            <div className="h-4 w-1/2 rounded bg-parchment" />
            <div className="h-8 w-full rounded bg-parchment/70" />
          </div>
        </li>
      ))}
    </ul>
  );
}
