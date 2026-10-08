// Store only a hashed basket fingerprint and an opaque retry key, never customer details.
export async function checkoutAttempt(
  payload: unknown,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  cryptoApi: Crypto = crypto,
) {
  const digest = await cryptoApi.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  try {
    const previous = JSON.parse(
      storage.getItem('connectaCheckoutAttempt') ?? 'null',
    ) as { key?: string; fingerprint?: string } | null;
    if (
      previous?.fingerprint === fingerprint &&
      typeof previous.key === 'string' &&
      /^[a-f0-9-]{36}$/.test(previous.key)
    )
      return previous.key;
  } catch {
    /* A stale storage value must not block a new checkout. */
  }
  const key = cryptoApi.randomUUID();
  const basket = payload as { quantity?: unknown; productId?: unknown };
  storage.setItem(
    'connectaCheckoutAttempt',
    JSON.stringify({
      key,
      fingerprint,
      quantity: basket.quantity,
      productId: basket.productId,
    }),
  );
  return key;
}
