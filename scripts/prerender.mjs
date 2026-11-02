// Runs after `vite build`. Writes one HTML file per page so each URL ships with
// its own title, description, canonical link and business details before any
// JavaScript runs. Usage: node scripts/prerender.mjs [outDir]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGE_META, SERVICE_NAMES, TOWNS } from '../src/config/seo.js';

const ORIGIN = 'https://www.stagmobilervtech.com';
const out = process.argv[2] || 'dist';
const template = readFileSync(join(out, 'index.html'), 'utf8');

const attr = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const canonical = path => ORIGIN + path;

const business = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  '@id': `${ORIGIN}/#business`,
  name: 'Stag: Mobile RV Tech',
  description: PAGE_META['/'].description,
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/assets/logo/stag-emblem-600.png`,
  image: `${ORIGIN}/og-image.jpg`,
  telephone: '+1-501-466-7786',
  address: { '@type': 'PostalAddress', addressLocality: 'Beebe', addressRegion: 'AR', addressCountry: 'US' },
  areaServed: TOWNS.map(name => ({ '@type': 'City', name: `${name}, AR` })),
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  }],
  makesOffer: SERVICE_NAMES.map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
};

const NAV = [['/', 'Home'], ['/services', 'Services'], ['/coverage', 'Service area'], ['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy']];

function page(path, meta) {
  const url = canonical(path);
  const fallback = `<noscript>
    <h1>${attr(meta.heading)}</h1>
    <p>${attr(meta.description)}</p>
    <p>Call or text <a href="tel:+15014667786">(501) 466-7786</a>. Mon–Fri, 9 am – 5 pm.</p>
    <nav aria-label="Pages"><ul>${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>
  </noscript>`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${attr(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${attr(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${attr(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${attr(meta.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace('</head>', `  <link rel="canonical" href="${url}" />\n  <script type="application/ld+json">${JSON.stringify(business).replace(/</g, '\\u003c')}</script>\n</head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n  ${fallback}`);
}

for (const [path, meta] of Object.entries(PAGE_META)) {
  const dir = path === '/' ? out : join(out, path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(path, meta));
}

const urls = Object.keys(PAGE_META).map(path => `  <url><loc>${canonical(path)}</loc></url>`).join('\n');
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`Prerendered ${Object.keys(PAGE_META).length} pages to ${out}`);
