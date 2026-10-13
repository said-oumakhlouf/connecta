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
