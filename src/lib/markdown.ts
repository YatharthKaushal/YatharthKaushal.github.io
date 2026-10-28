import type { CollectionEntry } from 'astro:content';
import { site } from '../site.config';
import { absolute, postDescription, postPath } from './seo';

/** A post as clean, self-describing markdown (no frontmatter), for /blog/<slug>.md and llms-full.txt. */
export function postMarkdown(post: CollectionEntry<'blog'>): string {
  const { title, date, updated, tags } = post.data;
  const meta = [
    `Author: ${site.author.name}`,
    `Published: ${date.toISOString().slice(0, 10)}`,
    updated && `Updated: ${updated.toISOString().slice(0, 10)}`,
    tags.length > 0 && `Tags: ${tags.join(', ')}`,
    `Canonical: ${post.data.canonical ?? absolute(postPath(post))}`,
  ].filter(Boolean);
  return [`# ${title}`, '', `> ${postDescription(post)}`, '', ...meta, '', (post.body ?? '').trim()].join('\n');
}
