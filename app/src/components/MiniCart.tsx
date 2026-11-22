import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';
import { CartLine } from './CartLine';
import { Icons } from './icons';

/**
 * Header mini-cart: a toggle button + dropdown panel (closes on outside click,
 * Escape or navigation). Its lines are the same CartLine component as on the cart page.
 */
export function MiniCart() {
  const { t, money, to } = useMarket();
  const { items, count, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="mini-cart" ref={ref} data-testid="mini-cart-widget">
      <button
        type="button"
        className="cart-link"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        data-testid="mini-cart-toggle"
      >
        {/* WCAG 2.5.3 Label in Name: no aria-label overriding the visible text — the name is
            "Warenkorb 0 Artikel", so voice users can say what they see ("click Warenkorb") */}
        <Icons.cart fontSize="small" /> {t('nav.cart')}{' '}
        <span className="badge" data-testid="cart-count">
          {count}
        </span>
        <span className="sr-only"> {t('minicart.items')}</span>
      </button>

      {open && (
        <div id={panelId} className="mini-cart__panel card" role="dialog" aria-label={t('minicart.title')} data-testid="mini-cart">
          <div className="mini-cart__header">
            <strong>{t('minicart.title')}</strong>
            <button type="button" className="icon-btn" aria-label={t('dialogs.close')} onClick={() => setOpen(false)} data-testid="mini-cart-close">
              <Icons.close fontSize="small" />
            </button>
          </div>

          {items.length === 0 ? (
            <p className="muted" data-testid="mini-cart-empty">
              {t('cart.empty')}
            </p>
          ) : (
            <>
              <ul className="mini-cart__lines" data-testid="cart-lines">
                {items.map((item) => (
                  <CartLine key={item.lineId} item={item} compact />
                ))}
              </ul>
              <div className="mini-cart__footer">
                <span>{t('cart.subtotal')}</span>
                <strong data-testid="mini-cart-subtotal" data-amount={subtotal}>
                  {money(subtotal)}
                </strong>
              </div>
            </>
          )}

          <Link to={to('cart')} className="btn btn--block" data-testid="mini-cart-view-cart">
            {t('minicart.viewCart')}
          </Link>
        </div>
      )}
    </div>
  );
}
