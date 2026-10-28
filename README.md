# Yatharth — portfolio

Single-page site with a blog. Astro (static) + Decap CMS.

## Run

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

## Edit your info

`src/site.config.ts` holds your name, intro, and links. Colors are in `src/styles/global.css` (`:root`).

## Writing posts

**Option 1: Markdown.** Add a file to `src/content/blog/`, e.g. `my-post.md`:

```md
---
title: My post
description: One-line summary shown on the homepage.
date: 2026-10-28
tags: [networking]
draft: false
---

Body in markdown...
```

The filename becomes the URL: `/blog/my-post/`. Posts with `draft: true` are hidden.

**Option 2: Rich text editor (locally).**

```sh
npm run cms        # terminal 1: local CMS backend
npm run dev        # terminal 2
```

Open http://localhost:4321/admin/. The editor has a Rich Text / Markdown toggle. Saving writes the `.md` file into `src/content/blog/`. Images go to `public/images/`.

**Option 3: Rich text editor (live site).** Push the repo to GitHub and set `backend.repo` in `public/admin/config.yml`. Then deploy:
- **Netlify** (easiest): connect the repo, then enable Identity + Git Gateway, or use GitHub OAuth under Site settings → Access control → OAuth. `/admin` on the live site will commit posts to the repo, and Netlify rebuilds automatically.
- Other hosts (Vercel, Cloudflare Pages) need a small GitHub OAuth proxy. See the Decap docs: https://decapcms.org/docs/github-backend/

## SEO / GEO pipeline

Everything is generated at build time from each post's frontmatter. You only write the post.

| Frontmatter | Used for |
|---|---|
| `title` | `<title>`, OG/X cards, JSON-LD headline, share image. Keep ≤ 60 chars. |
| `description` | Meta description, cards, RSS, llms.txt. 70–160 chars. Optional: falls back to the first paragraph. |
| `date` / `updated` | `datePublished` / `dateModified`, sitemap `lastmod`, the "updated" label. |
| `tags` | Keywords, `article:tag`, RSS categories, share image. |
| `cover` / `coverAlt` | Custom 1200×630 share image. Optional: one is generated otherwise. |
| `canonical` | Original URL if the post was first published elsewhere (e.g. cross-posts). |
| `noindex` | Keeps a post out of search engines, llms.txt and RSS. It's still reachable by URL. |

**What gets generated:**

- **Every page:** title, description, canonical, robots, Open Graph and X/Twitter cards, and JSON-LD structured data. The homepage gets Person, WebSite and ProfilePage; posts get BlogPosting and BreadcrumbList. All of this lives in `src/components/Seo.astro` and `src/lib/seo.ts`.
- **`/og/blog/<slug>.png`:** a share image per post, rendered in the site's style (`src/lib/og.ts`).
- **`/sitemap-index.xml`:** includes `lastmod` dates.
- **`/rss.xml`:** the RSS feed.
- **`/robots.txt`:** explicitly allows search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot and others), and blocks `/admin`.
- **GEO, for AI search:**
  - `/llms.txt`: an index of the site for AI assistants.
  - `/llms-full.txt`: every post as plain markdown.
  - `/blog/<slug>.md`: the raw markdown of each post.
- **SEO check:** `npm run build` ends with `scripts/seo-check.mjs`.
  - It **fails the build** on a missing title, description or canonical, missing share images, broken JSON-LD, or anything other than exactly one `<h1>` per page.
  - It **warns** about titles or descriptions of the wrong length and images without alt text.
  - Run it alone with `npm run seo:check`.

Author identity (name, job title, profiles, topics) lives in `src/site.config.ts` and feeds all of the above.

## Deploying

Live at https://yatharthkaushal.github.io. Every push to `main` builds and deploys via GitHub Actions (`.github/workflows/deploy.yml`); the build fails if the SEO check finds errors.

To use a custom domain later: add it under the repo's Settings → Pages, then set `url` in `src/site.config.ts` to match.
