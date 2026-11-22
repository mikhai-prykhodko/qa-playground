import type { LabTopic } from '../lab';

export const reflow: LabTopic = {
  slug: 'reflow',
  title: 'Zoom, spacing & targets',
  intro: 'Layouts that break at 400% zoom, text that is cut off with larger spacing, and tiny click targets.',
  examples: [
    {
      id: 'no-reflow',
      wcag: ['1.4.10'],
      title: 'Fixed-width content',
      problem: 'A promo box with a fixed width of 700px forces horizontal scrolling on a 320px-wide screen (= 400% zoom).',
      fix: 'max-width: 100% lets it reflow.',
      Broken: () => (
        <div className="lab-promo" style={{ width: 700 }} data-check="reflow">
          Order before 2 pm for same-day dispatch — free returns within 30 days.
        </div>
      ),
      Fixed: () => (
        <div className="lab-promo" style={{ width: 700, maxWidth: '100%' }} data-check="reflow">
          Order before 2 pm for same-day dispatch — free returns within 30 days.
        </div>
      ),
    },
    {
      id: 'text-spacing-clipped',
      wcag: ['1.4.12'],
      title: 'Text clipped with more spacing',
      problem: 'A fixed height with overflow: hidden — when users increase line or letter spacing, text is cut off.',
      fix: 'min-height instead of height.',
      Broken: () => (
        <p className="lab-spacing" style={{ height: '3em', overflow: 'hidden' }} data-check="spacing">
          Our jackets are tested in real mountain weather before they reach the shop.
        </p>
      ),
      Fixed: () => (
        <p className="lab-spacing" style={{ minHeight: '3em' }} data-check="spacing">
          Our jackets are tested in real mountain weather before they reach the shop.
        </p>
      ),
    },
    {
      id: 'small-targets',
      wcag: ['2.5.8'],
      title: 'Tiny touch targets',
      problem: 'Quantity buttons of 14×14px placed right next to each other are hard to hit (minimum 24×24px).',
      fix: '32×32px buttons with spacing.',
      Broken: () => (
        <div className="lab-qty">
          <button type="button" className="lab-qty__btn" style={{ width: 14, height: 14 }} aria-label="Decrease" data-check="target">
            −
          </button>
          <span>1</span>
          <button type="button" className="lab-qty__btn" style={{ width: 14, height: 14 }} aria-label="Increase" data-check="target">
            +
          </button>
        </div>
      ),
      Fixed: () => (
        <div className="lab-qty" style={{ gap: 8 }}>
          <button type="button" className="lab-qty__btn" style={{ width: 32, height: 32 }} aria-label="Decrease" data-check="target">
            −
          </button>
          <span>1</span>
          <button type="button" className="lab-qty__btn" style={{ width: 32, height: 32 }} aria-label="Increase" data-check="target">
            +
          </button>
        </div>
      ),
    },
  ],
};
