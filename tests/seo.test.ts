import assert from 'node:assert/strict';
import test from 'node:test';
import {
  absoluteUrl,
  getRobots,
  getSiteJsonLd,
  getSiteUrl,
  getSitemap,
  isIndexingAllowed,
  PRIVATE_PATHS,
  publicPageMetadata,
} from '../lib/seo';

const open = { NEXT_PUBLIC_SITE_URL: 'https://connecta.example/', NEXT_PUBLIC_ALLOW_INDEXING: 'true' };
const testPhase = { NEXT_PUBLIC_SITE_URL: 'https://connecta.example' };

test('site URL is normalised to an https origin and rejects invalid values', () => {
  assert.equal(getSiteUrl(open), 'https://connecta.example');
  assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://connecta.example' }), null);
  assert.equal(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'pas une url' }), null);
  assert.equal(getSiteUrl({}), null);
  assert.equal(absoluteUrl('/boutique', open), 'https://connecta.example/boutique');
});

test('indexing is opt-in and needs both the flag and a public origin', () => {
  assert.equal(isIndexingAllowed({}), false);
  assert.equal(isIndexingAllowed(testPhase), false);
  assert.equal(isIndexingAllowed({ NEXT_PUBLIC_ALLOW_INDEXING: 'true' }), false);
  assert.equal(isIndexingAllowed(open), true);
});

test('test phase: robots.txt blocks everything and the sitemap is empty', () => {
  assert.deepEqual(getRobots(testPhase), { rules: [{ userAgent: '*', disallow: '/' }] });
  assert.deepEqual(getSitemap(testPhase), []);
});

test('open phase: private pages stay disallowed and only public pages are listed', () => {
  const robots = getRobots(open);
  const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;
  assert.deepEqual(rules.disallow, [...PRIVATE_PATHS]);
  assert.equal(robots.sitemap, 'https://connecta.example/sitemap.xml');
  const urls = getSitemap(open).map(entry => entry.url);
  assert.deepEqual(urls, [
    'https://connecta.example/',
    'https://connecta.example/boutique',
    'https://connecta.example/produit/hoco-ew75',
  ]);
  for (const path of PRIVATE_PATHS) assert.ok(!urls.some(url => url.includes(path)));
});

test('page metadata: canonical only with a known origin, noindex until opening', () => {
  const page = { path: '/boutique', title: 'Boutique', description: 'Tous les accessoires.' };
  const closed = publicPageMetadata(page, {});
  assert.equal(closed.alternates, undefined);
  assert.deepEqual(closed.robots, { index: false, follow: false });
  const live = publicPageMetadata(page, open);
  assert.deepEqual(live.alternates, { canonical: '/boutique' });
  assert.deepEqual(live.robots, { index: true, follow: true });
});

test('site structured data is factual and contains no ratings or reviews', () => {
  assert.equal(getSiteJsonLd({}), null);
  const json = JSON.stringify(getSiteJsonLd(open));
  assert.match(json, /"Organization"/);
  assert.doesNotMatch(json, /aggregateRating|review/i);
});
