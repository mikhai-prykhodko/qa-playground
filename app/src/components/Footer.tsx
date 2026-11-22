import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import type { TranslationKey } from '../i18n';

export const INFO_PAGES = {
  help: ['shipping', 'returns'],
  company: ['about', 'careers'],
  legal: ['privacy', 'terms', 'imprint'],
} as const;

/** Real pages (not /info/…) listed in a footer column, with the dictionary key of their title. */
const PAGE_LINKS: Partial<Record<keyof typeof INFO_PAGES, { path: string; key: TranslationKey }[]>> = {
  help: [
    { path: 'help', key: 'page.help' },
    { path: 'contact', key: 'info.contact' },
  ],
  company: [{ path: 'campaign', key: 'page.campaign' }],
};

export type InfoSlug = (typeof INFO_PAGES)[keyof typeof INFO_PAGES][number];

/**
 * Site footer: a <footer> (contentinfo landmark) with link columns, each a <nav> named
 * by its heading. No data-testid here on purpose — locate by role, name, text and title.
 */
export function Footer() {
  const { market, lang, t, to } = useMarket();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {(Object.keys(INFO_PAGES) as (keyof typeof INFO_PAGES)[]).map((column) => (
          <nav key={column} aria-labelledby={`footer-${column}`} className="site-footer__col">
            <h2 id={`footer-${column}`} className="site-footer__heading">
              {t(`footer.${column}` as TranslationKey)}
            </h2>
            <ul>
              {INFO_PAGES[column].map((slug) => (
                <li key={slug}>
                  <Link to={to(`info/${slug}`)}>{t(`info.${slug}` as TranslationKey)}</Link>
                </li>
              ))}
              {PAGE_LINKS[column]?.map((link) => (
                <li key={link.path}>
                  <Link to={to(link.path)}>{t(link.key)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="site-footer__col">
          <h2 className="site-footer__heading">{t('footer.payments')}</h2>
          <ul className="payment-badges">
            {market.payments.map((p) => (
              <li key={p}>
                <span className="payment-badge" title={t('footer.accepted', { method: t(`payment.${p}` as TranslationKey) })}>
                  {t(`payment.${p}` as TranslationKey)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>
          © 2026 <span translate="no">QA Playground</span> · {t('footer.copyright')}
        </span>
        <span>
          {t('footer.market')}{' '}
          <strong data-testid="footer-market" translate="no">
            {market.code.toUpperCase()}
          </strong>{' '}
          · {t('footer.language')}{' '}
          <strong data-testid="footer-lang" translate="no">
            {lang.toUpperCase()}
          </strong>
        </span>
        <a href="#top" title={t('footer.backToTop')} className="back-to-top">
          ↑
        </a>
      </div>
    </footer>
  );
}
