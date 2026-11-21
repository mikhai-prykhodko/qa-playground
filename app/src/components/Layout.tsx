import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { trackPageView } from '../analytics';
import { MARKETS, isMarketCode, type Lang } from '../markets/markets';
import { MarketProvider } from '../context/MarketContext';
import { CartProvider } from '../context/CartContext';
import { Header } from './Header';
import { Footer } from './Footer';
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
  const location = useLocation();
  useEffect(() => {
    document.documentElement.lang = lang ?? 'en';
    document.documentElement.dataset.market = market;
  }, [market, lang]);
  useEffect(() => {
    trackPageView(market ?? '', lang ?? '', location.pathname);
  }, [market, lang, location.pathname]);

  return (
    <div className="app" id="top">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
