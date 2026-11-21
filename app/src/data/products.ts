import { useCallback, useEffect, useState } from 'react';
import { roundMoney, type Lang, type Market, type MarketCode } from '../markets/markets';

export type Category = 'bags' | 'drinkware' | 'outdoor' | 'food' | 'apparel' | 'home';
export type SpecKey = 'volume' | 'weight' | 'material' | 'dimensions' | 'origin' | 'warranty';
export type ColorId = 'black' | 'navy' | 'forest' | 'red' | 'yellow' | 'grey' | 'white';

export interface VariantOption<T extends string = string> {
  id: T;
  available: boolean;
}

export interface ColorOption extends VariantOption<ColorId> {
  hex: string;
}

export interface ReviewReply {
  id: string;
  author: string;
  staff: boolean;
  date: string;
  text: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
  replies: ReviewReply[];
}

export interface Product {
  id: string;
  /** Key of an icon in components/icons.ts (unknown keys fall back to a generic box). */
  icon: string;
  category: Category;
  isNew?: boolean;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Regular gross price per market (incl. VAT). A market without a price doesn't sell it. */
  price: Partial<Record<MarketCode, number>>;
  discountPercent?: number;
  stock: number;
  markets: MarketCode[];
  variants?: { sizes?: VariantOption[]; colors?: ColorOption[] };
  specs: { key: SpecKey; value: string }[];
  reviews: Review[];
}

export const LOW_STOCK_THRESHOLD = 5;
export type StockStatus = 'in' | 'low' | 'out';

export function isSoldIn(product: Product, market: Market): boolean {
  return product.markets.includes(market.code) && product.price[market.code] !== undefined;
}

/**
 * Price the customer pays in a market. Discounts are applied as a percentage and then
 * rounded to the market's rounding step, which is where CHF 5-centime rounding shows up.
 */
export function priceIn(product: Product, market: Market): { price: number; regular: number; discount: number } {
  const regular = product.price[market.code] ?? 0;
  const discount = product.discountPercent ?? 0;
  const price = discount ? roundMoney(market, (regular * (100 - discount)) / 100) : regular;
  return { price, regular, discount };
}

export function stockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return 'out';
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

export function averageRating(product: Product): number | null {
  if (product.reviews.length === 0) return null;
  const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / product.reviews.length) * 10) / 10;
}

/**
 * Real HTTP request to a static JSON "API" — tests can intercept it
 * with page.route() to simulate errors, slow responses or other data.
 */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}api/products.json`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await new Promise((r) => setTimeout(r, 500)); // simulated latency
  return (await res.json()) as Product[];
}

export type ProductsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; products: Product[] };

/** Loads the catalog; `reload` retries after an error. */
export function useProducts(): { state: ProductsState; reload: () => void } {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetchProducts(ctrl.signal)
      .then((products) => setState({ status: 'ready', products }))
      .catch((e: Error) => e.name !== 'AbortError' && setState({ status: 'error' }));
    return () => ctrl.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, reload };
}
