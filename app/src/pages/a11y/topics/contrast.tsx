import type { LabTopic } from '../lab';

const img = `${import.meta.env.BASE_URL}images/products/p-backpack.svg`;

export const contrast: LabTopic = {
  slug: 'contrast',
  title: 'Color & contrast',
  intro: 'Text and controls people cannot see: low contrast, colour as the only signal, invisible focus.',
  examples: [
    {
      id: 'low-contrast-text',
      wcag: ['1.4.3'],
      title: 'Body text contrast',
      problem: 'Light grey text on white has a contrast ratio of about 2:1 (minimum 4.5:1).',
      fix: 'Darker grey text reaches about 7:1.',
      Broken: () => <p style={{ color: '#b5b5b5' }}>Free returns within 30 days on all orders.</p>,
      Fixed: () => <p style={{ color: '#595959' }}>Free returns within 30 days on all orders.</p>,
    },
    {
      id: 'placeholder-contrast',
      wcag: ['1.4.3'],
      title: 'Placeholder contrast',
      problem: 'The placeholder is so light that the hint is unreadable. axe-core does not check placeholders.',
      fix: 'A placeholder colour with 4.5:1 contrast, plus a real label.',
      Broken: () => (
        <label className="lab-field">
          Voucher code
          <input className="lab-ph-low" placeholder="e.g. SPRING-2026" data-check="placeholder" />
        </label>
      ),
      Fixed: () => (
        <label className="lab-field">
          Voucher code
          <input className="lab-ph-ok" placeholder="e.g. SPRING-2026" data-check="placeholder" />
        </label>
      ),
    },
    {
      id: 'link-in-text-block',
      wcag: ['1.4.1'],
      title: 'Links identified by colour only',
      problem: 'A link inside text differs from the text only by a slightly different colour, with no underline.',
      fix: 'Links in text are underlined.',
      Broken: () => (
        <p style={{ color: '#1f2937' }}>
          Read our{' '}
          <a href="#returns" style={{ color: '#4b5563', textDecoration: 'none' }}>
            returns policy
          </a>{' '}
          before sending items back.
        </p>
      ),
      Fixed: () => (
        <p style={{ color: '#1f2937' }}>
          Read our{' '}
          <a href="#returns" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>
            returns policy
          </a>{' '}
          before sending items back.
        </p>
      ),
    },
    {
      id: 'non-text-contrast',
      wcag: ['1.4.11'],
      title: 'Input border contrast',
      problem: 'The input border is almost white: people cannot see where to type (needs 3:1). axe-core does not check borders.',
      fix: 'A border with more than 3:1 contrast against the background.',
      Broken: () => (
        <label className="lab-field">
          Gift message
          <input style={{ border: '1px solid #e6e6e6', background: '#ffffff' }} data-check="border" />
        </label>
      ),
      Fixed: () => (
        <label className="lab-field">
          Gift message
          <input style={{ border: '1px solid #767676', background: '#ffffff' }} data-check="border" />
        </label>
      ),
    },
    {
      id: 'focus-indicator-contrast',
      wcag: ['2.4.7', '1.4.11'],
      title: 'Focus indicator contrast',
      problem: 'The focus ring is a pale lilac on white — keyboard users lose track of where they are.',
      fix: 'A 3px dark focus ring with high contrast.',
      Broken: () => (
        <button type="button" className="lab-btn lab-focus-low" data-check="focus">
          Apply voucher
        </button>
      ),
      Fixed: () => (
        <button type="button" className="lab-btn lab-focus-ok" data-check="focus">
          Apply voucher
        </button>
      ),
    },
    {
      id: 'text-over-image',
      wcag: ['1.4.3'],
      title: 'Text over an image',
      problem: 'White text directly on a light image. Tools cannot compute the contrast and need a human review.',
      fix: 'The text sits on a solid dark band, so its contrast is known.',
      Broken: () => (
        <div className="lab-hero" style={{ backgroundImage: `url(${img})` }}>
          <p style={{ color: '#ffffff', margin: 0 }}>Autumn sale: 20% off backpacks</p>
        </div>
      ),
      Fixed: () => (
        <div className="lab-hero" style={{ backgroundImage: `url(${img})` }}>
          <p style={{ color: '#ffffff', background: '#1f2937', padding: '6px 10px', margin: 0 }}>Autumn sale: 20% off backpacks</p>
        </div>
      ),
    },
    {
      id: 'dark-mode-contrast',
      wcag: ['1.4.3'],
      title: 'Dark mode contrast',
      problem: 'Fine in light mode, but in dark mode the text is dark grey on near-black. Only visible when the test emulates dark mode.',
      fix: 'The dark-mode colours are adjusted too.',
      Broken: () => <p className="lab-dark lab-dark--broken">Delivery in 2–3 working days.</p>,
      Fixed: () => <p className="lab-dark lab-dark--fixed">Delivery in 2–3 working days.</p>,
    },
  ],
};
