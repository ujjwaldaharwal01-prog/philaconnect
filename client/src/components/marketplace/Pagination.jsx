/**
 * Previous / numbered pages / Next. Renders nothing when there is only one page.
 * `page` is 1-based; `onChange(newPage)` is called when a button is clicked.
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const btn =
    'min-w-10 rounded-full border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${btn} border-forest-800/25 text-forest-800 hover:bg-forest-800/5`}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`Page ${n}`}
          aria-current={n === page ? 'page' : undefined}
          className={`${btn} ${
            n === page
              ? 'border-forest-800 bg-forest-800 text-gold-300'
              : 'border-forest-800/25 text-forest-800 hover:bg-forest-800/5'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${btn} border-forest-800/25 text-forest-800 hover:bg-forest-800/5`}
      >
        Next
      </button>
    </nav>
  );
}
