# Ojaly web app

Nuxt 3 + TypeScript + Tailwind + Pinia PWA for business owners and their customers.

## Run

```bash
# from repo root
pnpm install
cp .env.example .env
pnpm dev:web
```

- App: http://localhost:3100
- Production build: `pnpm --filter @ojaly/web-app build`
- Preview: `PORT=3100 node .output/server/index.mjs`
- Typecheck: `pnpm --filter @ojaly/web-app lint`

The API must be running (default `http://localhost:4100/api/v1`).

### Runtime config

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_API_BASE` | Backend API base URL |
| `NUXT_PUBLIC_APP_URL` | Public origin used in OG images/links |
| `NUXT_PUBLIC_ROOT_DOMAIN` | e.g. `ojaly.org` for subdomain routing |
| `NUXT_PUBLIC_ADMIN_URL` | admin console URL used by the impersonation exit banner |
| `NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | optional, exposed for future inline checkout |

## Architecture

```
Nuxt root
  api/
    base/BaseApi.ts         typed CRUD + blob downloads
    factories/              one factory per resource (products, orders, debts…)
    types/                  request/response contracts
  config/axios.ts           single axios instance, auth header, refresh interceptor,
                            network retry for GETs, normalised errors
  composables/              one per use case (useProducts, useCreateSale, useDebts…)
  stores/                   auth, business, cart, offline queue
  pages/                    route-level pages only
  components/
    ui/                     presentational, props-in/events-out
    layout/                 app shell, sidebar, top bar, mobile nav
    features/               dashboard, products, storefront, builder, charts
  utils/                    money, Lagos dates, NG phone, Zod schemas, image compression
  middleware/               auth guard
  plugins/                  axios, session hydration, theme, offline listeners
```

**Rules enforced in the code:** pages do not import axios or API factories; components never fetch; composables hold use-case state/actions; reusable UI components know nothing about domain data. TypeScript is strict and typechecked in CI.

## Important product flows

- **Marketing landing** `/`
- **Auth** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Dashboard** `/app` — onboarding checklist, profit, charts, insights.
- **Catalog & stock** `/app/products`, `/app/products/new`, `/app/products/:id`, `/app/stock`
- **Sales** `/app/sales`, `/app/sales/new`, `/app/sales/invoices`
- **Orders** `/app/orders`, `/app/orders/new`, `/app/orders/paste`, `/app/orders/:id`
- **Customers & debts** `/app/customers`, `/app/debts`
- **Expenses & reports** `/app/expenses`, `/app/reports`
- **Website builder** `/app/website`
- **Settings** `/app/settings?tab=business|profile|alerts|summaries|whatsapp|staff|billing|domain`
- **Help center & guided tours** `/app/help`
- **Refer & earn** `/app/affiliates`
- **Notifications & offline queue** `/app/notifications`, `/app/offline`
- **Storefront** `/s/{slug}`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/about`, `/contact`
- **Public documents/payment** `/receipt/:token`, `/invoice/:token`, `/order/:token`, `/pay/debt/:token`, `/pay/invoice/:token`, `/payment/callback`
- **Embed** `/embed/order?b={slug}` + `/embed/ojaly-widget.js`

## Storefront

- SSR with dynamic SEO/Open Graph tags for WhatsApp previews; Product/Store JSON-LD.
- Seven templates driven by JSON config: Lagos Pop, Market Bright, Editorial Green, Midnight Studio, Campus Ink, Sunset Grid, Soft Serve. All sections are shared components selected by config — never per-business markup.
- Rich media: hero video, banner, story image, lookbook gallery and multi-image products, with signed Cloudinary image/video uploads.
- Brand colour, logo, banner, tagline, sections order, socials, WhatsApp, SEO editable with live preview.
- Product/category search, variant selection, cart and checkout.
- Checkout creates a pending order **and** offers the prefilled WhatsApp message; optional Paystack payment.
- Custom-domain host resolution is handled by `server/middleware/tenant-host.ts` (CNAME verification API).

## PWA & unreliable networks

- Installable manifest + auto-updating service worker.
- Precache of app shell/assets; NetworkFirst page caching; offline fallback page.
- Sale and expense submissions that fail while offline are persisted in `localStorage` (`useOfflineStore`), retried on `online`, and failures remain visible with error details.
- Images are compressed client-side (Canvas → WebP) before signed Cloudinary uploads.

## Design system

Design tokens in `tailwind.config.ts`; CSS variables for light/dark in `assets/css/main.css`. Brand orange `#FF5A1F`, forest ink `#06231A`, accent `#F5D547`, cream `#FBF7EF`. Space Grotesk display + DM Sans UI. 44px minimum tap targets, visible focus rings, labelled controls, reduced-motion support, mobile-first layouts.

## Tests/build

```bash
pnpm --filter @ojaly/web-app lint
pnpm --filter @ojaly/web-app build
```

Manual smoke flows validated in development: login → dashboard → all modules, storefront product → cart → checkout, website builder live preview, PWA offline queue → reconnect sync, admin console reads/writes.
