import assert from 'node:assert/strict';
import test from 'node:test';
import { checkoutAttempt } from '../lib/checkout-attempt';
import { changeCartLine, countUnits, getMultiCartPrice } from '../lib/multi-cart';
import { createShopApi } from '../lib/shop-api';

const products = [
  { id: 1, name: 'Hoco EW75', slug: 'hoco-ew75', price: 3500, duoPrice: 6000, stock: 20, active: true },
  { id: 2, name: 'CONNECTA Câble USB-C (TEST)', slug: 'connecta-cable-usb-c-test', price: 990, duoPrice: null, stock: 20, active: true },
  { id: 3, name: 'CONNECTA Chargeur 20W (TEST)', slug: 'connecta-chargeur-20w-test', price: 1990, duoPrice: null, stock: 15, active: true },
];

test('the catalog endpoint accepts several product references and rejects corrupt results', async () => {
  const api = createShopApi('http://api.test', async (url) => {
    assert.equal(url, 'http://api.test/products');
    return Response.json(products);
  });
  assert.deepEqual((await api.getProducts()).map(item => item.id), [1, 2, 3]);
  await assert.rejects(
    createShopApi('http://api.test', async () => Response.json([{ ...products[0], stock: -2 }])).getProducts(),
    /incomplète/,
  );
});

test('mixed carts compute server-equivalent per-reference Duo discounts and limits', () => {
  let lines = changeCartLine([], products[0], 2);
  lines = changeCartLine(lines, products[1], 1);
  lines = changeCartLine(lines, products[2], 1);
  assert.equal(countUnits(lines), 4);
  assert.deepEqual(getMultiCartPrice(products, lines), { count: 4, total: 8980, discount: 1000, valid: true });
  assert.deepEqual(changeCartLine(lines, products[2], 7), lines); // over 10 units
  assert.equal(getMultiCartPrice(products, [{ productId: 2, quantity: 21 }]).valid, false);
  assert.equal(getMultiCartPrice(products, [{ productId: 999, quantity: 1 }]).valid, false);
  lines = changeCartLine(lines, products[1], -1);
  assert.equal(getMultiCartPrice(products, lines).total, 7990);
});

test('multi-line checkout posts identifiers and quantities only, in guest and member modes', async () => {
  for (const member of [false, true]) {
    const api = createShopApi('http://api.test', async (url, options) => {
      assert.equal(url, member ? 'http://api.test/members/checkout' : 'http://api.test/payments/checkout');
      assert.equal(options?.credentials, member ? 'include' : undefined);
      assert.deepEqual(JSON.parse(String(options?.body)), {
        customerName: 'Client',
        customerEmail: 'client@example.test',
        items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }, { productId: 3, quantity: 1 }],
        checkoutKey: 'key',
      });
      return Response.json({ sessionId: 'cs_test_example', url: 'https://checkout.stripe.com/c/pay/test', expiresAt: '2026-10-15T00:00:00Z', total: 8980, testMode: true });
    });
    const result = await api.checkoutItems(
      { customerName: ' Client ', customerEmail: 'CLIENT@example.test' },
      [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }, { productId: 3, quantity: 1 }],
      'key',
      member,
    );
    assert.equal(result.testMode, true);
    assert.equal(result.total, 8980);
  }
});

test('retry-key storage preserves only product IDs, not customer identity', async () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); } };
  const payload = { customerEmail: 'private@example.test', items: [
    { productId: 1, quantity: 2 }, { productId: 2, quantity: 1 },
  ] };
  const key = await checkoutAttempt(payload, storage);
  assert.equal(await checkoutAttempt(payload, storage), key);
  assert.notEqual(await checkoutAttempt({ ...payload, items: [{ productId: 1, quantity: 1 }] }, storage), key);
  const saved = JSON.parse(storage.getItem('connectaCheckoutAttempt')!);
  assert.deepEqual(saved.items, [{ productId: 1, quantity: 1 }]);
  assert(!JSON.stringify(saved).includes('private@example.test'));
});
