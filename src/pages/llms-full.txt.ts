// Every published post as plain markdown in one file, for AI assistants that want full context.
import { site } from '../site.config';
import { absolute, postPath, publishedPosts } from '../lib/seo';
import { postMarkdown } from '../lib/markdown';

export async function GET() {
  const posts = (await publishedPosts()).filter((p) => !p.data.noindex);
  const body = [`# ${site.name} — all writing`, '', `> ${site.description}`, '', `Source: ${site.url}`, '']
    .concat(posts.map((p) => postMarkdown(p) + `\n\nURL: ${absolute(postPath(p))}\n\n---\n`))
    .join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
