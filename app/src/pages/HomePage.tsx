import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import type { SvgIconComponent } from '@mui/icons-material';
import type { TranslationKey } from '../i18n';
import { Icons } from '../components/icons';

const CARDS: { path: string; icon: SvgIconComponent; title: TranslationKey; desc: TranslationKey }[] = [
  { path: 'forms', icon: Icons.forms, title: 'nav.forms', desc: 'home.desc.forms' },
  { path: 'dynamic', icon: Icons.dynamic, title: 'nav.dynamic', desc: 'home.desc.dynamic' },
  { path: 'tables', icon: Icons.tables, title: 'nav.tables', desc: 'home.desc.tables' },
  { path: 'frames', icon: Icons.frames, title: 'nav.frames', desc: 'home.desc.frames' },
  { path: 'dialogs', icon: Icons.dialogs, title: 'nav.dialogs', desc: 'home.desc.dialogs' },
  { path: 'shop', icon: Icons.shop, title: 'nav.shop', desc: 'home.desc.shop' },
];

export function HomePage() {
  const { market, t, to } = useMarket();
  return (
    <section>
      <h1 data-testid="page-title">{t('home.title')}</h1>
      <p className="lead">{t('home.subtitle')}</p>
      <p className="muted" data-testid="market-info">
        {market.flag} {t('home.market', { market: market.name, currency: market.currency, vat: market.vatRate })}
      </p>

      <div className="grid">
        {CARDS.map((card) => (
          <Link key={card.path} to={to(card.path)} className="card card--link" data-testid={`card-${card.path}`}>
            <span className="icon-tile" aria-hidden>
              <card.icon fontSize="inherit" />
            </span>
            <h2>{t(card.title)}</h2>
            <p>{t(card.desc)}</p>
            <span className="card__cta">{t('home.open')} <Icons.arrowForward fontSize="inherit" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
