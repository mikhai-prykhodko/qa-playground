import { Link, useParams } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import type { TranslationKey } from '../i18n';
import { INFO_PAGES, type InfoSlug } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

const ALL_SLUGS = Object.values(INFO_PAGES).flat() as InfoSlug[];

/** Static content pages linked from the footer (/info/shipping, /info/privacy …). */
export function InfoPage() {
  const { slug } = useParams();
  const { market, t, to } = useMarket();
  if (!ALL_SLUGS.includes(slug as InfoSlug)) return <NotFoundPage />;
  const title = t(`info.${slug}` as TranslationKey);

  return (
    <article className="narrow info-page">
      <nav aria-label={t('product.breadcrumb')} className="breadcrumb">
        <ol>
          <li>
            <Link to={to()}>{t('nav.home')}</Link>
          </li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <h1 data-testid="page-title">{title}</h1>
      <p>{t('info.body', { title, market: market.name })}</p>
    </article>
  );
}
