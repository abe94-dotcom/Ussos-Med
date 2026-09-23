import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set PUBLIC_SITE_URL in deployment if the production domain changes.
  site: process.env.PUBLIC_SITE_URL || 'https://ussusmed.com',
  trailingSlash: 'always',
  output: 'static',
  redirects: {
    '/': { destination: '/en/', status: 301 },
    '/about/': { destination: '/en/about/', status: 301 },
    '/privacy/': { destination: '/en/privacy/', status: 301 },
    '/terms/': { destination: '/en/terms/', status: 301 },
    '/quote/': { destination: '/en/quote/', status: 301 },
    '/products/': { destination: '/en/products/', status: 301 },
    '/products/sis-scanbody-ti/': { destination: '/en/products/sis-scanbody-ti/', status: 301 },
    '/products/sis-smart-tibase-engaging/': { destination: '/en/products/sis-smart-tibase-engaging/', status: 301 },
    '/products/intraoral-scanner-v3-pro/': { destination: '/en/products/intraoral-scanner-v3-pro/', status: 301 },
    '/products/nitrile-exam-gloves-m-200/': { destination: '/en/products/nitrile-exam-gloves-m-200/', status: 301 },
    '/products/self-ligating-brackets/': { destination: '/en/products/self-ligating-brackets/', status: 301 },
    '/products/cad-cam-milling-block/': { destination: '/en/products/cad-cam-milling-block/', status: 301 },
  },
  srcDir: './astro',
  publicDir: './public',
});
