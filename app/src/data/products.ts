import type { Lang, MarketCode } from '../markets/markets';

export interface Product {
  id: string;
  /** Key of an icon in components/icons.ts (unknown keys fall back to a generic box). */
  icon: string;
  name: Record<Lang, string>;
  price: Partial<Record<MarketCode, number>>;
  stock: number;
  markets: MarketCode[];
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
