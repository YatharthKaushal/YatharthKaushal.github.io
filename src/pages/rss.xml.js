import rss from '@astrojs/rss';
import { site } from '../site.config';
import { postDescription, postPath, publishedPosts } from '../lib/seo';

export async function GET(context) {
  const posts = (await publishedPosts()).filter((p) => !p.data.noindex);
  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    customData: `<language>en</language><managingEditor>${site.author.email} (${site.author.name})</managingEditor>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: postDescription(p),
      pubDate: p.data.date,
      link: postPath(p),
      categories: p.data.tags,
      author: `${site.author.email} (${site.author.name})`,
    })),
  });
}
