import { products } from '../data/products.js';

export function GET({ site }) {
  const baseUrl = site || new URL('https://ussusmed.com');
  const indexablePaths = [
    '/',
    '/about/',
    '/products/',
    ...products.map((product) => `/products/${product.slug}/`),
  ];
  const urls = indexablePaths.flatMap((path) => ['en', 'ar'].map((language) => {
    const localizedPath = `/${language}${path}`;
    const alternateLanguage = language === 'en' ? 'ar-AE' : 'en';
    const alternatePath = `/${language === 'en' ? 'ar' : 'en'}${path}`;
    return `  <url><loc>${new URL(localizedPath, baseUrl).href}</loc><xhtml:link rel="alternate" hreflang="${language === 'ar' ? 'ar-AE' : 'en'}" href="${new URL(localizedPath, baseUrl).href}"/><xhtml:link rel="alternate" hreflang="${alternateLanguage}" href="${new URL(alternatePath, baseUrl).href}"/><xhtml:link rel="alternate" hreflang="x-default" href="${new URL(`/en${path}`, baseUrl).href}"/></url>`;
  }))
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
