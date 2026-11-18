import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { MARKETS, isMarketCode, type Lang } from '../markets/markets';
import { MarketProvider } from '../context/MarketContext';
import { CartProvider } from '../context/CartContext';
import { Header } from './Header';
import { CookieBanner } from './CookieBanner';
import { NotFoundPage } from '../pages/NotFoundPage';

export function Layout() {
  const { market: marketParam, lang: langParam } = useParams();

  if (!isMarketCode(marketParam)) {
    return (
      <MarketProvider market={MARKETS.uk} lang="en">
        <NotFoundPage />
      </MarketProvider>
    );
  }

  const market = MARKETS[marketParam];
  if (!market.languages.includes(langParam as Lang)) {
    return <Navigate to={`/${market.code}/${market.defaultLang}`} replace />;
  }

  return (
    <MarketProvider market={market} lang={langParam as Lang}>
      <CartProvider key={market.code} market={market}>
        <Shell />
      </CartProvider>
    </MarketProvider>
  );
}

function Shell() {
  const { market, lang } = useParams();
  useEffect(() => {
    document.documentElement.lang = lang ?? 'en';
    document.documentElement.dataset.market = market;
  }, [market, lang]);

  return (
    <div className="app">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        QA Playground · market <strong data-testid="footer-market">{market?.toUpperCase()}</strong> · language{' '}
        <strong data-testid="footer-lang">{lang?.toUpperCase()}</strong>
      </footer>
      <CookieBanner />
    </div>
  );
}
