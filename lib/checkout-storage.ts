/** Clear a completed or cancelled Stripe test checkout and its shopping draft.
 * Never clear a still-unpaid reservation: it could still own reserved stock.
 * Store only opaque references and product IDs, never personal information.
 */
export function clearFinalizedCheckout(
  storage: Pick<Storage, 'removeItem'>,
  status: 'UNPAID' | 'PAID' | 'EXPIRED',
): boolean {
  if (status === 'UNPAID') return false;
  storage.removeItem('connectaCheckoutAttempt');
  storage.removeItem('connectaCheckoutSession');
  storage.removeItem('connectaCartDraft');
  return true;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The random key of the reservation started in this browser, if any. */
export function readCheckoutKey(storage: Pick<Storage, 'getItem'>): string | null {
  try {
    const saved: unknown = JSON.parse(storage.getItem('connectaCheckoutAttempt') ?? 'null');
    const key = saved && typeof saved === 'object' && 'key' in saved ? saved.key : null;
    return typeof key === 'string' && UUID_V4.test(key) ? key : null;
  } catch {
    return null;
  }
}

/** Forget a reservation that no longer holds stock, but keep the basket as a draft. */
export function releaseCheckoutKeepCart(storage: Pick<Storage, 'removeItem'>) {
  storage.removeItem('connectaCheckoutAttempt');
  storage.removeItem('connectaCheckoutSession');
}

/** Requests that certainly created no reservation; network errors and 5xx stay uncertain. */
export function isDefinitiveCheckoutRefusal(status: number) {
  return status >= 400 && status < 500;
}
