import type { ApiProduct } from './shop-api';
import { getCartPrice, MAX_ORDER_UNITS } from './shop-pricing';

export type CartLine = { productId: number; quantity: number };

export function countUnits(items: CartLine[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Pure helper: never exceed either the per-reference stock or the shared 10-unit cap. */
export function changeCartLine(
  items: CartLine[],
  product: ApiProduct,
  change: number,
): CartLine[] {
  if (!Number.isInteger(change) || !product.active) return items;
  const previous = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const nextQuantity = Math.max(0, Math.min(product.stock, previous + change));
  if (nextQuantity > previous &&
      countUnits(items) - previous + nextQuantity > MAX_ORDER_UNITS) return items;
  const rest = items.filter((item) => item.productId !== product.id);
  return nextQuantity > 0
    ? [...rest, { productId: product.id, quantity: nextQuantity }]
        .sort((a, b) => a.productId - b.productId)
    : rest;
}

/** Display-only availability: putting an item in the cart does not reserve DB stock.
 * After Stripe has reserved the basket, API stock already excludes those units.
 */
export function getCartStockAvailability(
  product: ApiProduct,
  items: CartLine[],
  reserved = false,
) {
  const inCart = items.find(item => item.productId === product.id)?.quantity ?? 0;
  const outsideCart = Math.max(0, product.stock - (reserved ? 0 : inCart));
  const canAdd = !reserved && product.active &&
    Math.min(outsideCart, Math.max(0, MAX_ORDER_UNITS - countUnits(items))) > 0;
  return { inCart, outsideCart, canAdd };
}

export function getMultiCartPrice(products: ApiProduct[], items: CartLine[]) {
  const byId = new Map(products.map(product => [product.id, product]));
  let total = 0;
  let discount = 0;
  const valid = countUnits(items) > 0 &&
    countUnits(items) <= MAX_ORDER_UNITS &&
    items.every(({ productId, quantity }) => {
      const product = byId.get(productId);
      if (!product || !product.active || quantity < 1 ||
        !Number.isInteger(quantity) || quantity > product.stock) return false;
      const priced = getCartPrice(product.price, product.duoPrice, quantity);
      total += priced.total;
      discount += priced.discount;
      return true;
    });
  return { total, discount, valid, count: countUnits(items) };
}
