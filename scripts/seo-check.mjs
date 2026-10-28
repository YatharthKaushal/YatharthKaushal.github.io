// Post-build SEO/GEO lint. Runs after `astro build`; errors fail the build, warnings are advisory.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SKIP = ['admin/'];

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const attr = (html, re) => html.match(re)?.[1]?.trim();
const meta = (html, key) =>
  attr(html, new RegExp(`<meta[^>]+(?:name|property)="${key}"[^>]+content="([^"]*)"`, 'i'));
const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

let placeholderDomain = false;
let errors = 0;
let warnings = 0;
const report = [];

for (const file of walk(DIST)) {
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '');
  if (SKIP.some((s) => page.startsWith('/' + s))) continue;
  const html = readFileSync(file, 'utf8');
  const issues = [];
  const err = (m) => (issues.push(`  ✗ ${m}`), errors++);
  const warn = (m) => (issues.push(`  ! ${m}`), warnings++);

  const title = decode(attr(html, /<title>([^<]*)<\/title>/i));
  if (!title) err('missing <title>');
  else if (title.length > 65) warn(`title is ${title.length} chars (aim ≤ 60): "${title}"`);

  const desc = decode(meta(html, 'description'));
  if (!desc) err('missing meta description');
  else if (desc.length < 50 || desc.length > 160) warn(`description is ${desc.length} chars (aim 70–160)`);

  const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
  if (!canonical) err('missing canonical URL');
  else if (!/^https?:\/\//.test(canonical)) err('canonical URL is not absolute');
  if (canonical?.includes('example.com')) placeholderDomain = true;

  const h1s = html.match(/<h1[\s>]/gi)?.length ?? 0;
  if (h1s !== 1) err(`expected exactly one <h1>, found ${h1s}`);

  const ogImage = meta(html, 'og:image');
  if (!ogImage) err('missing og:image');
  else {
    const local = join(DIST, new URL(ogImage).pathname);
    if (!ogImage.includes('example.com') && !existsSync(local)) warn(`og:image not found in build: ${ogImage}`);
    if (ogImage.includes('example.com') && !existsSync(local)) err(`og:image file missing: ${local}`);
  }

  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) warn('no JSON-LD structured data');
  for (const [, json] of ld) {
    try {
      JSON.parse(json);
    } catch {
      err('invalid JSON-LD');
    }
  }

  for (const [img] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]+"/i.test(img)) warn(`image without alt text: ${img.slice(0, 80)}…`);
  }

  if (issues.length) report.push(`${page}\n${issues.join('\n')}`);
}

if (placeholderDomain) {
  console.log('\n! Site URL is still example.com — set `url` in src/site.config.ts before deploying.');
  warnings++;
}
if (report.length) console.log('\nSEO check\n' + report.join('\n') + '\n');
console.log(`SEO check: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
