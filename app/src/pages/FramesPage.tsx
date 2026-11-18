import { createElement } from 'react';
import { useMarket } from '../context/MarketContext';
import { registerShadowElements } from '../components/shadowElements';

registerShadowElements();

const base = import.meta.env.BASE_URL;

export function FramesPage() {
  const { t } = useMarket();
  return (
    <section>
      <h1 data-testid="page-title">{t('frames.title')}</h1>
      <div className="grid grid--2">
        <article className="card">
          <h2>{t('frames.iframe')}</h2>
          <iframe className="frame" title="Simple frame" src={`${base}frames/simple.html`} data-testid="simple-frame" />
        </article>

        <article className="card">
          <h2>{t('frames.nested')}</h2>
          <iframe className="frame frame--tall" title="Outer frame" src={`${base}frames/outer.html`} data-testid="outer-frame" />
        </article>

        <article className="card">
          <h2>{t('frames.shadow')}</h2>
          <div className="stack">
            {createElement('qa-counter', { 'data-testid': 'shadow-counter' })}
            {createElement('qa-user-card', { name: 'Anna Müller', 'role-label': 'admin', 'data-testid': 'shadow-user-card' })}
          </div>
        </article>
      </div>
    </section>
  );
}
