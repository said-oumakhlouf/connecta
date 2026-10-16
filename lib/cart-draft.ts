import { MAX_CART_REFERENCES } from './shop-pricing';
import type { CartLine } from './multi-cart';

/** Restore only product IDs and quantities; never trust arbitrary browser storage. */
export function parseCartDraft(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 ||
      parsed.length > MAX_CART_REFERENCES) return [];
    const lines: CartLine[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object' ||
          !('productId' in item) || !('quantity' in item) ||
          typeof item.productId !== 'number' || !Number.isSafeInteger(item.productId) || item.productId <= 0 ||
          typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
          item.quantity > 2_147_483_647) return [];
      lines.push({ productId: item.productId as number, quantity: item.quantity as number });
    }
    if (new Set(lines.map(line => line.productId)).size !== lines.length)
      return [];
    return lines.sort((a, b) => a.productId - b.productId);
  } catch {
    return [];
  }
}
