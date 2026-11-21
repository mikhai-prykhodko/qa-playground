import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { intlLocale, type Lang, type Market } from '../markets/markets';
import { translate, type TranslationKey } from '../i18n';

export interface MarketContextValue {
  market: Market;
  lang: Lang;
  locale: string;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  money: (amount: number) => string;
  date: (value: Date | string) => string;
  /** Builds a market/language aware path, e.g. to('forms') -> /ch/de/forms */
  to: (path?: string) => string;
}

const MarketContext = createContext<MarketContextValue | null>(null);

/** ?pseudo=1 turns pseudo-localization on for the session, ?pseudo=0 turns it off. */
function usePseudo(): boolean {
  const { search } = useLocation();
  const param = new URLSearchParams(search).get('pseudo');
  try {
    if (param === '1') sessionStorage.setItem('qa.pseudo', '1');
    if (param === '0') sessionStorage.removeItem('qa.pseudo');
    return sessionStorage.getItem('qa.pseudo') === '1';
  } catch {
    return param === '1';
  }
}

export function MarketProvider({ market, lang, children }: { market: Market; lang: Lang; children: ReactNode }) {
  const pseudo = usePseudo();
  const value = useMemo<MarketContextValue>(() => {
    const locale = intlLocale(market, lang);
    const moneyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: market.currency });
    const dateFmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    return {
      market,
      lang,
      locale,
      t: (key, vars) => translate(lang, key, vars, { locale, pseudo }),
      money: (amount) => moneyFmt.format(amount),
      date: (v) => dateFmt.format(typeof v === 'string' ? new Date(v) : v),
      to: (path = '') => `/${market.code}/${lang}${path ? `/${path.replace(/^\//, '')}` : ''}`,
    };
  }, [market, lang, pseudo]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used inside <MarketProvider>');
  return ctx;
}
