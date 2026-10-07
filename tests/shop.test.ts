import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createShopApi, ShopApiError } from '../lib/shop-api';
import { getCartPrice, formatPrice } from '../lib/shop-pricing';

const product = {
  id: 7,
  name: 'Hoco EW75',
  slug: 'hoco-ew75',
  price: 3500,
  duoPrice: 6000,
  stock: 17,
  active: true,
};
const order = {
  id: 'test-order',
  customerName: 'Said',
  customerEmail: 'client@example.com',
  status: 'PENDING',
  total: 6000,
  items: [
    {
      productId: 7,
      quantity: 2,
      unitPrice: 3500,
      discount: 1000,
      lineTotal: 6000,
    },
  ],
};

for (const [quantity, total, discount] of [
  [1, 3500, 0],
  [2, 6000, 1000],
  [3, 9500, 1000],
  [4, 12000, 2000],
]) {
  test(`cart pricing for ${quantity} pairs matches the backend`, () => {
    assert.deepEqual(getCartPrice(3500, 6000, quantity), { total, discount });
  });
}

test('normal pricing applies when the Duo offer is absent or more expensive', () => {
  assert.deepEqual(getCartPrice(3500, null, 2), { total: 7000, discount: 0 });
  assert.deepEqual(getCartPrice(2500, 6000, 2), { total: 5000, discount: 0 });
  assert.match(formatPrice(9500), /95/);
});

test('reads the product ID, price and stock from the API', async () => {
  const fetcher: typeof fetch = async (input, options) => {
    assert.equal(input, 'http://localhost:3001/products/hoco-ew75');
    assert.equal(options?.method, 'GET');
    assert.equal(options?.cache, 'no-store');
    return Response.json(product);
  };
  assert.deepEqual(
    await createShopApi('http://localhost:3001/', fetcher).getProduct(),
    product,
  );
});

test('sends the actual product ID and quantity with no client-supplied prices', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (input, options) => {
    calls++;
    assert.equal(input, 'http://localhost:3001/orders');
    assert.equal(options?.method, 'POST');
    assert.deepEqual(options?.headers, { 'Content-Type': 'application/json' });
    assert.deepEqual(JSON.parse(String(options?.body)), {
      customerName: 'Said',
      customerEmail: 'client@example.com',
      items: [{ productId: 7, quantity: 2 }],
    });
    return Response.json(order, { status: 201 });
  };
  const result = await createShopApi(
    'http://localhost:3001',
    fetcher,
  ).createOrder(
    { customerName: ' Said ', customerEmail: ' CLIENT@example.com ' },
    7,
    2,
  );
  assert.equal(result.total, 6000);
  assert.equal(result.id, 'test-order');
  assert.equal(calls, 1);
});

for (const status of [400, 404, 409, 500]) {
  test(`does not confirm an order after HTTP ${status}`, async () => {
    const fetcher: typeof fetch = async () => new Response('', { status });
    await assert.rejects(
      createShopApi('http://localhost:3001', fetcher).createOrder(
        { customerName: 'Said', customerEmail: 'client@example.com' },
        7,
        2,
      ),
      (error: unknown) =>
        error instanceof ShopApiError && error.status === status,
    );
  });
}

test('does not retry automatically when the connection fails', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    throw new TypeError('Network failed');
  };
  await assert.rejects(
    createShopApi('http://localhost:3001', fetcher).createOrder(
      { customerName: 'Said', customerEmail: 'client@example.com' },
      7,
      2,
    ),
    ShopApiError,
  );
  assert.equal(calls, 1);
});

test('rejects malformed order responses instead of showing a confirmation', async () => {
  const fetcher: typeof fetch = async () =>
    Response.json({ id: 'missing-details', total: 6000 }, { status: 201 });
  await assert.rejects(
    createShopApi('http://localhost:3001', fetcher).createOrder(
      { customerName: 'Said', customerEmail: 'client@example.com' },
      7,
      2,
    ),
    ShopApiError,
  );
});

test('rejects malformed product responses', async () => {
  const fetcher: typeof fetch = async () =>
    Response.json({ ...product, id: '7' });
  await assert.rejects(
    createShopApi('http://localhost:3001', fetcher).getProduct(),
    ShopApiError,
  );
});

test('does not send requests if the API address is missing', async () => {
  const fetcher: typeof fetch = async () => {
    throw new Error('This request must not run');
  };
  await assert.rejects(createShopApi('', fetcher).getProduct(), ShopApiError);
});
