import { useState, type FormEvent } from 'react';
import { useMarket } from '../context/MarketContext';

/** Contact form. */
export function ContactPage() {
  const { t } = useMarket();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <article className="content-page">
      <h1 data-testid="page-title">{t('info.contact')}</h1>
      <div lang="en">
        <img src={`${import.meta.env.BASE_URL}images/products/p-bottle.svg`} alt="decorative blue wave" width={480} height={40} className="contact-wave" />
        <p>We usually answer within one working day.</p>

        <form className="card form contact-form" onSubmit={onSubmit}>
          <input type="text" name="name" placeholder="Your name" />

          <label className="field">
            <span>E-mail</span>
            <input type="email" name="email" />
          </label>

          <select name="topic" defaultValue="order">
            <option value="order">Question about an order</option>
            <option value="return">Return or refund</option>
            <option value="other">Something else</option>
          </select>

          <label className="field">
            <span>Phone *</span>
            <input type="tel" name="phone" autoComplete="tel" />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea name="message" rows={4} />
          </label>

          <button type="submit" className="btn">
            Send message
          </button>
          {sent && (
            <p role="status" className="alert alert--success">
              Thank you — we will get back to you soon.
            </p>
          )}
        </form>
      </div>
    </article>
  );
}
