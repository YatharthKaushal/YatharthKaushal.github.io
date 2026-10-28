import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderOg, pngResponse } from '../../../lib/og';
import { readingMinutes } from '../../../lib/seo';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: CollectionEntry<'blog'> };
  const date = post.data.date.toISOString().slice(0, 10);
  return pngResponse(
    await renderOg({
      title: post.data.title,
      meta: `${date} · ${readingMinutes(post.body)} min read`,
      tags: post.data.tags,
    }),
  );
};
