import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useCart, type CartItem } from '../context/CartContext';
import type { TranslationKey } from '../i18n';
import { Icons } from './icons';
import { QuantityStepper } from './QuantityStepper';

/**
 * One cart line, used in the header mini-cart AND on the cart page — the same
 * component in two containers, with the same test ids.
 */
export function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { t, money, to } = useMarket();
  const { setQty, remove } = useCart();
  const variant = [
    item.variant?.size,
    item.variant?.color ? t(`color.${item.variant.color}` as TranslationKey) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li
      className={compact ? 'cart-line cart-line--compact' : 'cart-line'}
      data-testid="cart-line"
      data-line-id={item.lineId}
      data-product-id={item.productId}
    >
      <div className="cart-line__info">
        <Link to={to(`shop/${item.productId}`)} className="cart-line__name" data-testid="line-name">
          {item.name}
        </Link>
        {variant && (
          <span className="muted small" data-testid="line-variant">
            {variant}
          </span>
        )}
        <span className="muted small" data-testid="line-unit-price" data-amount={item.price}>
          {money(item.price)}
        </span>
      </div>
      <QuantityStepper value={item.qty} min={1} onChange={(qty) => setQty(item.lineId, qty)} label={`${t('cart.qty')} ${item.name}`} />
      <span className="num cart-line__total" data-testid="line-total" data-amount={Math.round(item.price * item.qty * 100) / 100}>
        {money(item.price * item.qty)}
      </span>
      <button
        type="button"
        className="btn btn--small btn--ghost"
        onClick={() => remove(item.lineId)}
        aria-label={`${t('cart.remove')} ${item.name}`}
        data-testid="line-remove"
      >
        <Icons.delete fontSize="inherit" />
        {!compact && ` ${t('cart.remove')}`}
      </button>
    </li>
  );
}
