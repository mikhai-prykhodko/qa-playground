import { useEffect, useRef, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Icons } from '../components/icons';

export function DialogsPage() {
  const { t, to } = useMarket();
  const [result, setResult] = useState('—');
  const [modalOpen, setModalOpen] = useState(false);
  const [menuItem, setMenuItem] = useState('');
  const [tooltip, setTooltip] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const newTabUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${to('new-tab')}`;

  useEffect(() => {
    if (!modalOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setModalOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  return (
    <section>
      <h1 data-testid="page-title">{t('dialogs.title')}</h1>
      <div className="grid grid--2">
        <article className="card">
          <h2>{t('dialogs.native')}</h2>
          <div className="row">
            <button
              className="btn"
              type="button"
              data-testid="alert-button"
              onClick={() => {
                window.alert(t('dialogs.alertMessage'));
                setResult('alert');
              }}
            >
              {t('dialogs.alert')}
            </button>
            <button
              className="btn"
              type="button"
              data-testid="confirm-button"
              onClick={() => setResult(window.confirm(t('dialogs.confirmMessage')) ? t('dialogs.confirmed') : t('dialogs.cancelled'))}
            >
              {t('dialogs.confirm')}
            </button>
            <button
              className="btn"
              type="button"
              data-testid="prompt-button"
              onClick={() => {
                const value = window.prompt(t('dialogs.promptMessage'));
                setResult(value === null ? t('dialogs.cancelled') : value);
              }}
            >
              {t('dialogs.prompt')}
            </button>
          </div>
          <p data-testid="dialog-result">{t('dialogs.result', { result })}</p>
        </article>

        <article className="card">
          <h2>{t('dialogs.windows')}</h2>
          <div className="row">
            <a className="btn" href={newTabUrl} target="_blank" rel="noopener" data-testid="new-tab-link">
              {t('dialogs.newTab')} <Icons.openInNew fontSize="small" />
            </a>
            <button
              className="btn btn--ghost"
              type="button"
              data-testid="popup-button"
              onClick={() => window.open(newTabUrl, 'qa-popup', 'width=600,height=400')}
            >
              {t('dialogs.popup')}
            </button>
          </div>
        </article>

        <article className="card">
          <h2>{t('dialogs.modal')}</h2>
          <button className="btn" type="button" onClick={() => setModalOpen(true)} data-testid="open-modal">
            {t('dialogs.openModal')}
          </button>
        </article>

        <article className="card">
          <h2>{t('dialogs.hover')}</h2>
          <div className="row">
            <span
              className="tooltip-host"
              tabIndex={0}
              onMouseEnter={() => setTooltip(true)}
              onMouseLeave={() => setTooltip(false)}
              onFocus={() => setTooltip(true)}
              onBlur={() => setTooltip(false)}
              aria-describedby={tooltip ? 'qa-tooltip' : undefined}
              data-testid="tooltip-host"
            >
              {t('dialogs.hoverMe')}
              {tooltip && (
                <span role="tooltip" id="qa-tooltip" className="tooltip" data-testid="tooltip">
                  {t('dialogs.tooltip')}
                </span>
              )}
            </span>

            {/* CSS-only hover menu: items are hidden until the parent is hovered. */}
            <div className="hover-menu" data-testid="hover-menu">
              <button type="button" className="btn btn--ghost">
                {t('dialogs.menu')} <Icons.expand fontSize="small" />
              </button>
              <ul className="hover-menu__list" role="menu">
                {(['profile', 'settings'] as const).map((item) => (
                  <li key={item} role="none">
                    <button type="button" role="menuitem" onClick={() => setMenuItem(t(`dialogs.menu.${item}`))}>
                      {t(`dialogs.menu.${item}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {menuItem && <p data-testid="menu-result">{t('dialogs.menuClicked', { item: menuItem })}</p>}
        </article>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" data-testid="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            data-testid="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title">{t('dialogs.modalTitle')}</h2>
            <p>{t('dialogs.modalText')}</p>
            <button ref={closeRef} type="button" className="btn" onClick={() => setModalOpen(false)} data-testid="close-modal">
              {t('dialogs.close')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
