# 🧪 QA Playground

[![CI](https://github.com/mikhai-prykhodko/qa-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/mikhai-prykhodko/qa-playground/actions/workflows/ci.yml)
[![Docker image](https://github.com/mikhai-prykhodko/qa-playground/actions/workflows/docker.yml/badge.svg)](https://github.com/mikhai-prykhodko/qa-playground/pkgs/container/qa-playground)

A **multi-market, multi-language demo web shop** built as a realistic target for test automation.
It is tested by separate frameworks in different languages, each in its own repository.

🌐 **Live app:** `https://mikhai-prykhodko.github.io/qa-playground/`
🐳 **Docker image:** `ghcr.io/mikhai-prykhodko/qa-playground`

## The app

The URL decides the tenant: `/{market}/{language}/{page}`. For example `/ch/fr/shop` is the shop
for Switzerland in French.

| Market | Languages | Currency | VAT | Postal code | Payment methods |
|---|---|---|---|---|---|
| 🇨🇭 `ch` Switzerland | de, fr, it | CHF | 8.1 % | `8001` | Card, TWINT, Invoice |
| 🇩🇪 `de` Germany | de | EUR | 19 % | `10115` | Card, Klarna, PayPal |
| 🇦🇹 `at` Austria | de | EUR | 20 % | `1010` | Card, eps, PayPal |
| 🇬🇧 `uk` United Kingdom | en | GBP | 20 % | `SW1A 1AA` | Card, PayPal |

| Page | What it is for |
|---|---|
| **Forms** | Every input type, a custom dropdown, slider, toggle, file upload, market-specific validation |
| **Dynamic** | Random delays, spinners, late elements, countdown button, random IDs, self-closing toast, re-rendering element |
| **Tables** | Sorting, filtering, pagination, page size, row selection, deletion |
| **Frames & Shadow DOM** | iframe, nested iframes, open (and nested) shadow roots |
| **Dialogs & Windows** | alert / confirm / prompt, new tab, popup, modal, tooltip, hover-only menu |
| **Shop → Cart → Checkout** | Products over HTTP, per-market prices / VAT / shipping, login-protected checkout |
| **Login** | `standard_user`, `admin_user`, `locked_user`, all with password `Test1234!` |

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in app/dist
npm run preview    # serve the build on http://localhost:4173
```

The stack is React 18, TypeScript, Vite and Material Icons. It's a static site with no backend yet.

## Docker image

Test repositories don't build the app. They run a published, versioned image:

```bash
docker run --rm -p 8080:8080 ghcr.io/mikhai-prykhodko/qa-playground:1.0.0
# → http://localhost:8080   health: /healthz   build info: /version.json
```

| Tag | Published when | Use it for |
|---|---|---|
| `1.0.0`, `1.0` | a release tag `v1.0.0` is pushed | **Test repositories pin this** |
| `latest` | every release | Trying it out |
| `edge` | every push to `main` | Testing unreleased changes |
| `sha-<commit>` | every push to `main` | Reproducing a specific build |

Images are multi-arch (amd64 and arm64), so they run natively on Apple Silicon. nginx serves them
with SPA deep-link fallback, real 404s for missing `/api/*` files, and long-term caching for
fingerprinted assets.

Build and run locally:

```bash
npm run docker:build    # → qa-playground:local
npm run docker:run      # → http://localhost:8080
```

## Releasing a new version

1. Bump `version` in `package.json` (semver; contract changes from [TESTING.md](TESTING.md) mean a new minor or major).
2. Commit, then tag and push:
   ```bash
   git tag v1.1.0 && git push origin main --tags
   ```
3. The `Docker image` workflow checks that the tag matches `package.json`, smoke-tests the image and publishes it.
4. In each test repository, bump the pinned image tag in a pull request.
