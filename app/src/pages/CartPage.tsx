import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';
import { Icons } from '../components/icons';

export function CartPage() {
  const { market, t, money, to } = useMarket();
  const { items, subtotal, vat, shipping, total, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <section>
        <h1 data-testid="page-title">{t('cart.title')}</h1>
        <div className="card empty-state">
          <span className="icon-tile icon-tile--lg" aria-hidden>
            <Icons.cart fontSize="inherit" />
          </span>
          <p data-testid="cart-empty">{t('cart.empty')}</p>
        </div>
        <Link to={to('shop')} className="btn">
          {t('cart.continue')}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 data-testid="page-title">{t('cart.title')}</h1>
      <div className="cart-layout">
        <ul className="card cart-list" data-testid="cart-items">
          {items.map((item) => (
            <li key={item.id} className="cart-item" data-testid="cart-item" data-product-id={item.id}>
              <span className="cart-item__name" data-testid="cart-item-name">
                {item.name}
              </span>
              <label className="inline-field">
                <span className="sr-only">{t('cart.qty')}</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={item.qty}
                  onChange={(e) => setQty(item.id, Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
                  className="qty"
                  aria-label={`${t('cart.qty')} ${item.name}`}
                  data-testid="cart-item-qty"
                />
              </label>
              <span className="num" data-testid="cart-item-total">
                {money(item.price * item.qty)}
              </span>
              <button type="button" className="btn btn--small btn--ghost" onClick={() => remove(item.id)} data-testid="cart-item-remove">
                {t('cart.remove')}
              </button>
            </li>
          ))}
        </ul>

        <aside className="card summary" data-testid="cart-summary">
          <dl>
            <dt>{t('cart.subtotal')}</dt>
            <dd data-testid="summary-subtotal" data-amount={subtotal}>
              {money(subtotal)}
            </dd>
            <dt className="muted small">{t('cart.vat', { rate: market.vatRate })}</dt>
            <dd className="muted small" data-testid="summary-vat" data-amount={vat}>
              {money(vat)}
            </dd>
            <dt>{t('cart.shipping')}</dt>
            <dd data-testid="summary-shipping" data-amount={shipping}>
              {shipping === 0 ? t('cart.free') : money(shipping)}
            </dd>
            <dt className="summary__total">{t('cart.total')}</dt>
            <dd className="summary__total" data-testid="summary-total" data-amount={total}>
              {money(total)}
            </dd>
          </dl>
          {shipping > 0 && (
            <p className="muted small" data-testid="free-shipping-hint">
              {t('cart.freeHint', { amount: money(market.freeShippingFrom) })}
            </p>
          )}
          <Link to={to('checkout')} className="btn btn--block" data-testid="checkout-button">
            {t('cart.checkout')}
          </Link>
        </aside>
      </div>
    </section>
  );
}
