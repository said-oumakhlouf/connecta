import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { createShopApi, isReservationState, ShopApiError } from '../lib/shop-api';
import { getMultiCartPrice, getReservedTotals } from '../lib/multi-cart';
import {
  clearFinalizedCheckout,
  isDefinitiveCheckoutRefusal,
  readCheckoutKey,
  releaseCheckoutKeepCart,
} from '../lib/checkout-storage';

const key = '3f2b8c1e-5d4a-4b6c-9e7f-1a2b3c4d5e6f';
const pending = {
  orderId: 'a0b1c2d3-0000-4000-8000-000000000001',
  total: 36590,
  shippingFee: 590,
  paymentStatus: 'UNPAID',
  expiresAt: '2026-10-14T13:30:00.000Z',
  testMode: true,
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => void values.set(name, value),
    removeItem: (name: string) => void values.delete(name),
  };
}

test('12 reserved Hoco EW75 keep 360 € of articles and 5,90 € of delivery', () => {
  const hoco = { id: 1, name: 'Hoco EW75', slug: 'hoco-ew75', price: 3000, duoPrice: 6000, stock: 0, active: true };
  const lines = [{ productId: 1, quantity: 12 }];
  // Stock already deducted by the reservation: the subtotal must not drop to 0.
  const priced = getMultiCartPrice([hoco], lines, true);
  assert.deepEqual(priced, { count: 12, total: 36000, discount: 0, valid: true });
  assert.deepEqual(getReservedTotals(priced.total, pending), {
    itemsTotal: 36000,
    shippingFee: 590,
    total: 36590,
  });
  // While the server amounts load, the articles stay visible and nothing is guessed.
  assert.deepEqual(getReservedTotals(priced.total, null), {
    itemsTotal: 36000,
    shippingFee: null,
    total: null,
  });
});

test('reserved delivery comes from the order, not from the hidden address form', () => {
  // A Belgian order: the form would default to France (5,90 €) if it were used.
  assert.deepEqual(getReservedTotals(7000, { total: 7990, shippingFee: 990 }), {
    itemsTotal: 7000,
    shippingFee: 990,
    total: 7990,
  });
});

test('reservation routes send only the checkout key and accept only safe answers', async () => {
  const calls: Array<{ url: string; body: unknown; method?: string }> = [];
  const api = createShopApi('http://api.test', async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(String(options?.body)), method: options?.method });
    return json(String(url).endsWith('/resume')
      ? { ...pending, sessionId: 'cs_test_abc123', url: 'https://checkout.stripe.com/c/pay/cs_test_abc123' }
      : pending);
  });
  assert.equal((await api.reservationStatus(key)).total, 36590);
  assert.equal((await api.resumeReservation(key)).url, 'https://checkout.stripe.com/c/pay/cs_test_abc123');
  assert.equal((await api.cancelReservation(key)).paymentStatus, 'UNPAID');
  assert.deepEqual(calls, [
    { url: 'http://api.test/payments/reservation/status', body: { checkoutKey: key }, method: 'POST' },
    { url: 'http://api.test/payments/reservation/resume', body: { checkoutKey: key }, method: 'POST' },
    { url: 'http://api.test/payments/reservation/cancel', body: { checkoutKey: key }, method: 'POST' },
  ]);

  assert.equal(isReservationState(pending), true);
  for (const unsafe of [
    { ...pending, url: 'https://checkout.stripe.com/c/pay/cs_test_abc123' }, // page without session
    { ...pending, sessionId: 'cs_test_abc123', url: 'https://evil.example/pay' },
    { ...pending, sessionId: 'cs_live_abc123', url: 'https://checkout.stripe.com/c/pay/cs_live_abc123' },
    { ...pending, testMode: false },
    { ...pending, shippingFee: 99999 },
    { ...pending, paymentStatus: 'LEGACY' },
    { ...pending, shippingFee: undefined },
  ])
    assert.equal(isReservationState(unsafe), false);
});

test('reservation errors use customer wording, without technical details', async () => {
  for (const [status, expected] of [
    [404, 'Commande en attente introuvable.'],
    [409, 'Votre paiement est en cours de confirmation. Réessayez dans quelques instants.'],
    [429, 'Trop de demandes. Patientez quelques minutes avant de réessayer.'],
  ] as const) {
    const api = createShopApi('http://api.test', async () => json({ message: 'Stripe internal' }, status));
    await assert.rejects(api.cancelReservation(key), (error: unknown) =>
      error instanceof ShopApiError && error.status === status && error.message === expected &&
      !/stripe/i.test(error.message));
  }
});

test('only a stored UUID v4 is used as the reservation key', () => {
  assert.equal(readCheckoutKey(memoryStorage({ connectaCheckoutAttempt: JSON.stringify({ key, fingerprint: 'x' }) })), key);
  for (const raw of ['not json', 'null', JSON.stringify({ key: 'abc' }), JSON.stringify({ key: '00000000-0000-1000-8000-000000000000' })])
    assert.equal(readCheckoutKey(memoryStorage({ connectaCheckoutAttempt: raw })), null);
  assert.equal(readCheckoutKey(memoryStorage()), null);
});

test('an expired reservation unlocks the basket and keeps its articles; payment empties it', () => {
  const stored = () => memoryStorage({
    connectaCheckoutAttempt: JSON.stringify({ key }),
    connectaCheckoutSession: '{}',
    connectaCartDraft: JSON.stringify([{ productId: 1, quantity: 12 }]),
  });
  const expired = stored();
  releaseCheckoutKeepCart(expired);
  assert.deepEqual([...expired.values.keys()], ['connectaCartDraft']);

  const paid = stored();
  assert.equal(clearFinalizedCheckout(paid, 'PAID'), true);
  assert.equal(paid.values.size, 0);

  const unpaid = stored();
  assert.equal(clearFinalizedCheckout(unpaid, 'UNPAID'), false);
  assert.equal(unpaid.values.size, 3);
});

test('only refused requests unlock a basket; uncertain outcomes stay reserved', () => {
  for (const status of [400, 403, 404, 409, 429]) assert.equal(isDefinitiveCheckoutRefusal(status), true);
  for (const status of [0, 500, 502, 503]) assert.equal(isDefinitiveCheckoutRefusal(status), false);
});

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const withoutComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');

test('customer-facing shop screens never name the payment provider', () => {
  for (const path of [
    'app/boutique/page.tsx',
    'components/shop/CartDialog.tsx',
    'components/shop/ShopProvider.tsx',
    'components/shop/PaymentReturn.tsx',
    'components/product/ProductPage.tsx',
    'lib/shop-api.ts',
  ]) {
    const visible = withoutComments(source(path)).replace(/checkout\.stripe\.com/g, '');
    assert.doesNotMatch(visible, /stripe/i, path);
  }
});

test('a pending order shows its summary and two actions only, never the form again', () => {
  const cart = source('components/shop/CartDialog.tsx');
  // The checkout area (after the subtotal), not the per-line quantity label.
  const start = cart.indexOf('{reserved ? (', cart.indexOf('Sous-total des articles'));
  const otherwise = cart.indexOf('\n            ) : (', start);
  assert.ok(start > 0 && otherwise > start);
  const reservedBranch = cart.slice(start, otherwise);
  const formBranch = cart.slice(otherwise);
  assert.match(reservedBranch, /Reprendre le paiement/);
  assert.match(reservedBranch, /Annuler la réservation/);
  assert.match(reservedBranch, /Total à payer/);
  for (const field of ['<fieldset', '<ShippingFields', 'type="submit"', 'Passer au paiement', 'customer-name'])
    assert.equal(reservedBranch.includes(field), false, field);
  assert.match(formBranch, /<fieldset/);
  assert.match(formBranch, /Passer au paiement/);
  // Submitting is impossible while an order is pending.
  assert.match(cart, /if \(reserved\) return;/);
  assert.match(source('components/shop/ShopProvider.tsx'), /if \(hasCheckoutAttempt\) return;/);
});
