import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { averageRating, isSoldIn, priceIn, stockStatus, useProducts, type Category, type Product } from '../data/products';
import { trackEcommerce } from '../analytics';
import { FilterPanel, type ShopFilters } from '../components/FilterPanel';
import { ProductCard } from '../components/ProductCard';
import { Icons } from '../components/icons';

const CATEGORIES: Category[] = ['bags', 'drinkware', 'outdoor', 'food', 'apparel', 'home'];
const SORTS = ['relevance', 'price-asc', 'price-desc', 'name', 'rating'] as const;
type Sort = (typeof SORTS)[number];
type View = 'grid' | 'list';

/** Filters, sort and view live in the URL (?category=bags,outdoor&inStock=1&sort=price-asc&view=list). */
function readParams(params: URLSearchParams): { filters: ShopFilters; sort: Sort; view: View } {
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
  const sort = params.get('sort') as Sort;
  return {
    filters: {
      categories: (params.get('category')?.split(',') ?? []).filter((c): c is Category => CATEGORIES.includes(c as Category)),
      inStockOnly: params.get('inStock') === '1',
      min: num('min'),
      max: num('max'),
    },
    sort: SORTS.includes(sort) ? sort : 'relevance',
    view: params.get('view') === 'list' ? 'list' : 'grid',
  };
}

function writeParams(filters: ShopFilters, sort: Sort, view: View): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.categories.length) p.set('category', filters.categories.join(','));
  if (filters.inStockOnly) p.set('inStock', '1');
  if (filters.min !== undefined) p.set('min', String(filters.min));
  if (filters.max !== undefined) p.set('max', String(filters.max));
  if (sort !== 'relevance') p.set('sort', sort);
  if (view !== 'grid') p.set('view', view);
  return p;
}

export function ShopPage() {
  const { market, lang, locale, t } = useMarket();
  const { state, reload } = useProducts();
  const [params, setParams] = useSearchParams();
  const { filters, sort, view } = readParams(params);
  const q = params.get('q')?.trim() ?? '';
  const [lastAdded, setLastAdded] = useState<{ name: string; n: number } | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    const id = setTimeout(() => setLastAdded(null), 2500);
    return () => clearTimeout(id);
  }, [lastAdded]);

  const update = (next: Partial<{ filters: ShopFilters; sort: Sort; view: View }>) => {
    const p = writeParams(next.filters ?? filters, next.sort ?? sort, next.view ?? view);
    if (q) p.set('q', q);
    setParams(p, { replace: true });
  };
  const clearSearch = () => setParams(writeParams(filters, sort, view), { replace: true });

  const inMarket = useMemo(() => (state.status === 'ready' ? state.products.filter((p) => isSoldIn(p, market)) : []), [state, market]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(CATEGORIES.map((k) => [k, 0])) as Record<Category, number>;
    inMarket.forEach((p) => (c[p.category] += 1));
    return c;
  }, [inMarket]);

  const visible = useMemo(() => {
    const price = (p: Product) => priceIn(p, market).price;
    const rows = inMarket.filter(
      (p) =>
        (!q || p.name[lang].toLowerCase().includes(q.toLowerCase())) &&
        (filters.categories.length === 0 || filters.categories.includes(p.category)) &&
        (!filters.inStockOnly || stockStatus(p) !== 'out') &&
        (filters.min === undefined || price(p) >= filters.min) &&
        (filters.max === undefined || price(p) <= filters.max),
    );
    const sorted = [...rows];
    if (sort === 'price-asc') sorted.sort((a, b) => price(a) - price(b));
    if (sort === 'price-desc') sorted.sort((a, b) => price(b) - price(a));
    if (sort === 'name') sorted.sort((a, b) => a.name[lang].localeCompare(b.name[lang], locale));
    if (sort === 'rating') sorted.sort((a, b) => (averageRating(b) ?? 0) - (averageRating(a) ?? 0));
    return sorted;
  }, [inMarket, q, filters.categories, filters.inStockOnly, filters.min, filters.max, sort, market, lang, locale]);

  // view_item_list once per distinct result set
  const listKey = visible.map((p) => p.id).join(',');
  useEffect(() => {
    if (state.status !== 'ready') return;
    trackEcommerce(
      'view_item_list',
      market.currency,
      visible.map((p) => ({ item_id: p.id, item_name: p.name[lang], item_category: p.category, price: priceIn(p, market).price, quantity: 1 })),
      { item_list_name: 'shop' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey, state.status]);

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
          <button type="button" className="btn btn--small" onClick={reload} data-testid="products-retry">
            {t('shop.retry')}
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="shop-layout">
          <FilterPanel
            filters={filters}
            counts={counts}
            onChange={(f) => update({ filters: f })}
            onClear={() => setParams(writeParams({ categories: [], inStockOnly: false }, sort, view), { replace: true })}
          />

          <div className="shop-main">
            {q && (
              <p className="search-chip" role="status">
                {t('search.resultsFor', { q })}{' '}
                <button type="button" className="btn btn--small btn--ghost" onClick={clearSearch}>
                  {t('search.clear')}
                </button>
              </p>
            )}
            <div className="toolbar shop-toolbar" data-testid="shop-toolbar">
              <span className="muted" data-testid="result-count" data-count={visible.length} role="status">
                {t('shop.results', { count: visible.length })}
              </span>
              <label className="inline-field">
                <span>{t('shop.sort')}</span>
                <select value={sort} onChange={(e) => update({ sort: e.target.value as Sort })} data-testid="sort-select">
                  <option value="relevance">{t('shop.sort.relevance')}</option>
                  <option value="price-asc">{t('shop.sort.priceAsc')}</option>
                  <option value="price-desc">{t('shop.sort.priceDesc')}</option>
                  <option value="name">{t('shop.sort.name')}</option>
                  <option value="rating">{t('shop.sort.rating')}</option>
                </select>
              </label>
              <div className="view-toggle" role="group" aria-label={t('shop.view')} data-testid="view-toggle">
                <button
                  type="button"
                  className="icon-btn"
                  aria-pressed={view === 'grid'}
                  aria-label={t('shop.view.grid')}
                  onClick={() => update({ view: 'grid' })}
                  data-testid="view-grid"
                >
                  <Icons.gridView fontSize="small" />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-pressed={view === 'list'}
                  aria-label={t('shop.view.list')}
                  onClick={() => update({ view: 'list' })}
                  data-testid="view-list"
                >
                  <Icons.listView fontSize="small" />
                </button>
              </div>
            </div>

            {visible.length === 0 ? (
              <p className="card empty-state" data-testid="products-empty">
                {inMarket.length === 0 ? t('shop.empty') : t('shop.noResults')}
              </p>
            ) : (
              <div className={`grid product-grid product-grid--${view}`} data-testid="product-grid" data-view={view}>
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} list="shop" onAdded={(name) => setLastAdded((prev) => ({ name, n: (prev?.n ?? 0) + 1 }))} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {lastAdded && (
        <div className="toast" role="status" data-testid="added-toast" key={lastAdded.n}>
          <Icons.success fontSize="small" /> {t('shop.added')}: {lastAdded.name}
        </div>
      )}
    </section>
  );
}
