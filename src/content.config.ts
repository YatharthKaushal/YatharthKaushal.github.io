import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Shown in search results and share cards. Aim for 70–160 chars; falls back to the first paragraph.
    description: z.string().optional(),
    date: z.coerce.date(),
    // Set when you meaningfully revise a post; feeds dateModified, sitemap lastmod and the "Updated" label.
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Custom share image (e.g. /images/foo.png, 1200×630). Otherwise one is generated.
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    // If this post was first published elsewhere, point to the original.
    canonical: z.string().url().optional(),
    // Keep out of search engines (still published).
    noindex: z.boolean().default(false),
  }),
});

export const collections = { blog };
