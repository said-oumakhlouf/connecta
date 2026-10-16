import assert from 'node:assert/strict';
import test from 'node:test';
import { orderStorefrontProducts } from '../lib/catalog-display';

test('lead product appears before complementary accessories', () => {
  const original = [
    { id: 2, slug: 'connecta-chargeur-test' },
    { id: 3, slug: 'connecta-cable-test' },
    { id: 1, slug: 'hoco-ew75' },
  ];
  const sorted = orderStorefrontProducts(original);
  assert.deepEqual(sorted.map(p => p.id), [1, 3, 2]);
  assert.deepEqual(original.map(p => p.id), [2, 3, 1]);
});

test('other products retain relative order and catalogue is never mutated', () => {
  const original = [{ slug: 'autre-2' }, { slug: 'autre-1' }];
  assert.deepEqual(orderStorefrontProducts(original), original);
  assert.notEqual(orderStorefrontProducts(original), original);
});
