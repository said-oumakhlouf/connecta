import assert from 'node:assert/strict';
import test from 'node:test';
import { AdminApiError, createAdminApi } from '../lib/admin-api';

const token = 'a'.repeat(64);
const product = {
  id: 7,
  name: 'Hoco EW75',
  slug: 'hoco-ew75',
  price: 3500,
  duoPrice: 6000,
  stock: 20,
  active: true,
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const analytics = {
  month: '2026-10',
  timeZone: 'Europe/Paris',
  amount: 6000,
  orderCount: 1,
  units: 2,
  averageOrder: 6000,
  pending: { count: 1, amount: 6000 },
  confirmed: { count: 0, amount: 0 },
  cancelled: { count: 0, amount: 0 },
  products: [
    {
      productId: 7,
      name: 'Hoco EW75',
      units: 2,
      amount: 6000,
      discount: 1000,
      orderCount: 1,
    },
  ],
};

test('monthly analytics reads protected server aggregates for the selected month', async () => {
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/analytics?month=2026-10');
    assert.equal(
      new Headers(options?.headers).get('Authorization'),
      `Bearer ${token}`,
    );
    assert.equal(options?.cache, 'no-store');
    return json(analytics);
  });
  const data = await api.analytics(token, '2026-10');
  assert.equal(data.amount, 6000);
  assert.equal(data.products[0].units, 2);
});

test('monthly analytics rejects partial, negative and invalid month data', async () => {
  for (const body of [
    {},
    { ...analytics, amount: -1 },
    { ...analytics, month: '2026-13' },
    { ...analytics, month: '2026-09' },
    { ...analytics, products: [{ ...analytics.products[0], units: '2' }] },
  ]) {
    const api = createAdminApi('http://api.test', async () => json(body));
    await assert.rejects(api.analytics(token, '2026-10'), /incomplète/);
  }
});

test('admin login sends the password only to the backend and reads the session', async () => {
  const api = createAdminApi('http://api.test/', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/login');
    assert.equal(options?.method, 'POST');
    assert.deepEqual(JSON.parse(String(options?.body)), {
      password: 'private password',
    });
    return json({ token, expiresAt: '2026-10-07T20:00:00.000Z' });
  });
  assert.equal((await api.login('private password')).token, token);
});

test('admin reads order snapshots using authorization and pagination', async () => {
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/orders?page=2&limit=20');
    assert.equal(
      new Headers(options?.headers).get('Authorization'),
      `Bearer ${token}`,
    );
    assert.equal(options?.cache, 'no-store');
    return json({
      page: 2,
      limit: 20,
      total: 21,
      orders: [
        {
          id: 'order-id',
          customerName: 'Test',
          customerEmail: 'test@example.com',
          status: 'PENDING',
          createdAt: '2026-10-07T12:00:00.000Z',
          total: 6000,
          items: [
            {
              productId: 7,
              productName: 'Hoco EW75',
              quantity: 2,
              unitPrice: 3500,
              discount: 1000,
              lineTotal: 6000,
            },
          ],
        },
      ],
    });
  });
  const data = await api.orders(token, 2);
  assert.equal(data.orders[0].total, 6000);
  assert.equal(data.orders[0].items[0].productName, 'Hoco EW75');
});

test('restock sends an increment without replacing stock or prices', async () => {
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/products/7/restock');
    assert.equal(
      new Headers(options?.headers).get('Authorization'),
      `Bearer ${token}`,
    );
    assert.deepEqual(JSON.parse(String(options?.body)), { quantity: 20 });
    return json(product, 201);
  });
  assert.equal((await api.restock(token, 7, 20)).stock, 20);
});

test('logout sends authorization and accepts an empty 204 response', async () => {
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/logout');
    assert.equal(
      new Headers(options?.headers).get('Authorization'),
      `Bearer ${token}`,
    );
    return new Response(null, { status: 204 });
  });
  assert.equal(await api.logout(token), undefined);
});

test('order status changes authenticate and validate the returned order', async () => {
  const order = {
    id: 'order-id',
    customerName: 'Test',
    customerEmail: 'test@example.com',
    status: 'CANCELLED',
    createdAt: '2026-10-07T12:00:00.000Z',
    total: 6000,
    items: [
      {
        productId: 7,
        productName: 'Hoco EW75',
        quantity: 2,
        unitPrice: 3500,
        discount: 1000,
        lineTotal: 6000,
      },
    ],
  };
  const api = createAdminApi('http://api.test', async (url, options) => {
    assert.equal(url, 'http://api.test/admin/orders/order-id/status');
    assert.equal(options?.method, 'POST');
    assert.equal(
      new Headers(options?.headers).get('Authorization'),
      `Bearer ${token}`,
    );
    assert.deepEqual(JSON.parse(String(options?.body)), {
      status: 'CANCELLED',
    });
    return json(order);
  });
  assert.equal(
    (await api.updateOrderStatus(token, 'order-id', 'CANCELLED')).status,
    'CANCELLED',
  );
  const malformed = createAdminApi('http://api.test', async () =>
    json({ ...order, status: 'PAID' }),
  );
  await assert.rejects(
    malformed.updateOrderStatus(token, 'order-id', 'CONFIRMED'),
    /incomplète/,
  );
});

for (const status of [401, 409, 429, 503]) {
  test(`admin propagates HTTP ${status} without retrying stock changes`, async () => {
    let calls = 0;
    const api = createAdminApi('http://api.test', async () => {
      calls++;
      return json({}, status);
    });
    await assert.rejects(
      api.restock(token, 7, 20),
      (error: unknown) =>
        error instanceof AdminApiError && error.status === status,
    );
    assert.equal(calls, 1);
  });
}

test('restock connection failure is not automatically replayed', async () => {
  let calls = 0;
  const api = createAdminApi('http://api.test', async () => {
    calls++;
    throw new TypeError('offline');
  });
  await assert.rejects(api.restock(token, 7, 20), /Actualisez/);
  assert.equal(calls, 1);
});

test('admin rejects malformed sessions, products and customer order data', async () => {
  for (const body of [
    { token: 'fake', expiresAt: 'invalid' },
    { ...product, stock: -1 },
    { orders: [{ customerName: 'partial' }], total: 1, page: 1, limit: 20 },
  ]) {
    const api = createAdminApi('http://api.test', async () => json(body));
    await assert.rejects(api.login('password'), /incomplète/);
    await assert.rejects(api.products(token), /incomplète/);
    await assert.rejects(api.orders(token), /incomplète/);
  }
});

test('an absent API address never sends admin credentials', async () => {
  let calls = 0;
  const api = createAdminApi('', async () => {
    calls++;
    return json({});
  });
  await assert.rejects(api.login('password'), /adresse/);
  assert.equal(calls, 0);
});
