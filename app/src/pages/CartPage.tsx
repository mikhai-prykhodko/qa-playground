import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { cartItemToAnalytics, useCart } from '../context/CartContext';
import { trackEcommerce } from '../analytics';
import { CartLine } from '../components/CartLine';
import { Icons } from '../components/icons';

export function CartPage() {
  const { market, t, money, to } = useMarket();
  const { items, subtotal, vat, shipping, rounding, total } = useCart();

  useEffect(() => {
    if (items.length) trackEcommerce('view_cart', market.currency, items.map((i) => cartItemToAnalytics(i, i.qty)));
    // only when the page is opened, not on every quantity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <ul className="card cart-list" data-testid="cart-lines">
          {items.map((item) => (
            <CartLine key={item.lineId} item={item} />
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
            {rounding !== 0 && (
              <>
                <dt className="muted small">{t('cart.rounding')}</dt>
                <dd className="muted small" data-testid="summary-rounding" data-amount={rounding}>
                  {money(rounding)}
                </dd>
              </>
            )}
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
