import { Link } from 'react-router-dom';
import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import { stamps } from '../../data/stamps';
import { formatPrice } from '../../utils/format';
import { useCart } from '../../context/CartContext';

const byId = new Map(stamps.map((s) => [s.id, s]));

/** Small stamp card shown inside a chat answer: picture, name, price, reasons, and two actions. */
export default function ChatStampCard({ stampId, reasons = [] }) {
  const { addItem, getQuantity } = useCart();
  const s = byId.get(stampId);
  if (!s) return null;
  const inCart = getQuantity(s.id);
  return (
    <div className="mt-2 flex gap-3 rounded-xl bg-white p-3 text-ink shadow-sm ring-1 ring-forest-800/10" data-testid="chat-stamp">
      <StampFrame className="w-14 shrink-0">
        <StampArt scene={s.scene} palette={s.palette} country={s.country} year={s.year} denomination={s.denomination} className="block w-full" />
      </StampFrame>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-900">{s.name}</p>
        <p className="text-xs text-ink/60">
          {s.country} · {s.year} · {s.condition}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-forest-900">{formatPrice(s.price)}</p>
        {reasons.length > 0 && <p className="mt-1 text-[11px] leading-snug text-ink/60">{reasons.join(' · ')}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addItem(s)}
            aria-label={`Add ${s.name} to cart`}
            className="rounded-full bg-forest-800 px-3 py-1 text-xs font-semibold text-gold-300 hover:bg-forest-700"
          >
            {inCart > 0 ? `Add another (${inCart})` : 'Add to cart'}
          </button>
          <Link to={`/marketplace?q=${encodeURIComponent(s.name)}`} className="rounded-full border border-forest-800/25 px-3 py-1 text-xs font-medium text-forest-800 hover:bg-forest-800/5">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
