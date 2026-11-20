import { Link } from 'react-router-dom';
import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import { formatPrice } from '../../utils/format';
import { useCart } from '../../context/CartContext';

// Badge colours per condition so buyers can scan quality at a glance.
const CONDITION_STYLES = {
  Mint: 'bg-forest-800 text-gold-300',
  'Mint Hinged': 'bg-forest-600 text-cream',
  'Very Fine': 'bg-gold-500/20 text-gold-600 ring-1 ring-gold-500/40',
  'Fine Used': 'bg-parchment text-forest-800 ring-1 ring-forest-800/15',
  Used: 'bg-parchment text-ink/70 ring-1 ring-ink/10',
};

/**
 * Product card for one stamp. Shows image, name, country, year, category,
 * condition and price (requirement #4 of the brief), plus an "Add to cart" button.
 *
 * `stamp` shape: { id, name, country, year, category, condition, price,
 *                  denomination, scene, palette }.
 * `onViewDetails(stamp)` (optional): when given, "View details" opens the details
 * window (marketplace); otherwise it links to /marketplace (homepage).
 */
export default function StampCard({ stamp, onViewDetails }) {
  const { addItem, getQuantity } = useCart();
  if (!stamp) return null; // defensive: never crash a list because of one bad entry

  const { name, country, year, category, condition, price, denomination, scene, palette } = stamp;
  const inCart = getQuantity(stamp.id);

  const detailsClass =
    'rounded-full border border-forest-800/25 px-4 py-1.5 text-sm font-medium text-forest-800 transition hover:bg-forest-800 hover:text-cream';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-forest-800/10 bg-white shadow-card transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-card-hover">
      {/* Artwork area on parchment, framed like a real stamp */}
      <div className="flex items-center justify-center bg-gradient-to-b from-cream to-parchment px-6 py-7">
        <StampFrame className="w-36 transition duration-500 motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-105 sm:w-40">
          <StampArt scene={scene} palette={palette} country={country} year={year} denomination={denomination} className="block w-full" />
        </StampFrame>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{category}</p>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CONDITION_STYLES[condition] ?? CONDITION_STYLES.Used}`}>
            {condition}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-semibold leading-snug text-forest-900">{name}</h3>
        <p className="mt-1 text-sm text-ink/65">
          {country} · {year}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="font-display text-xl font-semibold text-forest-900">{formatPrice(price)}</p>
          {onViewDetails ? (
            <button type="button" onClick={() => onViewDetails(stamp)} aria-label={`View details for ${name}`} className={detailsClass}>
              View details
            </button>
          ) : (
            <Link to="/marketplace" aria-label={`View details for ${name}`} className={detailsClass}>
              View details
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => addItem(stamp)}
          aria-label={`Add ${name} to cart`}
          className="mt-3 w-full rounded-full bg-forest-800 px-4 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-forest-700 motion-safe:active:scale-[0.98]"
        >
          {inCart > 0 ? `Add another (${inCart} in cart)` : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
