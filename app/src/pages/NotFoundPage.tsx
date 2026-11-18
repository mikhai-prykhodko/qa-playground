import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export function NotFoundPage() {
  const { t, to } = useMarket();
  return (
    <section className="center" data-testid="not-found">
      <h1 data-testid="page-title">404 · {t('notFound.title')}</h1>
      <Link to={to()} className="btn">
        {t('notFound.back')}
      </Link>
    </section>
  );
}
