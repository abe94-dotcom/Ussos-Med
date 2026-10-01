# USSUS Med

Dental supplies storefront built with Astro. English and Arabic catalogue pages remain public. Account holders can view AED prices, save a quote basket, and submit requests through Cloudflare Pages Functions and D1.

## Project layout

- `src/pages/` — English and Arabic routes, redirects, sitemap, and robots rules.
- `src/components/`, `src/layouts/`, `src/data/`, `src/scripts/`, `src/styles/` — site code and catalogue data.
- `public/images/` — images used by the live site.
- `docs/` — operational notes, including the [AdSense launch checklist](docs/adsense.md).

In the local workspace, a separate `project-files/` folder holds retired site art and marketing files. It is outside this Git repository and is not needed to build the site.

See [repository rules](AGENTS.md) for what belongs in Git and the checks to make before publishing.

The backend setup and remaining launch requirements are in [backend setup](docs/backend-setup.md). The staged commerce direction is in the [storefront plan](docs/commerce-roadmap.md).

## Run locally

```bash
npm ci
npm run dev
```

## Build for deployment

```bash
npm run build
```

The deployable site is generated in `dist/`. Product prices are stored in Postgres and read only after sign-in. AED is the display and billing currency.

Product names always use the English catalogue names in both languages. Arabic routes translate the surrounding interface, categories, and descriptions. Staff quotations and customer documents use English.

## Public URL policy

The only indexable website URLs are prefixed with a language:

- English: `/en/` and `/en/products/.../`
- UAE Arabic: `/ar/` and `/ar/products/.../`

Each English and Arabic equivalent declares itself as canonical and points to the other version with `hreflang` (`en` and `ar-AE`). The sitemap contains only indexable pages and repeats those language relationships for crawlers. Never add unprefixed public pages; add the page in both locale routes instead.

Unprefixed legacy paths redirect to their English equivalents in `astro.config.mjs`. Configure the production host to honour these as HTTP 301 redirects (including the preferred hostname, `https`, and trailing slash). The static build contains a noindex fallback redirect page for hosts that cannot send HTTP redirects.

## Quotation workflow

Visitors can browse without signing in. Account holders can view prices, add products to a persistent quote basket, and submit a quote request. Staff can review submitted requests and maintain quoted unit prices in the staff workspace. Account creation, prices, carts, and quote requests require a Cloudflare Pages deployment with a D1 database bound as `DB` and the schema in `migrations/`.

Sales contact: `sales@ussusmed.com`; WhatsApp: `+971 50 276 8276`. Availability, compatibility, tax, shipping, and delivery timing still require staff confirmation. Quote submission does not place an order or collect payment.
