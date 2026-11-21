/**
 * Analytics events in the GA4 ecommerce format, pushed to window.dataLayer
 * (the array Google Tag Manager reads). Nothing is sent anywhere — tests read
 * the array to verify tracking: right event, product, price, currency, quantity.
 *
 *   window.dataLayer = [
 *     { event: 'page_view', market: 'ch', lang: 'de', page_path: '/ch/de/shop' },
 *     { event: 'add_to_cart', ecommerce: { currency: 'CHF', value: 89.9, items: [ … ] } },
 *   ]
 */

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  discount?: number;
}

export type EcommerceEvent =
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'purchase';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(entry: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(entry);
}

export function trackPageView(market: string, lang: string, path: string) {
  push({ event: 'page_view', market, lang, page_path: path });
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function trackEcommerce(
  event: EcommerceEvent,
  currency: string,
  items: AnalyticsItem[],
  extra: Record<string, unknown> = {},
) {
  const value = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  // GA4 convention: clear the previous ecommerce object before pushing a new one
  push({ ecommerce: null });
  push({ event, ecommerce: { currency, value, items, ...extra } });
}
