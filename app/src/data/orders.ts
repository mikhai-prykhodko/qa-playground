/**
 * Deterministic order data (seeded PRNG) so tests can rely on exact values.
 */
export type OrderStatus = 'new' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  city: string;
  date: string; // ISO
  amount: number;
  status: OrderStatus;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Anna', 'Luca', 'Mia', 'Noah', 'Lea', 'Elias', 'Sofia', 'Jonas', 'Emma', 'Leon', 'Chloé', 'Marco'];
const LAST = ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Rossi', 'Dubois', 'Fischer', 'Brown', 'Smith', 'Bianchi'];
const CITIES = ['Zürich', 'Genève', 'Lugano', 'Bern', 'Berlin', 'München', 'Wien', 'Graz', 'London', 'Manchester', 'Basel', 'Hamburg'];
const STATUSES: OrderStatus[] = ['new', 'paid', 'shipped', 'cancelled'];

export function generateOrders(count = 47, seed = 42): Order[] {
  const rnd = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const start = Date.UTC(2025, 0, 1);
  return Array.from({ length: count }, (_, i) => ({
    id: `ORD-${String(1001 + i)}`,
    customer: `${pick(FIRST)} ${pick(LAST)}`,
    city: pick(CITIES),
    date: new Date(start + Math.floor(rnd() * 365) * 86_400_000).toISOString().slice(0, 10),
    amount: Math.round((10 + rnd() * 990) * 100) / 100,
    status: pick(STATUSES),
  }));
}
