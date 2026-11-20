import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import QuantityStepper from './QuantityStepper';
import { formatPrice } from '../../utils/format';
import { MAX_QTY } from '../../utils/cartStorage';

/**
 * One line in the cart: thumbnail, details, quantity control, line total and remove button.
 * Props: `item` (a cart line), `onQuantity(id, qty)`, `onRemove(id)`.
 */
export default function CartItemRow({ item, onQuantity, onRemove }) {
  const { id, name, country, year, condition, price, qty, denomination, scene, palette } = item;

  return (
    <li
      className="flex flex-col gap-4 rounded-2xl border border-forest-800/10 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:gap-6 sm:p-5"
      data-testid="cart-row"
    >
      <div className="flex items-center gap-4 sm:flex-1">
        <StampFrame className="w-20 shrink-0" padding="p-1.5">
          <StampArt scene={scene} palette={palette} country={country} year={year} denomination={denomination} className="block w-full" />
        </StampFrame>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug text-forest-900">{name}</h3>
          <p className="mt-1 text-sm text-ink/60">
            {country} · {year} · {condition}
          </p>
          <p className="mt-1 text-sm text-ink/60">{formatPrice(price)} each</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-8">
        <QuantityStepper
          value={qty}
          max={MAX_QTY}
          label={`Quantity for ${name}`}
          onChange={(n) => onQuantity(id, n)}
        />
        <p className="w-24 text-right font-display text-lg font-semibold text-forest-900" data-testid="line-total">
          {formatPrice(price * qty)}
        </p>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remove ${name} from cart`}
          className="text-sm font-medium text-red-700 underline-offset-4 hover:underline"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
