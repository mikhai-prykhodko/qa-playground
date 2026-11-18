# App under test

React 18 + TypeScript + Vite. It is a static site with no backend:

- Products come from `public/api/products.json` over real HTTP, so tests can intercept them.
- Users are hard-coded in `src/data/users.ts`.
- The session is kept in `sessionStorage` (`qa.session`).
- Carts are kept in `localStorage` per market (`qa.cart.<market>`).
- Cookie consent is kept in `localStorage` (`qa.cookieConsent`).

```bash
npm run dev       # http://localhost:5173
npm run build     # dist/ (+ 404.html copy for GitHub Pages deep links)
npm run preview   # serve dist/ on http://localhost:4173
VITE_BASE=/my-repo/ npm run build   # build for a sub-path
```

## Contract for test frameworks

See [TESTING.md](../TESTING.md). It covers URLs, test ids, data attributes, storage keys and test data.
