import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

const FAQ = {
  orders: [
    { q: 'How long does delivery take?', a: 'Orders placed before 2 pm are dispatched the same day. Delivery takes 1–3 working days.' },
    { q: 'Can I change my order?', a: 'As long as it has not been dispatched, contact us and we will update it.' },
  ],
  returns: [
    { q: 'How do I return an item?', a: 'Use the return label in your parcel. Returns are free within 30 days.' },
    { q: 'When do I get my refund?', a: 'Within 5 working days after we receive the item.' },
  ],
};

function Question({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq">
      <div className="faq__q" onClick={() => setOpen((o) => !o)}>
        {q} <span aria-hidden>{open ? '−' : '+'}</span>
      </div>
      {open && <p className="faq__a">{a}</p>}
    </div>
  );
}

/** Help center with an FAQ accordion. */
export function HelpPage() {
  const { t, to } = useMarket();
  return (
    <article className="content-page">
      <h1 data-testid="page-title">{t('page.help')}</h1>
      <div lang="en">
        <p className="help-hint">
          Find answers to common questions. Need something else? <Link to={to('contact')}>Click here</Link>
        </p>
        <h2>Orders</h2>
        {FAQ.orders.map((f) => (
          <Question key={f.q} {...f} />
        ))}
        <h5>Returns &amp; refunds</h5>
        {FAQ.returns.map((f) => (
          <Question key={f.q} {...f} />
        ))}
        <p>
          The full returns policy is on its own page — <Link to={to('info/returns')}>click here</Link>.
        </p>
      </div>
    </article>
  );
}
