// llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI assistants and answer engines.
import { site, profiles } from '../site.config';
import { absolute, postDescription, publishedPosts } from '../lib/seo';

export async function GET() {
  const posts = (await publishedPosts()).filter((p) => !p.data.noindex);
  const body = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    site.intro,
    '',
    `Author: ${site.author.name} (${site.author.jobTitle}). Topics: ${site.author.knowsAbout.join(', ')}.`,
    '',
    '## Writing',
    '',
    ...posts.map(
      (p) => `- [${p.data.title}](${absolute(`/blog/${p.id}.md`)}): ${postDescription(p)} (${p.data.date.toISOString().slice(0, 10)})`,
    ),
    '',
    '## Profiles',
    '',
    ...profiles.map((u) => `- ${u}`),
    `- Email: ${site.author.email}`,
    '',
    '## Optional',
    '',
    `- [Full text of all posts](${absolute('/llms-full.txt')})`,
    `- [RSS feed](${absolute('/rss.xml')})`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
