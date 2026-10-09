import { API_BASE_URL } from './api-config';
import type { AdminOrder } from './admin-api';
import type { CheckoutSession } from './shop-api';

export type MemberProfile = { email: string; expiresAt: string };
export type MemberOrder = Omit<AdminOrder, 'customerEmail'>;
export type MemberOrders = {
  orders: MemberOrder[];
  total: number;
  page: number;
  limit: number;
};
export class MemberApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const amount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const profile = (value: unknown): value is MemberProfile =>
  record(value) && typeof value.email === 'string' && date(value.expiresAt);
const orders = (value: unknown): value is MemberOrders =>
  record(value) &&
  amount(value.total) &&
  amount(value.page) &&
  value.page > 0 &&
  value.limit === 20 &&
  Array.isArray(value.orders) &&
  value.orders.every(
    (order: unknown) =>
      record(order) &&
      typeof order.id === 'string' &&
      typeof order.customerName === 'string' &&
      amount(order.total) &&
      date(order.createdAt) &&
      ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(String(order.status)) &&
      ['LEGACY', 'UNPAID', 'PAID', 'EXPIRED'].includes(
        String(order.paymentStatus),
      ) &&
      (order.reservedUntil === null || date(order.reservedUntil)) &&
      (order.paidAt === null || date(order.paidAt)) &&
      Array.isArray(order.items) &&
      order.items.length > 0 &&
      order.items.every(
        (item: unknown) =>
          record(item) &&
          amount(item.productId) &&
          typeof item.productName === 'string' &&
          amount(item.quantity) &&
          item.quantity > 0 &&
          amount(item.unitPrice) &&
          amount(item.discount) &&
          amount(item.lineTotal),
      ),
  );
const checkout = (value: unknown): value is CheckoutSession => {
  if (
    !record(value) ||
    typeof value.sessionId !== 'string' ||
    !/^cs_test_[a-zA-Z0-9]+$/.test(value.sessionId) ||
    !date(value.expiresAt) ||
    !amount(value.total) ||
    value.testMode !== true ||
    typeof value.url !== 'string'
  )
    return false;
  try {
    const url = new URL(value.url);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'checkout.stripe.com' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

export function createMemberApi(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
) {
  async function request<T>(
    path: string,
    method: 'GET' | 'POST',
    valid: (value: unknown) => value is T,
    body?: unknown,
  ): Promise<T> {
    if (!baseUrl.trim())
      throw new MemberApiError(
        'Le service membre est momentanément indisponible.',
        0,
      );
    try {
      const response = await fetcher(
        `${baseUrl.replace(/\/$/, '')}/members${path}`,
        {
          method,
          cache: 'no-store',
          credentials: 'include',
          signal: AbortSignal.timeout(30000),
          ...(body !== undefined
            ? {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              }
            : {}),
        },
      );
      if (!response.ok)
        throw new MemberApiError(
          {
            401: 'Votre session ou votre lien a expiré. Demandez un nouveau lien de connexion.',
            403: 'Connexion refusée. Vérifiez l’adresse du site et la configuration du backend.',
            404: 'Cette commande est introuvable.',
            409: 'Cette commande a changé. Actualisez pour vérifier son paiement avant de continuer.',
            429: 'Trop de demandes de connexion. Patientez 15 minutes.',
            503: 'Envoi des emails ou paiement indisponible. Réessayez plus tard.',
          }[response.status] ??
            'Le service membre est momentanément indisponible.',
          response.status,
        );
      const result: unknown =
        response.status === 204 ? undefined : await response.json();
      if (!valid(result))
        throw new MemberApiError(
          'La réponse du service membre est incomplète.',
          0,
        );
      return result;
    } catch (error) {
      if (error instanceof MemberApiError) throw error;
      throw new MemberApiError(
        'Connexion interrompue. Actualisez pour vérifier le résultat.',
        0,
      );
    }
  }
  const empty = (value: unknown): value is undefined => value === undefined;
  return {
    me: () => request('/me', 'GET', profile),
    login: (email: string) =>
      request(
        '/login',
        'POST',
        (value): value is { accepted: true; delivery: 'email' | 'console' } =>
          record(value) &&
          value.accepted === true &&
          ['email', 'console'].includes(String(value.delivery)),
        { email: email.trim().toLowerCase() },
      ),
    verify: (token: string) => request('/verify', 'POST', profile, { token }),
    orders: (page = 1) => request(`/orders?page=${page}`, 'GET', orders),
    resume: (id: string) =>
      request(`/orders/${encodeURIComponent(id)}/resume`, 'POST', checkout),
    cancel: (id: string) =>
      request(`/orders/${encodeURIComponent(id)}/cancel`, 'POST', empty),
    logout: () => request('/logout', 'POST', empty),
  };
}
export const memberApi = createMemberApi(API_BASE_URL);
