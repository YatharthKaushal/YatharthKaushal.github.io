import { site } from '../../site.config';
import { renderOg, pngResponse } from '../../lib/og';

export async function GET() {
  return pngResponse(await renderOg({ title: site.name, meta: site.description }));
}
