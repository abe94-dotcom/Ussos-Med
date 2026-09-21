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
Ussos Med e-commerce and informative and catalogue website
