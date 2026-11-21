import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useMarket } from '../context/MarketContext';

/**
 * "Legacy" internal tool: the kind of markup real projects still contain.
 * English only (never translated), no data-testid, no ids on rows, a layout table
 * for the form, and a third-party widget with generated class names.
 * Tests have to use CSS selectors, XPath, text and ARIA here.
 */
export function LegacyPage() {
  return (
    // English-only content inside a translated page: lang="en" tells browsers and screen readers
    <section className="legacy" lang="en">
      <h1 data-testid="page-title">Legacy account tools</h1>
      <p className="legacy__note">Internal tool · English only · last updated 2009</p>
      <OrderHistory />
      <NewsletterForm />
      <SupportChat />
    </section>
  );
}

/* ------------------------------------------------------------------ order history */

interface LegacyOrder {
  no: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
  items: { sku: string; name: string; qty: number; price: number }[];
}

const ORDERS: LegacyOrder[] = [
  { no: 'A-20231', date: '2025-01-14', status: 'Delivered', items: [{ sku: 'BK-30', name: 'Hiking Backpack', qty: 1, price: 89.9 }, { sku: 'BT-05', name: 'Steel Water Bottle', qty: 2, price: 24.9 }] },
  { no: 'A-20377', date: '2025-03-02', status: 'Delivered', items: [{ sku: 'KN-91', name: 'Swiss Pocket Knife', qty: 1, price: 39 }] },
  { no: 'A-20412', date: '2025-04-19', status: 'Cancelled', items: [{ sku: 'JK-M', name: 'Rain Jacket', qty: 1, price: 149 }] },
  { no: 'A-20598', date: '2025-07-08', status: 'Shipped', items: [{ sku: 'PL-38', name: 'Trekking Poles', qty: 1, price: 59.9 }, { sku: 'MG-35', name: 'Camping Mug', qty: 4, price: 19.9 }, { sku: 'BN-01', name: 'Merino Beanie', qty: 1, price: 29.9 }] },
  { no: 'A-20640', date: '2025-08-23', status: 'Processing', items: [{ sku: 'LN-40', name: 'LED Camping Lantern', qty: 2, price: 44.9 }] },
  { no: 'A-20702', date: '2025-10-11', status: 'Delivered', items: [{ sku: 'CH-24', name: 'Alpine Chocolate Box', qty: 3, price: 14.5 }] },
];

const totalOf = (o: LegacyOrder) => Math.round(o.items.reduce((s, i) => s + i.qty * i.price, 0) * 100) / 100;

function OrderHistory() {
  const { money, date } = useMarket();
  const [open, setOpen] = useState<string | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);

  return (
    <div className="legacy__block">
      <table className="tbl tbl-striped" cellPadding={0} cellSpacing={0}>
        <caption>Order history</caption>
        <thead>
          <tr>
            <th>Order no.</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((o) => (
            <OrderRows
              key={o.no}
              order={o}
              expanded={open === o.no}
              onToggle={() => setOpen((cur) => (cur === o.no ? null : o.no))}
              onReorder={() => setReordered(o.no)}
              money={money}
              date={date}
            />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="r">
              Lifetime total
            </td>
            <td className="num">
              <b>{money(ORDERS.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + totalOf(o), 0))}</b>
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
      {reordered && <div className="msg msg-ok">Order {reordered} was added to your cart (demo only).</div>}
    </div>
  );
}

function OrderRows({
  order,
  expanded,
  onToggle,
  onReorder,
  money,
  date,
}: {
  order: LegacyOrder;
  expanded: boolean;
  onToggle: () => void;
  onReorder: () => void;
  money: (n: number) => string;
  date: (d: string) => string;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  return (
    <>
      <tr className={expanded ? 'ordr ordr-open' : 'ordr'}>
        <td>{order.no}</td>
        <td>{date(order.date)}</td>
        <td className="num">{itemCount}</td>
        <td className="num">{money(totalOf(order))}</td>
        <td>
          <span className={`lbl lbl-${order.status.toLowerCase()}`}>{order.status}</span>
        </td>
        <td className="act">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
          >
            {expanded ? 'Hide' : 'Details'}
          </a>{' '}
          <button type="button" className="btn-legacy" disabled={order.status === 'Cancelled'} onClick={onReorder}>
            Reorder
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="dt">
          <td colSpan={6}>
            <table className="tbl tbl-inner">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.sku}>
                    <td>{i.sku}</td>
                    <td>{i.name}</td>
                    <td className="num">{i.qty}</td>
                    <td className="num">{money(i.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ newsletter (no labels) */

function NewsletterForm() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage({ ok: false, text: 'Please enter a valid e-mail address.' });
    if (!data.get('agree')) return setMessage({ ok: false, text: 'You must agree to receive e-mails.' });
    setMessage({ ok: true, text: `Thank you! ${email} will receive the ${data.get('freq')} newsletter.` });
  };

  return (
    <div className="legacy__block">
      <h2>Newsletter</h2>
      {/* old-school layout table, captions in cells, no <label for> */}
      <form name="newsletter" onSubmit={onSubmit} onReset={() => setMessage(null)} noValidate>
        <table className="frm">
          <tbody>
            <tr>
              <td className="frm-l">E-mail:</td>
              <td>
                <input type="text" name="email" size={30} />
              </td>
            </tr>
            <tr>
              <td className="frm-l">Name:</td>
              <td>
                <input type="text" name="fullname" size={30} />
              </td>
            </tr>
            <tr>
              <td className="frm-l">Frequency:</td>
              <td>
                <select name="freq" defaultValue="weekly">
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <input type="checkbox" name="agree" value="1" /> I agree to receive e-mails
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <input type="submit" value="Subscribe" /> <input type="reset" value="Clear" />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      {message && <div className={message.ok ? 'msg msg-ok' : 'msg msg-err'}>{message.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ third-party chat widget */

/** Mimics an embedded vendor widget: class names are generated on every page load. */
function SupportChat() {
  const cls = useMemo(() => {
    const r = () => 'x' + Math.random().toString(36).slice(2, 7);
    return { root: r(), bubble: r(), panel: r(), log: r(), input: r(), send: r(), msg: r() };
  }, []);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'agent' | 'me'; text: string }[]>([
    { from: 'agent', text: 'Hi! How can we help you today?' },
  ]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'me', text }]);
    setDraft('');
    setTimeout(() => setMessages((m) => [...m, { from: 'agent', text: 'Thanks! An agent will reply shortly.' }]), 1000);
  };

  return (
    <div className={`chat-widget ${cls.root}`}>
      {open && (
        <div className={`chat-widget__panel ${cls.panel}`} role="dialog" aria-label="Support chat">
          <div className={`chat-widget__log ${cls.log}`} role="log" aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={`chat-widget__msg chat-widget__msg--${m.from} ${cls.msg}`}>
                {m.text}
              </p>
            ))}
          </div>
          <form
            className="chat-widget__form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              className={cls.input}
              placeholder="Type a message…"
              aria-label="Message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className={cls.send} aria-label="Send message">
              ➤
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className={`chat-widget__bubble ${cls.bubble}`}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
        title="Chat with us"
        onClick={() => setOpen((o) => !o)}
      >
        💬
      </button>
    </div>
  );
}
