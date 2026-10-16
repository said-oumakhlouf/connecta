import type { MetadataRoute } from 'next';
import { getRobots } from '@/lib/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return getRobots();
}
