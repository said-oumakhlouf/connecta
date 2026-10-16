import type { ApiProduct } from './shop-api';
import { getCartPrice, MAX_CART_REFERENCES } from './shop-pricing';

export type CartLine = { productId: number; quantity: number };

export function countUnits(items: CartLine[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Pure helper: cap additions by real stock, never by a global quantity quota. */
export function changeCartLine(
  items: CartLine[],
  product: ApiProduct,
  change: number,
): CartLine[] {
  if (!Number.isInteger(change) || !product.active) return items;
  const previous = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const nextQuantity = Math.max(0, Math.min(product.stock, previous + change));
  if (nextQuantity > previous && !previous && items.length >= MAX_CART_REFERENCES) return items;
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
  const canAdd = !reserved && product.active && outsideCart > 0 &&
    (inCart > 0 || items.length < MAX_CART_REFERENCES);
  return { inCart, outsideCart, canAdd };
}

/** Once checkout has reserved stock, API stock excludes the reserved units.
 * Keep pricing the locked basket while retaining strict stock checks for fresh carts.
 */
export function getMultiCartPrice(products: ApiProduct[], items: CartLine[], reserved = false) {
  const byId = new Map(products.map(product => [product.id, product]));
  let total = 0;
  let discount = 0;
  const valid = items.length > 0 && items.length <= MAX_CART_REFERENCES &&
    new Set(items.map(item => item.productId)).size === items.length &&
    items.every(({ productId, quantity }) => {
      const product = byId.get(productId);
      if (!product || !product.active || quantity < 1 ||
        !Number.isSafeInteger(quantity) || quantity > 2_147_483_647 ||
        (!reserved && quantity > product.stock)) return false;
      const priced = getCartPrice(product.price, product.duoPrice, quantity);
      total += priced.total;
      discount += priced.discount;
      return true;
    });
  return {
    total,
    discount,
    valid: valid && Number.isSafeInteger(total) && total <= 2_147_483_647 &&
      Number.isSafeInteger(discount) && discount >= 0,
    count: countUnits(items),
  };
}

/** Amounts shown for a reserved basket. Articles keep the locked-line subtotal
 * (never re-checked against stock already deducted); shipping and the amount to
 * pay come from the server reservation, never from a hidden address form.
 */
export function getReservedTotals(
  itemsTotal: number,
  reservation: { total: number; shippingFee: number } | null,
) {
  return reservation
    ? { itemsTotal, shippingFee: reservation.shippingFee, total: reservation.total }
    : { itemsTotal, shippingFee: null, total: null };
}

/** Ordering for cart suggestions: accessories complement the basket first, then the lead product. */
function suggestionRank(slug: string): number {
  if (slug.includes('cable')) return 0;
  if (slug.includes('chargeur')) return 1;
  if (slug === 'hoco-ew75') return 3;
  return 2;
}

/**
 * Up to `max` live catalogue products absent from the basket that can really be added:
 * active, in stock and within the existing cart limits. No suggestion once the basket
 * is reserved for payment. Prices and stock come straight from the API products.
 */
export function getCartSuggestions(
  catalog: ApiProduct[],
  items: CartLine[],
  { reserved = false, max = 2 }: { reserved?: boolean; max?: number } = {},
): ApiProduct[] {
  if (reserved || items.length === 0 || max < 1) return [];
  return catalog
    .filter((product) => !items.some((item) => item.productId === product.id))
    .filter((product) => product.active && product.stock > 0)
    .filter((product) => getCartStockAvailability(product, items, false).canAdd)
    .map((product, index) => ({ product, index }))
    .sort((a, b) => suggestionRank(a.product.slug) - suggestionRank(b.product.slug) || a.index - b.index)
    .slice(0, max)
    .map(({ product }) => product);
}
