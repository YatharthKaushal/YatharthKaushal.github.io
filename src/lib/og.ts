// Renders 1200×630 share images (Open Graph / X cards) at build time.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '../site.config';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 700) =>
  readFileSync(require.resolve(`@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff`));
const fonts = [
  { name: 'JetBrains Mono', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: font(700), weight: 700 as const, style: 'normal' as const },
];

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children: Array.isArray(children) ? children.filter(Boolean) : children },
});

interface OgInput {
  title: string;
  /** Small line under the title, e.g. date · reading time. */
  meta?: string;
  tags?: string[];
}

export async function renderOg({ title, meta, tags = [] }: OgInput): Promise<Buffer> {
  const titleSize = title.length > 70 ? 52 : title.length > 40 ? 62 : 72;

  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundImage: 'radial-gradient(circle at 0% 0%, #2a2a2a 0%, #141414 45%, #0a0a0a 100%)',
      color: '#ededed',
      fontFamily: 'JetBrains Mono',
    },
    [
      h('div', { display: 'flex', fontSize: 34, fontWeight: 700 }, 'yk_'),
      h('div', { display: 'flex', flexDirection: 'column', gap: 24 }, [
        h('div', { display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }, title),
        meta ? h('div', { display: 'flex', fontSize: 26, color: '#8f8f8f' }, meta) : null,
      ]),
      h('div', { display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#8f8f8f' }, [
        h('div', { display: 'flex' }, `${site.name} · ${site.signature}`),
        h('div', { display: 'flex', gap: 16 }, tags.slice(0, 3).map((t) => h('div', { display: 'flex' }, `#${t}`))),
      ]),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg).render().asPng();
}

export const pngResponse = (png: Buffer) =>
  new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
