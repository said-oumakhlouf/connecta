import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemberApi, MemberApiError } from '../lib/member-api';
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const profile = { email: 'customer@example.com', expiresAt: '2026-10-10T12:00:00Z' };

test('member requests send cookies, disable caching and never store or return a session bearer token', async () => {
  const api = createMemberApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/members/verify');
    assert.equal(options?.credentials, 'include');
    assert.equal(options?.cache, 'no-store');
    assert.equal(options?.method, 'POST');
    assert.equal(new Headers(options?.headers).get('Authorization'), null);
    assert.deepEqual(JSON.parse(String(options?.body)), { token: 'a'.repeat(64) });
    return json(profile);
  });
  assert.deepEqual(await api.verify('a'.repeat(64)), profile);
});

test('a member may only resume a verified Stripe test checkout URL', async () => {
  const session = { sessionId: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/fixture', expiresAt: '2026-10-09T18:00:00Z', total: 6000, testMode: true };
  for (const value of [session, { ...session, url: 'https://evil.test' }, { ...session, testMode: false }]) {
    const api = createMemberApi('http://api.test', async () => json(value));
    if (value === session) assert.deepEqual(await api.resume('order'), session);
    else await assert.rejects(api.resume('order'), /incomplète/);
  }
});

test('member orders validate amounts, items, deadlines and pagination before rendering', async () => {
  const order = { id: 'order', customerName: 'Client', status: 'PENDING', paymentStatus: 'UNPAID', total: 6000, createdAt: '2026-10-09T17:00:00Z', reservedUntil: '2026-10-09T17:31:00Z', paidAt: null,
    items: [{ productId: 1, productName: 'Hoco', quantity: 2, unitPrice: 3500, discount: 1000, lineTotal: 6000 }] };
  const payload = { orders: [order], page: 1, limit: 20, total: 1 };
  const api = createMemberApi('http://api.test', async () => json(payload));
  assert.equal((await api.orders()).orders[0].items[0].quantity, 2);
  for (const row of [{ ...order, reservedUntil: 'invalid' }, { ...order, total: -1 }, { ...order, items: [] }]) {
    const malformed = createMemberApi('http://api.test', async () => json({ ...payload, orders: [row] }));
    await assert.rejects(malformed.orders(), /incomplète/);
  }
});

test('member cancellation and logout accept 204 while authentication failures remain explicit', async () => {
  const api = createMemberApi('http://api.test', async () => new Response(null, { status: 204 }));
  assert.equal(await api.cancel('order'), undefined);
  assert.equal(await api.logout(), undefined);
  const unauthorized = createMemberApi('http://api.test', async () => json({}, 401));
  await assert.rejects(unauthorized.orders(), (error: unknown) => error instanceof MemberApiError && error.status === 401);
});

test('login normalizes email and distinguishes local test delivery without exposing a login token', async () => {
  const api = createMemberApi('http://api.test', async (_url, options) => {
    assert.deepEqual(JSON.parse(String(options?.body)), { email: 'customer@example.com' });
    return json({ accepted: true, delivery: 'console' });
  });
  assert.equal((await api.login(' CUSTOMER@example.com ')).delivery, 'console');
});
