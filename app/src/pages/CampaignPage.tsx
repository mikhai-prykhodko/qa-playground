import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

const SLIDES = ['Free shipping on all outdoor gear', 'New: merino beanies in three colours', 'Up to 25% off selected items'];

const SocialIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <path fill="currentColor" d={d} />
  </svg>
);

/** Seasonal campaign landing page. */
export function CampaignPage() {
  const { t, to } = useMarket();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <article className="content-page">
      <h1 data-testid="page-title">{t('page.campaign')}</h1>
      <div lang="en">
        <div className="campaign-hero" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/products/p-jacket.svg)` }}>
          <p className="campaign-hero__text">Ready for the first snow?</p>
          <span className="campaign-badge">New</span>
        </div>

        <p className="campaign-slide" aria-live="off">
          {SLIDES[slide]}
        </p>

        <div className="campaign-banner">
          Order before 2 pm for same-day dispatch · free returns within 30 days · pay later with invoice
        </div>

        <p>
          <Link to={to('shop')}>Shop the collection</Link> ·{' '}
          <a href="https://www.example.com/campaign-terms" target="_blank" rel="noopener noreferrer">
            Campaign terms
          </a>
        </p>

        <div className="campaign-social">
          <span>Follow us:</span>
          <a href="https://www.example.com/instagram">
            <SocialIcon d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-3H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          </a>
          <a href="https://www.example.com/facebook">
            <SocialIcon d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" />
          </a>
        </div>

        <div className="campaign-share">
          <span>Share:</span>
          <button type="button" className="campaign-share__btn" aria-label="Share by e-mail">
            ✉
          </button>
          <button type="button" className="campaign-share__btn" aria-label="Copy link">
            ⧉
          </button>
        </div>
      </div>
    </article>
  );
}
