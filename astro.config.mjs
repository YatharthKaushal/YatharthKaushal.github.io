// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.config.ts';

const SITE = site.url;

// Last-modified date per post for the sitemap, read from frontmatter (`updated` falls back to `date`).
const BLOG_DIR = './src/content/blog';
const lastmod = new Map(
  readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`${BLOG_DIR}/${f}`, 'utf8');
      const field = (k) => src.match(new RegExp(`^${k}:\\s*['"]?([^'"\\n]+)`, 'm'))?.[1];
      return [`${SITE}/blog/${f.replace(/\.md$/, '')}/`, field('updated') ?? field('date')];
    }),
);

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin'),
      serialize(item) {
        const date = lastmod.get(item.url);
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
