import { useMarket } from '../context/MarketContext';
import { Icons } from './icons';

/** Star rating. Readable by tests via data-rating and by screen readers via aria-label. */
export function Rating({ value, count }: { value: number | null; count?: number }) {
  const { t } = useMarket();
  if (value === null) return null;
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (value >= n) return <Icons.star key={n} fontSize="inherit" />;
    if (value >= n - 0.5) return <Icons.starHalf key={n} fontSize="inherit" />;
    return <Icons.starEmpty key={n} fontSize="inherit" />;
  });
  return (
    <span className="rating" data-testid="rating" data-rating={value}>
      <span className="rating__stars" role="img" aria-label={t('product.rating', { rating: value })}>
        {stars}
      </span>
      {count !== undefined && (
        <span className="rating__count muted small" data-testid="rating-count">
          ({count})
        </span>
      )}
    </span>
  );
}
