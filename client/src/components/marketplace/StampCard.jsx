export default function StampCard({ stamp }) {
  const p = stamp.palette || {};
  return (
    <div className="group overflow-hidden rounded-xl border border-forest-800/10 bg-white shadow-sm transition hover:shadow-lg">
      <div
        className="aspect-[4/5] flex items-center justify-center text-sm font-semibold"
        style={{ background: `linear-gradient(135deg, ${p.sky1 || '#1b3a2b'}, ${p.sky2 || '#2f6b4f'})`, color: p.text || '#fff' }}
      >
        {stamp.denomination}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg text-forest-900">{stamp.name}</h3>
          <span className="shrink-0 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-forest-800">{stamp.condition}</span>
        </div>
        <p className="mt-1 text-sm text-forest-700/70">{stamp.country} · {stamp.year}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-forest-700/50">{stamp.category}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-forest-900">₹{stamp.price}</span>
          <button className="rounded-full bg-forest-800 px-4 py-1.5 text-sm font-semibold text-gold-300 transition hover:bg-forest-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}