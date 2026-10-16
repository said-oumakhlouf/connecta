import type { Metadata, MetadataRoute } from 'next';

/**
 * SEO configuration read at build time (static export). Indexing is opt-in:
 * while the shop runs in Stripe TEST mode every page stays out of search engines
 * unless NEXT_PUBLIC_ALLOW_INDEXING=true AND a public NEXT_PUBLIC_SITE_URL are set.
 */
export type SeoEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_ALLOW_INDEXING?: string;
};

const defaultEnv = (): SeoEnv => ({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING,
});

/** Public pages that may be indexed once the shop opens, with their sitemap priority. */
export const PUBLIC_PAGES = [
  { path: '/', priority: 1 },
  { path: '/boutique', priority: 0.9 },
  { path: '/produit/hoco-ew75', priority: 0.8 },
] as const;

/** Private or transactional pages: never indexed, whatever the configuration. */
export const PRIVATE_PATHS = ['/admin', '/compte', '/paiement'] as const;

/** Absolute https origin without trailing slash, or null when missing or invalid. */
export function getSiteUrl(env: SeoEnv = defaultEnv()): string | null {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isIndexingAllowed(env: SeoEnv = defaultEnv()): boolean {
  return env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' && getSiteUrl(env) !== null;
}

export function absoluteUrl(path: string, env: SeoEnv = defaultEnv()): string | null {
  const base = getSiteUrl(env);
  return base ? `${base}${path === '/' ? '/' : path}` : null;
}

/**
 * Metadata for a public page: unique title and description, canonical URL when the
 * public origin is known, and noindex while indexing is not explicitly allowed.
 */
export function publicPageMetadata(
  { path, title, description }: { path: string; title: string; description: string },
  env: SeoEnv = defaultEnv(),
): Metadata {
  const siteUrl = getSiteUrl(env);
  const indexable = isIndexingAllowed(env);
  return {
    title,
    description,
    ...(siteUrl ? { alternates: { canonical: path } } : {}),
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: 'CONNECTA',
      title,
      description,
      ...(siteUrl ? { url: path } : {}),
    },
  };
}

/** robots.txt: everything disallowed during the test phase; private pages always excluded. */
export function getRobots(env: SeoEnv = defaultEnv()): MetadataRoute.Robots {
  if (!isIndexingAllowed(env)) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: [...PRIVATE_PATHS] }],
    sitemap: absoluteUrl('/sitemap.xml', env) ?? undefined,
  };
}

/** Sitemap of public pages only; empty while indexing is not allowed. */
export function getSitemap(env: SeoEnv = defaultEnv()): MetadataRoute.Sitemap {
  if (!isIndexingAllowed(env)) return [];
  return PUBLIC_PAGES.map(({ path, priority }) => ({
    url: absoluteUrl(path, env)!,
    changeFrequency: 'weekly' as const,
    priority,
  }));
}

/** Organization + WebSite structured data: factual identity only, emitted when the origin is known. */
export function getSiteJsonLd(env: SeoEnv = defaultEnv()) {
  const base = getSiteUrl(env);
  if (!base) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: 'CONNECTA',
        url: `${base}/`,
        logo: `${base}/connecta-logo-blue.svg`,
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: 'CONNECTA',
        url: `${base}/`,
        inLanguage: 'fr-FR',
        publisher: { '@id': `${base}/#organization` },
      },
    ],
  };
}
