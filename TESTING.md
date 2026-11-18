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
- Pages: `''` (home), `login`, `forms`, `dynamic`, `tables`, `frames`, `dialogs`, `new-tab`, `shop`, `cart`, `checkout`
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

## Browser storage

| Key | Storage | Value |
|---|---|---|
| `qa.cookieConsent` | localStorage | `all` or `necessary`. Seed it to hide the cookie banner. |
| `qa.session` | sessionStorage | `{ username, displayName, role }`. Seed it to skip the UI login. |
| `qa.cart.<market>` | localStorage | Cart items for that market |

## Test data

- Users: `standard_user`, `admin_user`, `locked_user`, all with password `Test1234!`
- Products: `public/api/products.json`, fetched over HTTP. Tests can intercept `**/api/products.json`.
- Orders table: 47 deterministic orders, `ORD-1001` … `ORD-1047`
- Order numbers: `ORD-<MARKET>-<6 digits>`
