import assert from 'node:assert/strict';
import test from 'node:test';
import { createShopApi } from '../lib/shop-api';
import { checkoutAttempt } from '../lib/checkout-attempt';

const checkout = {
  sessionId: 'cs_test_123abc',
  url: 'https://checkout.stripe.com/c/pay/cs_test_123abc',
  total: 6000,
  expiresAt: '2026-10-08T12:00:00Z',
  testMode: true,
};
const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });

test('checkout sends server-priced quantities and a stable retry key', async () => {
  const api = createShopApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/payments/checkout');
    assert.deepEqual(JSON.parse(String(options?.body)), {
      customerName: 'Test',
      customerEmail: 'test@example.com',
      items: [{ productId: 1, quantity: 2 }],
      checkoutKey: 'key',
    });
    return json(checkout);
  });
  assert.equal(
    (
      await api.checkout(
        { customerName: ' Test ', customerEmail: 'TEST@example.com' },
        1,
        2,
        'key',
      )
    ).total,
    6000,
  );
});

test('checkout refuses a forged redirect, a live checkout and an invalid expiry', async () => {
  for (const data of [
    { ...checkout, url: 'https://evil.test' },
    { ...checkout, url: 'javascript:alert(1)' },
    { ...checkout, testMode: false },
    { ...checkout, expiresAt: 'bad' },
  ]) {
    const api = createShopApi('http://api.test', async () => json(data));
    await assert.rejects(
      api.checkout(
        { customerName: 'Test', customerEmail: 'test@example.com' },
        1,
        2,
        'key',
      ),
      /incomplète/,
    );
  }
});

test('the payment status comes from the backend, never from success URL parameters', async () => {
  const api = createShopApi('http://api.test', async (url) => {
    assert.equal(url, 'http://api.test/payments/checkout/cs_test_123abc');
    return json({
      orderId: 'order',
      total: 6000,
      paymentStatus: 'UNPAID',
      expiresAt: checkout.expiresAt,
      testMode: true,
    });
  });
  assert.equal(
    (await api.checkoutStatus(checkout.sessionId)).paymentStatus,
    'UNPAID',
  );
});

test('retry keys survive a reload without storing customer details, and change with the basket', async () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const payload = { email: 'private@example.com', quantity: 2 };
  const first = await checkoutAttempt(payload, storage);
  assert.equal(await checkoutAttempt(payload, storage), first);
  assert.notEqual(
    await checkoutAttempt({ ...payload, quantity: 3 }, storage),
    first,
  );
  assert(!JSON.stringify([...values.values()]).includes('private@example.com'));
});
