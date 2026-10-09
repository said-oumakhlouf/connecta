export const MAX_ORDER_UNITS = 10;

export function getMaxCartCount(stock: number, unitsPerOffer: number) {
  return Math.floor(Math.min(stock, MAX_ORDER_UNITS) / unitsPerOffer);
}

export function getCartPrice(
  price: number,
  duoPrice: number | null,
  quantity: number,
) {
  const pairPrice = Math.min(duoPrice ?? price * 2, price * 2);
  const total = Math.floor(quantity / 2) * pairPrice + (quantity % 2) * price;
  return { total, discount: price * quantity - total };
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
