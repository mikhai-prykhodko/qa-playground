import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';
import { fetchProducts, type Product } from '../data/products';
import { Icons, productIcon } from '../components/icons';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; products: Product[] };

export function ShopPage() {
  const { market, lang, t, money } = useMarket();
  const { add } = useCart();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [lastAdded, setLastAdded] = useState<{ name: string; n: number } | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    const id = setTimeout(() => setLastAdded(null), 2500);
    return () => clearTimeout(id);
  }, [lastAdded]);

  const load = useCallback(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetchProducts(ctrl.signal)
      .then((products) => setState({ status: 'ready', products }))
      .catch((e: Error) => e.name !== 'AbortError' && setState({ status: 'error' }));
    return () => ctrl.abort();
  }, []);

  useEffect(() => load(), [load]);

  return (
    <section>
      <h1 data-testid="page-title">{t('shop.title')}</h1>

      {state.status === 'loading' && (
        <div className="grid" aria-busy="true" data-testid="products-loading">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card skeleton" />
          ))}
          <span className="sr-only">{t('shop.loading')}</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="alert alert--error" role="alert" data-testid="products-error">
          {t('shop.error')}{' '}
          <button type="button" className="btn btn--small" onClick={load} data-testid="products-retry">
            {t('shop.retry')}
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <ProductGrid
          products={state.products.filter((p) => p.markets.includes(market.code) && p.price[market.code] !== undefined)}
          render={(p) => {
            const price = p.price[market.code]!;
            const name = p.name[lang];
            const out = p.stock <= 0;
            const ProductIcon = productIcon(p.icon);
            return (
              <article key={p.id} className="card product" data-testid="product-card" data-product-id={p.id}>
                <div className="product__media" aria-hidden>
                  <ProductIcon fontSize="inherit" />
                </div>
                <h2 className="product__name" data-testid="product-name">
                  {name}
                </h2>
                <p className="product__price" data-testid="product-price" data-amount={price} data-currency={market.currency}>
                  {money(price)}
                </p>
                <button
                  type="button"
                  className="btn"
                  disabled={out}
                  onClick={() => {
                    add({ id: p.id, name, price });
                    setLastAdded((prev) => ({ name, n: (prev?.n ?? 0) + 1 }));
                  }}
                  data-testid="add-to-cart"
                >
                  {out ? (
                    t('shop.outOfStock')
                  ) : (
                    <>
                      <Icons.cart fontSize="small" /> {t('shop.add')}
                    </>
                  )}
                </button>
              </article>
            );
          }}
          empty={t('shop.empty')}
        />
      )}

      {lastAdded && (
        <div className="toast" role="status" data-testid="added-toast" key={lastAdded.n}>
          <Icons.success fontSize="small" /> {t('shop.added')}: {lastAdded.name}
        </div>
      )}
    </section>
  );
}

function ProductGrid({ products, render, empty }: { products: Product[]; render: (p: Product) => ReactNode; empty: string }) {
  if (products.length === 0) return <p data-testid="products-empty">{empty}</p>;
  return (
    <div className="grid" data-testid="product-grid">
      {products.map(render)}
    </div>
  );
}
