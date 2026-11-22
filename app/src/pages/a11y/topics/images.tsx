import type { LabTopic } from '../lab';

const base = import.meta.env.BASE_URL;
const photo = `${base}images/products/p-jacket.svg`;

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M12 21s-7-4.4-9.3-9C1 8.4 3.2 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.8 0 6 3.9 4.3 7.5C19 16.6 12 21 12 21z" />
  </svg>
);

export const images: LabTopic = {
  slug: 'images',
  title: 'Images & icons',
  intro: 'Images without text alternatives, file names read aloud, icon buttons without names.',
  examples: [
    {
      id: 'missing-alt',
      wcag: ['1.1.1'],
      title: 'Image without alt text',
      problem: 'The product photo has no alt attribute: screen readers read the file name or nothing.',
      fix: 'alt describes the image.',
      Broken: () => <img src={photo} width={200} height={150} />,
      Fixed: () => <img src={photo} width={200} height={150} alt="Yellow rain jacket with hood" />,
    },
    {
      id: 'filename-alt',
      wcag: ['1.1.1'],
      title: 'File name as alt text',
      problem: 'alt="IMG_2031.jpg" is technically present, so axe-core passes it — but it means nothing.',
      fix: 'A meaningful description.',
      Broken: () => <img src={photo} width={200} height={150} alt="IMG_2031.jpg" data-check="alt-quality" />,
      Fixed: () => <img src={photo} width={200} height={150} alt="Yellow rain jacket with hood" data-check="alt-quality" />,
    },
    {
      id: 'decorative-announced',
      wcag: ['1.1.1'],
      title: 'Decorative image announced',
      problem: 'A purely decorative divider has alt text, so screen readers announce "blue decorative wave line".',
      fix: 'alt="" hides decorative images from assistive technology.',
      Broken: () => (
        <div>
          <p>Our story began in 1998.</p>
          <img src={`${base}images/products/p-bottle.svg`} width={120} height={20} style={{ objectFit: 'cover' }} alt="blue decorative wave line" />
          <p>Today we ship to four countries.</p>
        </div>
      ),
      Fixed: () => (
        <div>
          <p>Our story began in 1998.</p>
          <img src={`${base}images/products/p-bottle.svg`} width={120} height={20} style={{ objectFit: 'cover' }} alt="" />
          <p>Today we ship to four countries.</p>
        </div>
      ),
    },
    {
      id: 'icon-button-no-name',
      wcag: ['4.1.2'],
      title: 'Icon button without a name',
      problem: 'A heart button with only an icon: screen readers just say "button".',
      fix: 'aria-label="Add to wishlist".',
      Broken: () => (
        <button type="button" className="lab-icon-btn">
          <HeartIcon />
        </button>
      ),
      Fixed: () => (
        <button type="button" className="lab-icon-btn" aria-label="Add to wishlist">
          <HeartIcon />
        </button>
      ),
    },
    {
      id: 'icon-link-no-name',
      wcag: ['2.4.4', '4.1.2'],
      title: 'Icon link without a name',
      problem: 'A link that only contains an icon has no accessible name.',
      fix: 'Visually hidden text inside the link.',
      Broken: () => (
        <a href="#wishlist" className="lab-icon-btn">
          <HeartIcon />
        </a>
      ),
      Fixed: () => (
        <a href="#wishlist" className="lab-icon-btn">
          <HeartIcon />
          <span className="sr-only">Wishlist</span>
        </a>
      ),
    },
    {
      id: 'svg-chart-no-text',
      wcag: ['1.1.1'],
      title: 'Chart without a text alternative',
      problem: 'An SVG chart marked role="img" has no title, so its data is lost.',
      fix: 'A <title> summarising the chart.',
      Broken: () => (
        <svg role="img" viewBox="0 0 120 60" width="240" height="120">
          <rect x="10" y="30" width="20" height="30" fill="#4338ca" />
          <rect x="50" y="10" width="20" height="50" fill="#4338ca" />
          <rect x="90" y="40" width="20" height="20" fill="#4338ca" />
        </svg>
      ),
      Fixed: () => (
        <svg role="img" viewBox="0 0 120 60" width="240" height="120" aria-labelledby="lab-chart-title">
          <title id="lab-chart-title">Orders per month: March 30, April 50, May 20</title>
          <rect x="10" y="30" width="20" height="30" fill="#4338ca" />
          <rect x="50" y="10" width="20" height="50" fill="#4338ca" />
          <rect x="90" y="40" width="20" height="20" fill="#4338ca" />
        </svg>
      ),
    },
  ],
};
