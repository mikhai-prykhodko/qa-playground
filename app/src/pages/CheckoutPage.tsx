import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { postalPattern } from '../markets/markets';
import { cartItemToAnalytics, useCart } from '../context/CartContext';
import { trackEcommerce } from '../analytics';
import { useAuth } from '../context/AuthContext';
import type { PaymentMethod } from '../markets/markets';
import type { TranslationKey } from '../i18n';

type Field = 'fullName' | 'street' | 'city' | 'postal' | 'payment';

export function CheckoutPage() {
  const { market, t, money, to } = useMarket();
  const { items, total, vat, shipping, clear } = useCart();
  const { user } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: user?.displayName ?? '',
    street: '',
    city: '',
    postal: '',
    payment: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (items.length) trackEcommerce('begin_checkout', market.currency, items.map((i) => cartItemToAnalytics(i, i.qty)));
    // only when checkout is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (orderNumber) {
    return (
      <section className="narrow center" data-testid="order-confirmation">
        <h1 data-testid="page-title">{t('checkout.success')}</h1>
        <p>{t('checkout.order', { order: '' })}</p>
        <p className="order-number" data-testid="order-number" translate="no">
          {orderNumber}
        </p>
      </section>
    );
  }

  if (items.length === 0) return <Navigate to={to('cart')} replace />;

  const set = (f: Field, v: string) => setValues((s) => ({ ...s, [f]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    (['fullName', 'street', 'city', 'postal', 'payment'] as Field[]).forEach((f) => {
      if (!values[f].trim()) errs[f] = t('error.required');
    });
    if (values.postal && !postalPattern(market).test(values.postal.trim())) {
      errs.postal = t('error.postal', { market: t(`market.${market.code}` as TranslationKey) });
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setPlacing(true);
    setTimeout(() => {
      const number = `ORD-${market.region}-${String(Math.floor(100000 + Math.random() * 900000))}`;
      trackEcommerce('purchase', market.currency, items.map((i) => cartItemToAnalytics(i, i.qty)), {
        transaction_id: number,
        value: total, // overrides the item sum: the order total incl. shipping and rounding
        tax: vat,
        shipping,
        payment_type: values.payment,
      });
      clear();
      setOrderNumber(number);
    }, 800);
  };

  const input = (f: Exclude<Field, 'payment'>, label: string, placeholder?: string) => (
    <label className="field">
      <span>{label} *</span>
      <input name={f} value={values[f]} placeholder={placeholder} onChange={(e) => set(f, e.target.value)} data-testid={`checkout-${f}`} />
      {errors[f] && (
        <span className="field__error" role="alert" data-testid={`checkout-error-${f}`}>
          {errors[f]}
        </span>
      )}
    </label>
  );

  return (
    <section className="narrow">
      <h1 data-testid="page-title">{t('checkout.title')}</h1>
      <form className="card form" onSubmit={onSubmit} noValidate data-testid="checkout-form">
        {input('fullName', t('checkout.fullName'))}
        {input('street', t('checkout.street'))}
        <div className="row row--fields">
          {input('postal', t('checkout.postal'), market.postalCode.example)}
          {input('city', t('checkout.city'))}
        </div>

        <fieldset className="field" data-testid="payment-methods">
          <legend>{t('checkout.payment')} *</legend>
          {market.payments.map((p: PaymentMethod) => (
            <label key={p} className="check payment-option">
              <input type="radio" name="payment" value={p} checked={values.payment === p} onChange={() => set('payment', p)} data-testid={`payment-${p}`} />
              {t(`payment.${p}`)}
            </label>
          ))}
          {errors.payment && (
            <span className="field__error" role="alert" data-testid="checkout-error-payment">
              {errors.payment}
            </span>
          )}
        </fieldset>

        <p className="summary__total">
          {t('cart.total')}: <span data-testid="checkout-total">{money(total)}</span>
        </p>
        <button className="btn btn--block" type="submit" disabled={placing} data-testid="place-order">
          {placing ? '…' : t('checkout.place')}
        </button>
      </form>
    </section>
  );
}
