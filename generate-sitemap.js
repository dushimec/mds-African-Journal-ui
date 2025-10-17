import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://www.jaedp.org';

// List of public routes
const routes = [
  '/',
  '/about',
  '/journal',
  '/editorial-board',
  '/author-page',
  '/archive',
  '/submission',
  '/contact',
  '/login',
];

const today = new Date().toISOString().split('T')[0];

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';

routes.forEach((route) => {
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}${route}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += `    <priority>${route === '/' ? 1.0 : 0.8}</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>\n';

fs.writeFileSync(path.resolve('./public/sitemap.xml'), xml, { encoding: 'utf8' });
console.log('✅ sitemap.xml generated successfully!');
