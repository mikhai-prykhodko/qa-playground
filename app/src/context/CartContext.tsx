import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Market } from '../markets/markets';

export interface CartItem {
  id: string;
  name: string;
  price: number; // gross price incl. VAT in market currency
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const round = (n: number) => Math.round(n * 100) / 100;

/** The cart is stored per market: a CH cart never leaks into the DE shop. */
export function CartProvider({ market, children }: { market: Market; children: ReactNode }) {
  const storageKey = `qa.cart.${market.code}`;
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = round(items.reduce((sum, i) => sum + i.price * i.qty, 0));
    const vat = round(subtotal - subtotal / (1 + market.vatRate / 100));
    const shipping = items.length === 0 || subtotal >= market.freeShippingFrom ? 0 : market.shippingFee;
    return {
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      vat,
      shipping,
      total: round(subtotal + shipping),
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
          return [...prev, { ...item, qty: 1 }];
        }),
      setQty: (id, qty) =>
        setItems((prev) => (qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)))),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
    };
  }, [items, market]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
