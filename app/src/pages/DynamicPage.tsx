import { useEffect, useMemo, useState } from 'react';
import { useMarket } from '../context/MarketContext';

const randomId = () => Math.random().toString(36).slice(2, 10);

export function DynamicPage() {
  const { t, money } = useMarket();

  // 1. Delayed loading with random duration (1–3 s) — tests must not use fixed sleeps.
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const startLoading = () => {
    setLoadState('loading');
    setTimeout(() => setLoadState('done'), 1000 + Math.random() * 2000);
  };

  // 2. Element that is not in the DOM until 2 s after page load.
  const [appeared, setAppeared] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAppeared(true), 2000);
    return () => clearTimeout(id);
  }, []);

  // 3. Button disabled until a countdown finishes.
  const [countdown, setCountdown] = useState(3);
  const [enabledClicked, setEnabledClicked] = useState(false);
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // 4. Random id + class on every render of the page.
  const ids = useMemo(() => ({ id: `btn-${randomId()}`, cls: `css-${randomId()}` }), []);
  const [randomClicks, setRandomClicks] = useState(0);

  // 5. Toast that disappears after 3 s.
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // 6. Element re-mounted every second (keyed) — stale element references break.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const price = 100 + Math.sin(tick) * 5;

  return (
    <section>
      <h1 data-testid="page-title">{t('dynamic.title')}</h1>
      <div className="grid">
        <article className="card" data-testid="delayed-loading">
          <h2>{t('dynamic.load.title')}</h2>
          <button className="btn" type="button" onClick={startLoading} disabled={loadState === 'loading'} data-testid="start-loading">
            {t('dynamic.load.start')}
          </button>
          {loadState === 'loading' && (
            <div className="spinner-row" role="progressbar" aria-label={t('dynamic.load.loading')} data-testid="spinner">
              <span className="spinner" /> {t('dynamic.load.loading')}
            </div>
          )}
          {loadState === 'done' && (
            <p className="alert alert--success" data-testid="loaded-text">
              {t('dynamic.load.done')}
            </p>
          )}
        </article>

        <article className="card">
          <h2>{t('dynamic.appear.title')}</h2>
          {appeared && (
            <p className="alert alert--info" data-testid="appeared-text">
              {t('dynamic.appear.text')}
            </p>
          )}
        </article>

        <article className="card">
          <h2>{t('dynamic.enable.title')}</h2>
          <button
            className="btn"
            type="button"
            disabled={countdown > 0}
            onClick={() => setEnabledClicked(true)}
            data-testid="countdown-button"
          >
            {countdown > 0 ? t('dynamic.enable.wait', { seconds: countdown }) : t('dynamic.enable.ready')}
          </button>
          {enabledClicked && <p data-testid="countdown-result">{t('dynamic.enable.clicked')}</p>}
        </article>

        <article className="card">
          <h2>{t('dynamic.random.title')}</h2>
          {/* id and class change on every visit; no data-testid on purpose. */}
          <button id={ids.id} className={`btn ${ids.cls}`} type="button" onClick={() => setRandomClicks((c) => c + 1)}>
            {t('dynamic.random.button')}
          </button>
          <p aria-live="polite">{t('dynamic.random.clicked', { count: randomClicks })}</p>
        </article>

        <article className="card">
          <h2>{t('dynamic.toast.title')}</h2>
          <button className="btn" type="button" onClick={() => setToast(true)} data-testid="show-toast">
            {t('dynamic.toast.show')}
          </button>
        </article>

        <article className="card">
          <h2>{t('dynamic.ticker.title')}</h2>
          <p key={tick} data-testid="ticker" data-tick={tick}>
            {t('dynamic.ticker.label')}: <strong>{money(price)}</strong>
          </p>
        </article>
      </div>

      {toast && (
        <div className="toast" role="status" data-testid="toast">
          {t('dynamic.toast.text')}
        </div>
      )}
    </section>
  );
}
