import { useMarket } from '../context/MarketContext';

export function NewTabPage() {
  const { t } = useMarket();
  return (
    <section className="center">
      <h1 data-testid="page-title">{t('newTab.title')}</h1>
      <p data-testid="new-tab-text">{t('newTab.text')}</p>
    </section>
  );
}
