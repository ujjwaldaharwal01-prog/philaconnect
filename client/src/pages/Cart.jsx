import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import CartItemRow from '../components/cart/CartItemRow';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/ui/Button';

/**
 * Shopping cart page (route: /cart).
 * Reads everything from the shared cart (CartContext): list of lines with quantity
 * controls and remove buttons, a summary box, and a friendly empty state.
 */
export default function Cart() {
  useDocumentTitle('Shopping Cart');
  const { items, itemCount, subtotal, setQuantity, removeItem, clearCart } = useCart();

  const confirmClear = () => {
    if (window.confirm('Remove all stamps from your cart?')) clearCart();
  };

  return (
    <div className="bg-cream">
      <div className="container-page py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">Your selection</p>
        <h1 className="mt-2 text-4xl font-semibold text-forest-900">Shopping cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-forest-800/25 bg-offwhite px-6 py-16 text-center" data-testid="cart-empty">
            <p className="font-display text-2xl font-semibold text-forest-900">Your cart is empty</p>
            <p className="mx-auto mt-2 max-w-md text-ink/60">
              Browse the marketplace and add stamps you love. They will wait for you here.
            </p>
            <Button to="/marketplace" variant="dark" className="mt-8">
              Browse the marketplace
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <section aria-label="Items in your cart">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-ink/65">
                  {itemCount} item{itemCount === 1 ? '' : 's'} in your cart
                </p>
                <button
                  type="button"
                  onClick={confirmClear}
                  className="text-sm font-medium text-red-700 underline-offset-4 hover:underline"
                >
                  Clear cart
                </button>
              </div>
              <ul className="space-y-4">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} onQuantity={setQuantity} onRemove={removeItem} />
                ))}
              </ul>
            </section>
            <CartSummary itemCount={itemCount} subtotal={subtotal} />
          </div>
        )}
      </div>
    </div>
  );
}
