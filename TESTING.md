# Testing contract

This app is the shared target of several test-automation repositories (TypeScript, Python, Java).
They rely on the rules below. Treat changes to them as **breaking changes** and release them as
a new major or minor version.

## Getting the app

Run the published image and point your tests at it. Pin an exact version:

```bash
docker run --rm -p 8080:8080 ghcr.io/mikhai-prykhodko/qa-playground:1.0.0
```

- `GET /healthz` returns `{"status":"ok"}`. Wait for it before starting tests.
- `GET /version.json` returns `{"version":"1.0.0","commit":"…"}`. Log it in test reports.

## URLs

- `/{market}/{lang}/{page}`
- Markets and languages: `ch` (de, fr, it), `de` (de), `at` (de), `uk` (en)
- Pages: `''` (home), `login`, `forms`, `dynamic`, `tables`, `frames`, `dialogs`, `new-tab`, `shop`, `shop/{productId}`, `cart`, `checkout`
- Shop state lives in the query string: `?category=bags,outdoor&inStock=1&min=10&max=80&sort=price-asc|price-desc|name|rating&view=list`
- An unknown product, or one not sold in the market, shows `[data-testid="product-not-found"]`. On GitHub Pages every deep link returns **HTTP 404** (the SPA fallback) even when the page renders, so check the rendered page, not the status code.
- `/` redirects to `/ch/de`. An unknown market shows the 404 page. A language the market doesn't offer redirects to the market's default language.
- The app can be hosted under a sub-path (GitHub Pages), so tests should navigate with **relative** URLs.

## Hooks

- Every page has `[data-testid="page-title"]`.
- `data-testid` attributes are the main locator hooks.
- Some elements have **no** test id on purpose (the comments textarea, the random-id button) to practise role- and label-based locators.
- Machine-readable values sit next to formatted text:
  - `data-amount` and `data-currency` on prices and cart totals
  - `data-value` on table cells
  - `data-product-id` and `data-order-id` on cards and rows
  - `data-strength` on the password meter
  - `data-tick` on the live ticker

## Content pages

`/help` (FAQ accordion), `/contact` (contact form) and `/campaign` (seasonal landing page with a
carousel). The page titles are translated; the bodies are English, marked `lang="en"`. They have no
test ids, like most marketing pages, and are linked from the footer.

## Bugs

Like any real product, the app is **not bug-free**: there are functional and accessibility bugs in
specific markets, languages and pages. They are not documented or switchable; finding them is the
test suites' job. Each test repository keeps its own register of the bugs it found.

## Localization

- **Pseudo-localization:** add `?pseudo=1` to any URL. Every dictionary string then renders as
  `[!! Wárénkórb~~ !!]` (accented, about 30 % longer) for the rest of the session. `?pseudo=0` turns it off.
  Visible text without brackets is hardcoded.
- **Not for translation:** content that must never be translated carries `translate="no"`: product
  names, user reviews, specs values, codes, the brand. Catalog texts localized by the catalog (not the
  UI dictionary) carry `data-i18n="content"`. The English-only legacy page is marked `lang="en"`.
- **Regional German:** the shared German dictionary is Swiss (no "ß"). `de-DE` and `de-AT` add
  overrides with ß spellings (Straße, Größe), and product descriptions can have `de-DE`/`de-AT` variants.
- Market names are translated (`market.ch` → "Schweiz", "Suisse", "Svizzera").

## Parts WITHOUT test ids (on purpose)

Real sites are rarely fully instrumented. These parts have no `data-testid` and must be located by
role, label, placeholder, text, title, alt text, CSS or XPath:

| Part | Where | Stable hooks |
|---|---|---|
| Header search | every page | `role=search` landmark → `role=combobox` (placeholder "Search products…"), `role=listbox` / `role=option` suggestions. Enter with no suggestion selected → `shop?q=<term>`. |
| Footer | every page | `<footer>` (role contentinfo) → `<nav>` columns named by their heading, links by text, payment badges by `title` ("TWINT accepted") |
| Product images | cards, gallery | `<img alt="{product name}">` (gallery: `alt="{name} – {view}"`), `title` on card images; `loading="lazy"` |
| Info pages | `/info/{shipping,returns,contact,about,careers,privacy,terms,imprint}` | `h1` = link text |
| **Legacy page** | `/{market}/{lang}/legacy`, English only | Order history `<table>` with a `<caption>`, rows `tr.ordr`, details in the following `tr.dt` containing a nested table; newsletter form laid out with a table, inputs by `name`, **no labels**; support chat widget with **random class names on every load**: use its `aria-label`s and placeholder |

## Components that appear in several containers

The same component and test ids are rendered in more than one place. Always scope by container:

| Component | Test id | Containers |
|---|---|---|
| Product card | `product-card` (+ `data-product-id`, `data-stock="in|low|out"`) | shop grid `product-grid`, `related-products` on product pages |
| Cart line | `cart-line` (+ `data-line-id`, `data-product-id`) | header `mini-cart`, cart page list inside `<main>` |
| Quantity stepper | `quantity-stepper` → `quantity-decrease`, `quantity-input`, `quantity-increase` | `buy-box`, every `cart-line` |
| Review | `review-card` | `review-list` and, nested, inside another review's `review-replies` |

Other hooks:
- **Product page:** `buy-box`, `option-group` (`data-option="size|color"`, an ARIA radiogroup with `option` items carrying `data-value` and `data-available`; unavailable options are `aria-disabled`), `variant-error`, `tab-description|specs|reviews` (ARIA tabs), `specs-table`, `gallery-main`, `gallery-thumb`, `helpful-button`.
- **Shop:** `filter-panel` → `facet-group` (`data-facet="category|availability|price"`) → `facet-option` (`data-value`) with `facet-count`; `price-min`, `price-max`, `clear-filters`; `shop-toolbar` → `result-count` (`data-count`), `sort-select`, `view-grid`, `view-list`.
- **Header:** `mini-cart-widget` → `mini-cart-toggle` (`aria-expanded`), `cart-count`, panel `mini-cart`.
- Products with sizes or colours show `choose-options` on their card instead of `add-to-cart`.

## Business rules

- **Rounding:** sale prices and cart totals are rounded to the market's step: CHF to 0.05 (5 centimes), EUR and GBP to 0.01.
- **Stock:** 0 means sold out; 1–5 shows "only N left" and caps the quantity at the stock.
- **Shipping:** free from the market's threshold (CH 100, DE 50, AT 60, UK 40), otherwise a flat fee.

## Analytics

The app pushes GA4-style events to `window.dataLayer`; nothing is sent anywhere:
`page_view`, `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`,
`begin_checkout`, `purchase`. Ecommerce events have `{ currency, value, items: [{ item_id, item_name,
item_category, item_variant, price, quantity }] }`. `purchase` adds `transaction_id`, `tax`, `shipping`
and `payment_type`. Each event fires exactly once per user action.

## Browser storage

| Key | Storage | Value |
|---|---|---|
| `qa.cookieConsent` | localStorage | `all` or `necessary`. Seed it to hide the cookie banner. |
| `qa.session` | sessionStorage | `{ username, displayName, role }`. Seed it to skip the UI login. |
| `qa.cart.<market>` | localStorage | Cart lines for that market (`lineId` = product + size + colour) |

## Test data

- Users: `standard_user`, `admin_user`, `locked_user`, all with password `Test1234!`
- Products: `public/api/products.json`, fetched over HTTP. Tests can intercept `**/api/products.json`, or read it with an HTTP client. **Don't hardcode the catalog in tests:** discover products from the page or this file, because the assortment, stock and prices can change.
- Orders table: 47 deterministic orders, `ORD-1001` … `ORD-1047`
- Order numbers: `ORD-<MARKET>-<6 digits>`
