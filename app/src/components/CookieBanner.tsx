import { useState } from 'react';
import { useMarket } from '../context/MarketContext';

export const COOKIE_STORAGE_KEY = 'qa.cookieConsent';

/**
 * Shown on first visit and overlays the page bottom — a classic thing
 * tests must handle (dismiss via UI, or pre-seed localStorage in a fixture).
 * The text is market-specific (revDSG in CH, DSGVO in DE/AT, UK GDPR in UK).
 */
export function CookieBanner() {
  const { market, t } = useMarket();
  const [consent, setConsent] = useState<string | null>(() => localStorage.getItem(COOKIE_STORAGE_KEY));

  if (consent) return null;

  const decide = (value: 'all' | 'necessary') => {
    localStorage.setItem(COOKIE_STORAGE_KEY, value);
    setConsent(value);
  };

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent" data-testid="cookie-banner">
      <p>{t('cookie.text', { law: market.privacyLaw })}</p>
      <div className="row">
        <button type="button" className="btn btn--ghost" data-testid="cookie-reject" onClick={() => decide('necessary')}>
          {t('cookie.reject')}
        </button>
        <button type="button" className="btn" data-testid="cookie-accept" onClick={() => decide('all')}>
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  );
}
