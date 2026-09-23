# USSUS Med

SEO-first dental supplies storefront built with Astro. Astro compiles the pages to static HTML, while small browser-side scripts handle the menu, order-list feedback, and local currency display.

## Run locally

```bash
npm install
npm run dev
```

## Build for deployment

```bash
npm run build
```

The deployable site is generated in `dist/`. Product prices use AED as their source currency; the browser can display the configured regional currencies for reference, but the final Zoho invoice should remain in AED.

## Public URL policy

The only indexable website URLs are prefixed with a language:

- English: `/en/` and `/en/products/.../`
- UAE Arabic: `/ar/` and `/ar/products/.../`

Each English and Arabic equivalent declares itself as canonical and points to the other version with `hreflang` (`en` and `ar-AE`). The sitemap contains only indexable pages and repeats those language relationships for crawlers. Never add unprefixed public pages; add the page in both locale routes instead.

Unprefixed legacy paths redirect to their English equivalents in `astro.config.mjs`. Configure the production host to honour these as HTTP 301 redirects (including the preferred hostname, `https`, and trailing slash). The static build contains a noindex fallback redirect page for hosts that cannot send HTTP redirects.
Ussos Med e-commerce and informative and catalogue website


## Quotation workflow

Product options and quantities are saved in the browser under `ussus_quote_v1`. The `/en/quote/` and `/ar/quote/` pages support quantity changes, removal, item subtotals and an email request preview. Contact details are not saved in local storage. Requests are prepared locally; the visitor must send the email using their own email service. Copy and text-download options are available when email-app handoff is unavailable. No server-side submission or delivery confirmation is configured.

AED is the billing currency. Other currencies use fixed reference conversions and are explicitly labelled estimates. Availability, compatibility, tax, shipping and delivery timing require confirmation in the quotation. Replace these statements with verified operational information when available.
