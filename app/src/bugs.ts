/**
 * Defect seeding: deliberate bugs that can be switched on to prove the test suites catch them.
 * The app is correct by default. Activate with ?bugs=vat-on-net,shared-cart (kept for the
 * browser session, ?bugs= clears) or by putting the list into sessionStorage "qa.bugs".
 *
 * Never active unless explicitly requested — production users never see these.
 */
export const SEEDED_BUGS = {
  'vat-on-net': 'Cart VAT is calculated on top of the gross price instead of being extracted from it',
  'no-chf-rounding': 'CHF amounts are not rounded to 5 centimes',
  'free-shipping-boundary': 'Free shipping applies only ABOVE the threshold, not at it (> instead of >=)',
  'duplicate-lines': 'Adding the same product/variant again creates a second cart line instead of merging',
  'shared-cart': 'One cart is shared between all markets',
  'soldout-addable': 'Sold-out products can still be added to the cart',
  'fr-fallback': 'French cart page title falls back to English',
  'double-add-tracking': 'add_to_cart is tracked twice per click',
  'locked-login': 'Locked users can log in',
  'ch-postal-5-digits': 'Swiss postal codes with 5 digits are accepted',
  'low-contrast': 'Primary buttons have text contrast below WCAG AA',
  'button-color': 'Primary colour changed by a stray CSS edit',
} as const;

export type SeededBug = keyof typeof SEEDED_BUGS;

const STORAGE_KEY = 'qa.bugs';

function readBugs(): Set<string> {
  try {
    const param = new URLSearchParams(window.location.search).get('bugs');
    if (param !== null) {
      if (param) sessionStorage.setItem(STORAGE_KEY, param);
      else sessionStorage.removeItem(STORAGE_KEY);
    }
    return new Set((sessionStorage.getItem(STORAGE_KEY) ?? '').split(',').map((b) => b.trim()).filter((b) => b in SEEDED_BUGS));
  } catch {
    return new Set();
  }
}

/** Read once at start-up: switching bugs needs a page load, like a feature flag. */
const ACTIVE = readBugs();

export function hasBug(bug: SeededBug): boolean {
  return ACTIVE.has(bug);
}

/** Exposed as <html data-bugs="…"> so CSS-only bugs can hook in, and for debugging. */
export function activeBugs(): string[] {
  return [...ACTIVE];
}
