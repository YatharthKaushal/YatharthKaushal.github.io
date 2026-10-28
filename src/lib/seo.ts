import { getCollection, type CollectionEntry } from 'astro:content';
import { site, profiles } from '../site.config';

type Post = CollectionEntry<'blog'>;

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  published?: Date;
  modified?: Date;
  tags?: string[];
  jsonLd?: object;
}

export const absolute = (path: string) => new URL(path, site.url).toString();
export const postPath = (post: Post) => `/blog/${post.id}/`;

/** Markdown → plain text, good enough for excerpts and word counts. */
export function plainText(md = ''): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First paragraph of prose, trimmed to ~155 chars on a word boundary. */
export function excerpt(md = '', max = 155): string {
  const firstPara = (md.split(/\n\s*\n/).find((p) => /^[^#>`\-*|!\s]/.test(p.trim())) ?? md).trim();
  const text = plainText(firstPara);
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).replace(/[,.;:]$/, '') + '…';
}

export function wordCount(md = ''): number {
  return plainText(md).split(' ').filter(Boolean).length;
}

export const readingMinutes = (md = '') => Math.max(1, Math.round(wordCount(md) / 220));

export const postDescription = (post: Post) => post.data.description ?? excerpt(post.body);

export const ogImageFor = (post: Post) => post.data.cover ?? `/og/blog/${post.id}.png`;

/* ---------- JSON-LD ---------- */

export const personLd = () => ({
  '@type': 'Person',
  '@id': absolute('/#person'),
  name: site.author.name,
  url: site.url,
  jobTitle: site.author.jobTitle,
  worksFor: { '@type': 'Organization', name: site.author.worksFor.name, url: site.author.worksFor.url },
  email: `mailto:${site.author.email}`,
  sameAs: profiles,
  knowsAbout: site.author.knowsAbout,
});

export const websiteLd = () => ({
  '@type': 'WebSite',
  '@id': absolute('/#website'),
  url: site.url,
  name: site.title,
  description: site.description,
  inLanguage: 'en',
  author: { '@id': absolute('/#person') },
});

export function homeLd(posts: Post[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personLd(),
      websiteLd(),
      {
        '@type': 'ProfilePage',
        '@id': absolute('/#profile'),
        url: site.url,
        name: site.title,
        isPartOf: { '@id': absolute('/#website') },
        mainEntity: { '@id': absolute('/#person') },
        hasPart: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.data.title, url: absolute(postPath(p)) })),
      },
    ],
  };
}

export function postLd(post: Post) {
  const url = absolute(postPath(post));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: url,
        url,
        headline: post.data.title,
        description: postDescription(post),
        image: absolute(ogImageFor(post)),
        datePublished: post.data.date.toISOString(),
        dateModified: (post.data.updated ?? post.data.date).toISOString(),
        keywords: post.data.tags.join(', ') || undefined,
        wordCount: wordCount(post.body),
        timeRequired: `PT${readingMinutes(post.body)}M`,
        inLanguage: 'en',
        author: { '@id': absolute('/#person') },
        publisher: { '@id': absolute('/#person') },
        isPartOf: { '@id': absolute('/#website') },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.url + '/' },
          { '@type': 'ListItem', position: 2, name: post.data.title, item: url },
        ],
      },
      personLd(),
      websiteLd(),
    ],
  };
}

/** All published posts, newest first. */
export async function publishedPosts() {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}
