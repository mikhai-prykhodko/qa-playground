/**
 * Market (tenant) configuration.
 * Every market has its own languages, currency, VAT, postal-code rules,
 * payment methods and shipping rules. The UI reads everything from here,
 * so tests can verify the same flow behaves differently per market.
 */
export type MarketCode = 'ch' | 'de' | 'at' | 'uk';
export type Lang = 'en' | 'de' | 'fr' | 'it';
export type PaymentMethod = 'card' | 'twint' | 'invoice' | 'klarna' | 'paypal' | 'eps';

export interface Market {
  code: MarketCode;
  name: string;
  flag: string;
  region: string; // used to build the Intl locale, e.g. de-CH
  languages: Lang[];
  defaultLang: Lang;
  currency: 'CHF' | 'EUR' | 'GBP';
  vatRate: number; // percent, prices are shown incl. VAT
  postalCode: { pattern: RegExp; example: string };
  phonePrefix: string;
  payments: PaymentMethod[];
  shippingFee: number;
  freeShippingFrom: number;
  privacyLaw: string;
  /**
   * Smallest amount a total can be paid in. Switzerland rounds cash amounts to 5 centimes
   * ("Rappenrundung"), so CH uses 0.05; EUR and GBP use 0.01.
   */
  roundingStep: 0.05 | 0.01;
}

export const MARKETS: Record<MarketCode, Market> = {
  ch: {
    code: 'ch',
    name: 'Switzerland',
    flag: '🇨🇭',
    region: 'CH',
    languages: ['de', 'fr', 'it'],
    defaultLang: 'de',
    currency: 'CHF',
    vatRate: 8.1,
    postalCode: { pattern: /^[1-9]\d{3}$/, example: '8001' },
    phonePrefix: '+41',
    payments: ['card', 'twint', 'invoice'],
    shippingFee: 9.9,
    freeShippingFrom: 100,
    privacyLaw: 'revDSG',
    roundingStep: 0.05,
  },
  de: {
    code: 'de',
    name: 'Germany',
    flag: '🇩🇪',
    region: 'DE',
    languages: ['de'],
    defaultLang: 'de',
    currency: 'EUR',
    vatRate: 19,
    postalCode: { pattern: /^\d{5}$/, example: '10115' },
    phonePrefix: '+49',
    payments: ['card', 'klarna', 'paypal'],
    shippingFee: 4.95,
    freeShippingFrom: 50,
    privacyLaw: 'DSGVO',
    roundingStep: 0.01,
  },
  at: {
    code: 'at',
    name: 'Austria',
    flag: '🇦🇹',
    region: 'AT',
    languages: ['de'],
    defaultLang: 'de',
    currency: 'EUR',
    vatRate: 20,
    postalCode: { pattern: /^[1-9]\d{3}$/, example: '1010' },
    phonePrefix: '+43',
    payments: ['card', 'eps', 'paypal'],
    shippingFee: 5.9,
    freeShippingFrom: 60,
    privacyLaw: 'DSGVO',
    roundingStep: 0.01,
  },
  uk: {
    code: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'GB',
    languages: ['en'],
    defaultLang: 'en',
    currency: 'GBP',
    vatRate: 20,
    postalCode: { pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, example: 'SW1A 1AA' },
    phonePrefix: '+44',
    payments: ['card', 'paypal'],
    shippingFee: 3.99,
    freeShippingFrom: 40,
    privacyLaw: 'UK GDPR',
    roundingStep: 0.01,
  },
};

export const MARKET_CODES = Object.keys(MARKETS) as MarketCode[];

export function isMarketCode(value: string | undefined): value is MarketCode {
  return !!value && value in MARKETS;
}

export function intlLocale(market: Market, lang: Lang): string {
  return `${lang}-${market.region}`;
}

/**
 * Rounds an amount to the market's rounding step, using integer cents to avoid
 * floating-point errors: CH 59.925 → 59.95, DE 17.991 → 17.99.
 */
export function roundMoney(market: Market, amount: number): number {
  const stepCents = Math.round(market.roundingStep * 100);
  const cents = Math.round(amount * 100);
  return (Math.round(cents / stepCents) * stepCents) / 100;
}
