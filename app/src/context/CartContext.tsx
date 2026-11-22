import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { roundMoney, type Market } from '../markets/markets';
import { trackEcommerce, type AnalyticsItem } from '../analytics';
import { hasBug } from '../bugs';
import type { ColorId } from '../data/products';

export interface CartVariant {
  size?: string;
  color?: ColorId;
}

export interface CartItem {
  /** Unique per product + variant: the same jacket in M and L are two lines. */
  lineId: string;
  productId: string;
  name: string;
  category?: string;
  variant?: CartVariant;
  price: number; // gross price incl. VAT in market currency (after discount)
  qty: number;
}

export type NewCartItem = Omit<CartItem, 'lineId' | 'qty'>;

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  vat: number;
  shipping: number;
  /** Difference caused by rounding the total to the market's step (CH: 0.05). */
  rounding: number;
  total: number;
  add: (item: NewCartItem, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const round2 = (n: number) => Math.round(n * 100) / 100;

export function lineIdOf(productId: string, variant?: CartVariant): string {
  return [productId, variant?.size, variant?.color].filter(Boolean).join('|');
}

export function cartItemToAnalytics(item: NewCartItem, quantity: number): AnalyticsItem {
  return {
    item_id: item.productId,
    item_name: item.name,
    item_category: item.category,
    item_variant: [item.variant?.size, item.variant?.color].filter(Boolean).join(' / ') || undefined,
    price: item.price,
    quantity,
  };
}

function readCart(key: string): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '[]') as Partial<CartItem & { id: string }>[];
    // Migrate carts saved by v1.0 ({ id, name, price, qty }) to the line-based format.
    return raw.map((i) => ({
      lineId: i.lineId ?? i.id ?? '',
      productId: i.productId ?? i.id ?? '',
      name: i.name ?? '',
      category: i.category,
      variant: i.variant,
      price: i.price ?? 0,
      qty: i.qty ?? 1,
    }));
  } catch {
    return [];
  }
}

/** The cart is stored per market: a CH cart never leaks into the DE shop. */
export function CartProvider({ market, children }: { market: Market; children: ReactNode }) {
  // SEEDED BUG shared-cart: one storage key for every market
  const storageKey = hasBug('shared-cart') ? 'qa.cart.shared' : `qa.cart.${market.code}`;
  const [items, setItems] = useState<CartItem[]>(() => readCart(storageKey));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const add = useCallback(
    (item: NewCartItem, qty = 1) => {
      // SEEDED BUG duplicate-lines: a unique id per click, so nothing ever merges
      const lineId = hasBug('duplicate-lines') ? `${lineIdOf(item.productId, item.variant)}#${Date.now()}` : lineIdOf(item.productId, item.variant);
      setItems((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) return prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
        return [...prev, { ...item, lineId, qty }];
      });
      trackEcommerce('add_to_cart', market.currency, [cartItemToAnalytics(item, qty)]);
      // SEEDED BUG double-add-tracking: the event is sent a second time
      if (hasBug('double-add-tracking')) trackEcommerce('add_to_cart', market.currency, [cartItemToAnalytics(item, qty)]);
    },
    [market.currency],
  );

  const setQty = useCallback(
    (lineId: string, qty: number) => {
      const line = items.find((i) => i.lineId === lineId);
      if (!line) return;
      const next = Math.max(0, Math.min(99, qty));
      const diff = next - line.qty;
      if (diff > 0) trackEcommerce('add_to_cart', market.currency, [cartItemToAnalytics(line, diff)]);
      if (diff < 0) trackEcommerce('remove_from_cart', market.currency, [cartItemToAnalytics(line, -diff)]);
      setItems((prev) =>
        next === 0 ? prev.filter((i) => i.lineId !== lineId) : prev.map((i) => (i.lineId === lineId ? { ...i, qty: next } : i)),
      );
    },
    [items, market.currency],
  );

  const remove = useCallback(
    (lineId: string) => {
      const line = items.find((i) => i.lineId === lineId);
      if (line) trackEcommerce('remove_from_cart', market.currency, [cartItemToAnalytics(line, line.qty)]);
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    },
    [items, market.currency],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));
    // SEEDED BUG vat-on-net: VAT added on top of a gross price instead of extracted from it
    const vat = hasBug('vat-on-net') ? round2((subtotal * market.vatRate) / 100) : round2(subtotal - subtotal / (1 + market.vatRate / 100));
    // SEEDED BUG free-shipping-boundary: > instead of >=
    const reachesFreeShipping = hasBug('free-shipping-boundary') ? subtotal > market.freeShippingFrom : subtotal >= market.freeShippingFrom;
    const shipping = items.length === 0 || reachesFreeShipping ? 0 : market.shippingFee;
    const raw = round2(subtotal + shipping);
    const total = roundMoney(market, raw);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      vat,
      shipping,
      rounding: round2(total - raw),
      total,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, market, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
