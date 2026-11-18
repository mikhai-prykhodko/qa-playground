/**
 * Native Web Components with Shadow DOM.
 * - <qa-counter>: open shadow root with a button and a counter.
 * - <qa-user-card>: open shadow root that contains another shadow host (<qa-badge>) — nested shadow DOM.
 */
class QaCounter extends HTMLElement {
  private count = 0;

  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: inline-flex; gap: 8px; align-items: center; }
        button { font: inherit; padding: 6px 12px; border-radius: 6px; border: 1px solid #6366f1; background: #eef2ff; cursor: pointer; }
        span { min-width: 2ch; font-weight: 600; }
      </style>
      <button type="button" data-testid="shadow-decrement" aria-label="Decrement">−</button>
      <span data-testid="shadow-count">0</span>
      <button type="button" data-testid="shadow-increment" aria-label="Increment">+</button>
    `;
    const out = root.querySelector('span')!;
    const [dec, inc] = Array.from(root.querySelectorAll('button'));
    dec.addEventListener('click', () => (out.textContent = String(--this.count)));
    inc.addEventListener('click', () => (out.textContent = String(++this.count)));
  }
}

class QaBadge extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>span { background: #047857; color: #fff; padding: 2px 8px; border-radius: 999px; font-size: 12px; }</style>
      <span data-testid="shadow-badge">${this.getAttribute('label') ?? ''}</span>
    `;
  }
}

class QaUserCard extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const name = this.getAttribute('name') ?? 'Unknown';
    const role = this.getAttribute('role-label') ?? 'user';
    root.innerHTML = `
      <style>
        div { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: center; }
        strong { font-size: 16px; }
      </style>
      <div>
        <strong data-testid="shadow-user-name">${name}</strong>
        <qa-badge label="${role}"></qa-badge>
      </div>
    `;
  }
}

export function registerShadowElements() {
  if (!customElements.get('qa-counter')) customElements.define('qa-counter', QaCounter);
  if (!customElements.get('qa-badge')) customElements.define('qa-badge', QaBadge);
  if (!customElements.get('qa-user-card')) customElements.define('qa-user-card', QaUserCard);
}
