import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { MARKETS, MARKET_CODES, type Lang, type MarketCode } from '../markets/markets';
import type { TranslationKey } from '../i18n';
import { Icons } from './icons';
import { MiniCart } from './MiniCart';
import { SearchBox } from './SearchBox';

const NAV: { path: string; key: TranslationKey }[] = [
  { path: '', key: 'nav.home' },
  { path: 'forms', key: 'nav.forms' },
  { path: 'dynamic', key: 'nav.dynamic' },
  { path: 'tables', key: 'nav.tables' },
  { path: 'frames', key: 'nav.frames' },
  { path: 'dialogs', key: 'nav.dialogs' },
  { path: 'shop', key: 'nav.shop' },
  { path: 'legacy', key: 'nav.legacy' },
  { path: 'a11y', key: 'nav.a11y' },
];

export function Header() {
  const { market, lang, t, to } = useMarket();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the current page when switching market/language: /ch/de/forms -> /de/de/forms
  const restOfPath = location.pathname.split('/').slice(3).join('/');

  const switchMarket = (code: MarketCode) => {
    const next = MARKETS[code];
    navigate(`/${code}/${next.defaultLang}${restOfPath ? `/${restOfPath}` : ''}`);
  };
  const switchLang = (l: Lang) => navigate(`/${market.code}/${l}${restOfPath ? `/${restOfPath}` : ''}`);

  return (
    <header className="header" data-testid="header">
      <div className="header__top">
        <NavLink to={to()} className="brand" data-testid="brand">
          <span className="brand__logo" aria-hidden>
            <Icons.brand fontSize="inherit" />
          </span>
          <span translate="no">QA Playground</span>
        </NavLink>

        <SearchBox />

        <div className="header__controls">
          <label className="inline-field">
            <span>{t('header.market')}</span>
            <select
              data-testid="market-select"
              value={market.code}
              onChange={(e) => switchMarket(e.target.value as MarketCode)}
            >
              {MARKET_CODES.map((code) => (
                <option key={code} value={code}>
                  {MARKETS[code].flag} {t(`market.${code}` as TranslationKey)}
                </option>
              ))}
            </select>
          </label>

          {market.languages.length > 1 && (
            <div className="lang-switch" role="group" aria-label={t('header.language')} data-testid="lang-switch">
              {market.languages.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={l === lang ? 'chip chip--active' : 'chip'}
                  aria-pressed={l === lang}
                  data-testid={`lang-${l}`}
                  translate="no"
                  onClick={() => switchLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <MiniCart />

          {user ? (
            <div className="user-box">
              <span data-testid="logged-in-user">{t('header.loggedInAs', { user: user.displayName })}</span>
              <button type="button" className="btn btn--ghost" data-testid="logout" onClick={logout}>
                <Icons.logout fontSize="small" /> {t('nav.logout')}
              </button>
            </div>
          ) : (
            <NavLink to={to('login')} className="btn btn--ghost" data-testid="login-link">
              <Icons.login fontSize="small" /> {t('nav.login')}
            </NavLink>
          )}
        </div>
      </div>

      <nav className="nav" aria-label={t('nav.main')}>
        {NAV.map((item) => (
          <NavLink
            key={item.key}
            to={to(item.path)}
            end={item.path === ''}
            className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}
            data-testid={`nav-${item.path || 'home'}`}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
