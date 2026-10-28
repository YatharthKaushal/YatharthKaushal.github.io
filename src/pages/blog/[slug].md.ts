// Raw markdown version of each post (e.g. /blog/hello-world.md) — easy for LLMs and tools to read.
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { postMarkdown } from '../../lib/markdown';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.noindex);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(postMarkdown((props as { post: CollectionEntry<'blog'> }).post), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
