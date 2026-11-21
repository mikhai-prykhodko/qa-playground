import type { ReactNode } from 'react';
import { useMarket } from '../context/MarketContext';
import type { TranslationKey } from '../i18n';
import type { Category } from '../data/products';
import { Icons } from './icons';

export interface ShopFilters {
  categories: Category[];
  inStockOnly: boolean;
  min?: number;
  max?: number;
}

/** A collapsible group of filter options (<details>/<summary>: open and closed states to handle). */
function FacetGroup({ facet, title, children }: { facet: string; title: string; children: ReactNode }) {
  return (
    <details className="facet" open data-testid="facet-group" data-facet={facet}>
      <summary className="facet__title">{title}</summary>
      <div className="facet__body">{children}</div>
    </details>
  );
}

export function FilterPanel({
  filters,
  counts,
  onChange,
  onClear,
}: {
  filters: ShopFilters;
  counts: Record<Category, number>;
  onChange: (next: ShopFilters) => void;
  onClear: () => void;
}) {
  const { t, market } = useMarket();
  const toggleCategory = (c: Category) =>
    onChange({
      ...filters,
      categories: filters.categories.includes(c) ? filters.categories.filter((x) => x !== c) : [...filters.categories, c],
    });
  const num = (v: string) => (v === '' ? undefined : Math.max(0, Number(v)));

  return (
    <aside className="filters card" aria-label={t('shop.filters')} data-testid="filter-panel">
      <h2 className="filters__title">
        <Icons.filter fontSize="small" /> {t('shop.filters')}
      </h2>

      <FacetGroup facet="category" title={t('shop.category')}>
        {(Object.keys(counts) as Category[]).map((c) => (
          <label key={c} className="check facet__option" data-testid="facet-option" data-value={c}>
            <input type="checkbox" checked={filters.categories.includes(c)} disabled={counts[c] === 0} onChange={() => toggleCategory(c)} />
            <span>{t(`category.${c}` as TranslationKey)}</span>
            <span className="muted small" data-testid="facet-count">
              ({counts[c]})
            </span>
          </label>
        ))}
      </FacetGroup>

      <FacetGroup facet="availability" title={t('shop.availability')}>
        <label className="check facet__option" data-testid="facet-option" data-value="in-stock">
          <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })} />
          <span>{t('shop.inStockOnly')}</span>
        </label>
      </FacetGroup>

      <FacetGroup facet="price" title={`${t('shop.price')} (${market.currency})`}>
        <div className="row row--fields">
          <label className="field">
            <span>{t('shop.priceMin')}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={filters.min ?? ''}
              onChange={(e) => onChange({ ...filters, min: num(e.target.value) })}
              data-testid="price-min"
            />
          </label>
          <label className="field">
            <span>{t('shop.priceMax')}</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={filters.max ?? ''}
              onChange={(e) => onChange({ ...filters, max: num(e.target.value) })}
              data-testid="price-max"
            />
          </label>
        </div>
      </FacetGroup>

      <button type="button" className="btn btn--ghost btn--block" onClick={onClear} data-testid="clear-filters">
        {t('shop.clearFilters')}
      </button>
    </aside>
  );
}
