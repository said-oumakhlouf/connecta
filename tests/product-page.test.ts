import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOW_STOCK_THRESHOLD,
  canOrderUnits,
  getOfferSavings,
  getOrderCta,
  getProductJsonLd,
  getProductSpecs,
  getStockState,
  isProductPagePath,
  serializeJsonLd,
} from '../lib/product-page';
import { PRODUCTS } from '../data/products';

const live = (stock: number, active = true) => ({ loading: false, error: null, product: { stock, active } });

test('stock state follows the live API product only', () => {
  assert.deepEqual(getStockState({ loading: true, error: null, product: null }), { kind: 'loading' });
  assert.equal(getStockState({ loading: false, error: 'API indisponible', product: null }).kind, 'unavailable');
  assert.equal(getStockState(live(12, false)).kind, 'unavailable');
  assert.deepEqual(getStockState(live(0)), { kind: 'out' });
  assert.deepEqual(getStockState(live(-3)), { kind: 'out' });
  assert.deepEqual(getStockState(live(LOW_STOCK_THRESHOLD)), { kind: 'low', stock: LOW_STOCK_THRESHOLD });
  assert.deepEqual(getStockState(live(LOW_STOCK_THRESHOLD + 1)), { kind: 'available', stock: LOW_STOCK_THRESHOLD + 1 });
  // A background refresh keeps showing the last known product.
  assert.equal(getStockState({ loading: true, error: null, product: { stock: 8, active: true } }).kind, 'available');
});

test('offers are orderable only when enough units are in stock', () => {
  assert.equal(canOrderUnits(getStockState(live(1)), 1), true);
  assert.equal(canOrderUnits(getStockState(live(1)), 2), false);
  assert.equal(canOrderUnits(getStockState(live(2)), 2), true);
  assert.equal(canOrderUnits(getStockState(live(0)), 1), false);
  assert.equal(canOrderUnits({ kind: 'loading' }, 1), false);
});

test('Duo savings are computed in cents from live prices', () => {
  assert.deepEqual(getOfferSavings(35, 60, 2), { amount: 1000, percent: 14, perUnit: 3000 });
  assert.deepEqual(getOfferSavings(34.99, 59.99, 2), { amount: 999, percent: 14, perUnit: 3000 });
  assert.equal(getOfferSavings(35, 70, 2).amount, 0);
  assert.equal(getOfferSavings(35, 80, 2).amount, 0);
  assert.equal(getOfferSavings(35, 35, 1).amount, 0);
});

test('technical sheet only uses stored specifications', () => {
  const values = getProductSpecs().map(({ value }) => value).join(' ');
  for (const spec of [PRODUCTS.ew75.bluetoothVersion, PRODUCTS.ew75.frequency, PRODUCTS.ew75.range, PRODUCTS.ew75.color])
    assert.ok(values.includes(spec));
  assert.equal(getProductSpecs().length, 8);
});

test('JSON-LD never freezes price or stock and is safe to inline', () => {
  const ld = getProductJsonLd(['/images/a-1600.webp'], 'https://connecta.example/');
  assert.equal(ld['@type'], 'Product');
  assert.deepEqual(ld.image, ['https://connecta.example/images/a-1600.webp']);
  assert.equal(ld.url, 'https://connecta.example/produit/hoco-ew75');
  const json = serializeJsonLd(ld);
  assert.ok(!/"offers"|"price"|"availability"/.test(json));
  assert.ok(!serializeJsonLd({ x: '</script><script>' }).includes('<'));
  assert.equal('url' in getProductJsonLd(['/a.webp']), false);
});

test('order CTA blocks loading, API errors, inactive products and insufficient stock', () => {
  const cta = (stock: ReturnType<typeof getStockState>, quantity = 1, isSubmitting = false, productLoaded = true) =>
    getOrderCta({ stock, quantity, isSubmitting, productLoaded });

  const loading = cta(getStockState({ loading: true, error: null, product: null }), 1, false, false);
  assert.deepEqual([loading.status, loading.disabled, loading.priceValidated], ['checking', true, false]);

  const failed = cta(getStockState({ loading: false, error: 'API indisponible', product: null }), 1, false, false);
  assert.deepEqual([failed.status, failed.disabled, failed.priceValidated, failed.hint], ['unavailable', true, false, 'API indisponible']);

  assert.equal(cta(getStockState(live(9, false))).status, 'unavailable');
  assert.deepEqual([cta(getStockState(live(0))).status, cta(getStockState(live(0))).hint], ['unavailable', 'Rupture de stock']);

  const duoWithOne = cta(getStockState(live(1)), 2);
  assert.deepEqual([duoWithOne.status, duoWithOne.disabled], ['insufficient', true]);
  assert.deepEqual([cta(getStockState(live(1)), 1).status, cta(getStockState(live(1)), 1).disabled], ['ready', false]);
  assert.equal(cta(getStockState(live(2)), 2).disabled, false);

  const submitting = cta(getStockState(live(5)), 1, true);
  assert.deepEqual([submitting.status, submitting.disabled], ['submitting', true]);
});

test('mobile guards apply only to the product page path', () => {
  assert.equal(isProductPagePath('/produit/hoco-ew75'), true);
  assert.equal(isProductPagePath('/produit/hoco-ew75/'), true);
  for (const path of ['/', '/compte', '/produit', '/produit/hoco-ew75-x', null, undefined])
    assert.equal(isProductPagePath(path), false);
});
