import assert from 'node:assert/strict';
import test from 'node:test';
import { changeCartLine, getCartSuggestions, getMultiCartPrice } from '../lib/multi-cart';
import type { ApiProduct } from '../lib/shop-api';

const hoco: ApiProduct = { id: 1, name: 'Hoco EW75', slug: 'hoco-ew75', price: 3500, duoPrice: 6000, stock: 20, active: true };
const cable: ApiProduct = { id: 2, name: 'CONNECTA Câble USB-C (TEST)', slug: 'connecta-cable-usb-c-test', price: 990, duoPrice: null, stock: 20, active: true };
const charger: ApiProduct = { id: 3, name: 'CONNECTA Chargeur 20W (TEST)', slug: 'connecta-chargeur-20w-test', price: 1990, duoPrice: null, stock: 15, active: true };
const catalog = [hoco, charger, cable];

test('suggests accessories absent from a lead-product basket, accessories first, at most two', () => {
  const ids = getCartSuggestions(catalog, [{ productId: 1, quantity: 1 }]).map(p => p.id);
  assert.deepEqual(ids, [2, 3]);
});

test('never suggests a product already in the basket and falls back to the lead product', () => {
  const ids = getCartSuggestions(catalog, [{ productId: 2, quantity: 1 }]).map(p => p.id);
  assert.deepEqual(ids, [3, 1]);
  assert.deepEqual(getCartSuggestions(catalog, [{ productId: 2, quantity: 1 }], { max: 1 }).map(p => p.id), [3]);
});

test('inactive and sold-out products are never suggested', () => {
  const live = [hoco, { ...cable, active: false }, { ...charger, stock: 0 }];
  assert.deepEqual(getCartSuggestions(live, [{ productId: 1, quantity: 1 }]), []);
});

test('no suggestion for an empty basket or once the basket is reserved for payment', () => {
  assert.deepEqual(getCartSuggestions(catalog, []), []);
  assert.deepEqual(getCartSuggestions(catalog, [{ productId: 1, quantity: 1 }], { reserved: true }), []);
});

test('suggestions return live API products unchanged (prices and stock are never rewritten)', () => {
  const [first] = getCartSuggestions(catalog, [{ productId: 1, quantity: 1 }]);
  assert.equal(first, cable);
});

test('adding a suggestion keeps the existing Duo calculation intact', () => {
  let lines = changeCartLine([], hoco, 2);
  const before = getMultiCartPrice(catalog, lines);
  const [suggestion] = getCartSuggestions(catalog, lines);
  lines = changeCartLine(lines, suggestion, 1);
  const after = getMultiCartPrice(catalog, lines);
  assert.equal(after.discount, before.discount);
  assert.equal(after.total, before.total + suggestion.price);
});
