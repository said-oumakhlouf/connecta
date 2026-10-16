import type { MetadataRoute } from 'next';
import { getSitemap } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemap();
}
