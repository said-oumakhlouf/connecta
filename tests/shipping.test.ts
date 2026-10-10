import assert from 'node:assert/strict';
import test from 'node:test';
import { createShopApi } from '../lib/shop-api';
import { createAdminApi } from '../lib/admin-api';
import { createMemberApi } from '../lib/member-api';
import { checkoutAttempt } from '../lib/checkout-attempt';
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const address = { country: 'FR' as const, line1: '12 rue du Test', line2: '', city: 'Paris', postalCode: '75001', region: '' };
const order = { id: 'order', customerName: 'Client', customerEmail: 'client@example.test', status: 'CONFIRMED', paymentStatus: 'PAID', reservedUntil: null, paidAt: '2026-10-10T10:00:00Z', createdAt: '2026-10-10T10:00:00Z', total: 6590, shippingFee: 590, shippingAddress: address, fulfillmentStatus: 'SHIPPED', trackingCarrier: 'Colissimo', trackingNumber: 'TEST123456', shippedAt: '2026-10-10T10:00:00Z', deliveredAt: null,
  items: [{ productId: 1, productName: 'Hoco', quantity: 2, unitPrice: 3500, discount: 1000, lineTotal: 6000 }] };

test('shipping quotes reject malformed costs and unsupported currencies', async () => {
  const quote = { currency: 'eur', provisional: true, destinations: [{ country: 'FR', label: 'France', fee: 590 }] };
  const api = createShopApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/payments/shipping'); assert.equal(options?.cache, 'no-store'); return json(quote);
  });
  assert.equal((await api.shippingOptions()).destinations[0].fee, 590);
  for (const value of [{ ...quote, currency: 'cad' }, { ...quote, destinations: [{ country: 'FR', label: 'France', fee: -1 }] }])
    await assert.rejects(createShopApi('http://api.test', async () => json(value)).shippingOptions());
});

test('checkout sends address and displayed fee; changing the address creates a different opaque retry key', async () => {
  const customer = { customerName: 'Client', customerEmail: 'client@example.test', shippingAddress: address, expectedShippingFee: 590 };
  const api = createShopApi('http://api.test', async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    assert.deepEqual(body.shippingAddress, address); assert.equal(body.expectedShippingFee, 590); assert.equal(body.total, undefined);
    return json({ sessionId: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/test', expiresAt: '2026-10-10T11:00:00Z', total: 6590, testMode: true });
  });
  assert.equal((await api.checkout(customer, 1, 2, 'key')).total, 6590);
  const stored = new Map<string, string>(); const storage = { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string,v: string) => { stored.set(k,v); } };
  const first = await checkoutAttempt(customer, storage);
  assert.notEqual(first, await checkoutAttempt({ ...customer, shippingAddress: { ...address, line1: '99 autre rue' } }, storage));
  assert(!JSON.stringify([...stored.values()]).includes('autre rue'));
});

test('fulfillment updates authenticate and preserve shipment details for members', async () => {
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/orders/order/fulfillment');
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer secret');
    assert.deepEqual(JSON.parse(String(options?.body)), { status: 'SHIPPED', trackingCarrier: 'Colissimo', trackingNumber: 'TEST123456' });
    return json(order);
  });
  assert.equal((await api.updateFulfillment('secret', 'order', { status: 'SHIPPED', trackingCarrier: 'Colissimo', trackingNumber: 'TEST123456' })).fulfillmentStatus, 'SHIPPED');
  const member = createMemberApi('http://api.test', async () => json({ orders: [order], page: 1, limit: 20, total: 1 }));
  assert.equal((await member.orders()).orders[0].trackingNumber, 'TEST123456');
  for (const wrong of [{ ...order, shippingFee: 99999 }, { ...order, shippedAt: 'bad' }, { ...order, fulfillmentStatus: 'INVENTED' }, { ...order, shippingAddress: { country: 'FR' } }]) {
    await assert.rejects(createMemberApi('http://api.test', async () => json({ orders: [wrong], page: 1, limit: 20, total: 1 })).orders());
    await assert.rejects(createAdminApi('http://api.test', async () => json({ orders: [wrong], page: 1, limit: 20, total: 1 })).orders('token'));
  }
});
