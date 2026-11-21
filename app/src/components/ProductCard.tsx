import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';
import { averageRating, priceIn, stockStatus, type Product } from '../data/products';
import { trackEcommerce } from '../analytics';
import { Icons, productIcon } from './icons';
import { Rating } from './Rating';

/**
 * Product card, reused in the shop grid and in "You may also like" on product pages.
 * Same test ids in both places, so tests have to scope by container.
 */
export function ProductCard({ product, list, onAdded }: { product: Product; list: string; onAdded?: (name: string) => void }) {
  const { market, lang, t, money, to } = useMarket();
  const { add } = useCart();
  const { price, regular, discount } = priceIn(product, market);
  const stock = stockStatus(product);
  const name = product.name[lang];
  const Icon = productIcon(product.icon);
  const hasOptions = !!(product.variants?.sizes?.length || product.variants?.colors?.length);
  const href = to(`shop/${product.id}`);

  const select = () =>
    trackEcommerce('select_item', market.currency, [{ item_id: product.id, item_name: name, item_category: product.category, price, quantity: 1 }], {
      item_list_name: list,
    });

  return (
    <article className="card product" data-testid="product-card" data-product-id={product.id} data-stock={stock}>
      <Link to={href} className="product__media" onClick={select} tabIndex={-1} aria-hidden>
        <Icon fontSize="inherit" />
      </Link>

      <div className="product__badges" data-testid="product-badges">
        {product.isNew && (
          <span className="badge-chip badge-chip--new" data-testid="product-badge" data-badge="new">
            {t('badge.new')}
          </span>
        )}
        {discount > 0 && (
          <span className="badge-chip badge-chip--sale" data-testid="product-badge" data-badge="sale">
            {t('badge.sale', { percent: discount })}
          </span>
        )}
      </div>

      <h2 className="product__name">
        <Link to={href} onClick={select} data-testid="product-link">
          <span data-testid="product-name">{name}</span>
        </Link>
      </h2>

      <Rating value={averageRating(product)} count={product.reviews.length} />

      <p className="product__price">
        <span data-testid="product-price" data-amount={price} data-currency={market.currency}>
          {money(price)}
        </span>
        {discount > 0 && (
          <s className="product__regular muted" data-testid="product-regular-price" data-amount={regular}>
            {money(regular)}
          </s>
        )}
      </p>

      <p className={`stock stock--${stock}`} data-testid="product-stock">
        {stock === 'out' ? t('product.outOfStock') : stock === 'low' ? t('product.lowStock', { count: product.stock }) : t('product.inStock')}
      </p>

      {hasOptions && stock !== 'out' ? (
        <Link to={href} onClick={select} className="btn btn--ghost" data-testid="choose-options">
          {t('shop.chooseOptions')}
        </Link>
      ) : (
        <button
          type="button"
          className="btn"
          disabled={stock === 'out'}
          onClick={() => {
            add({ productId: product.id, name, category: product.category, price });
            onAdded?.(name);
          }}
          data-testid="add-to-cart"
        >
          {stock === 'out' ? (
            t('shop.outOfStock')
          ) : (
            <>
              <Icons.cart fontSize="small" /> {t('shop.add')}
            </>
          )}
        </button>
      )}
    </article>
  );
}
