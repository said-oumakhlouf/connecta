import { API_BASE_URL } from './api-config';
import { isProduct, type ApiProduct, type ApiOrder } from './shop-api';

export type AdminSession = { token: string; expiresAt: string };
export type AdminOrder = Omit<ApiOrder, 'status' | 'items'> & {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  paymentStatus?: 'LEGACY' | 'UNPAID' | 'PAID' | 'EXPIRED';
  reservedUntil?: string | null;
  paidAt?: string | null;
  items: Array<ApiOrder['items'][number] & { productName: string }>;
};
export type AdminOrders = {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
};

export type AdminAnalytics = {
  month: string;
  timeZone: 'Europe/Paris';
  amount: number;
  orderCount: number;
  units: number;
  averageOrder: number;
  pending: { count: number; amount: number };
  confirmed: { count: number; amount: number };
  cancelled: { count: number; amount: number };
  products: Array<{
    productId: number;
    name: string;
    units: number;
    amount: number;
    discount: number;
    orderCount: number;
  }>;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

function isSession(value: unknown): value is AdminSession {
  return (
    record(value) &&
    typeof value.token === 'string' &&
    /^[a-f0-9]{64}$/.test(value.token) &&
    date(value.expiresAt)
  );
}

function isOrder(value: unknown): value is AdminOrder {
  return (
    record(value) &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.customerName === 'string' &&
    typeof value.customerEmail === 'string' &&
    ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(String(value.status)) &&
    integer(value.total) &&
    date(value.createdAt) &&
    (value.paymentStatus === undefined ||
      ['LEGACY', 'UNPAID', 'PAID', 'EXPIRED'].includes(
        String(value.paymentStatus),
      )) &&
    (value.reservedUntil === undefined || value.reservedUntil === null ||
      date(value.reservedUntil)) &&
    (value.paidAt === undefined || value.paidAt === null || date(value.paidAt)) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item: unknown) =>
        record(item) &&
        integer(item.productId) &&
        item.productId > 0 &&
        typeof item.productName === 'string' &&
        integer(item.quantity) &&
        item.quantity > 0 &&
        integer(item.unitPrice) &&
        integer(item.discount) &&
        integer(item.lineTotal),
    )
  );
}

function isOrders(value: unknown): value is AdminOrders {
  return (
    record(value) &&
    Array.isArray(value.orders) &&
    value.orders.every(isOrder) &&
    integer(value.total) &&
    integer(value.page) &&
    value.page > 0 &&
    integer(value.limit) &&
    value.limit > 0
  );
}

function isAnalytics(value: unknown): value is AdminAnalytics {
  const status = (item: unknown) =>
    record(item) && integer(item.count) && integer(item.amount);
  return (
    record(value) &&
    typeof value.month === 'string' &&
    /^20\d{2}-(0[1-9]|1[0-2])$/.test(value.month) &&
    value.timeZone === 'Europe/Paris' &&
    integer(value.amount) &&
    integer(value.orderCount) &&
    integer(value.units) &&
    integer(value.averageOrder) &&
    status(value.pending) &&
    status(value.confirmed) &&
    status(value.cancelled) &&
    Array.isArray(value.products) &&
    value.products.every(
      (item: unknown) =>
        record(item) &&
        integer(item.productId) &&
        item.productId > 0 &&
        typeof item.name === 'string' &&
        integer(item.units) &&
        integer(item.amount) &&
        integer(item.discount) &&
        integer(item.orderCount),
    )
  );
}

const messages: Record<number, string> = {
  400: 'Vérifiez la quantité (1 à 10 000), le statut ou le mois sélectionné.',
  401: 'Mot de passe incorrect ou session expirée. Reconnectez-vous.',
  404: 'Ce produit ou cette commande est introuvable. Actualisez les données.',
  409: 'Action impossible : vérifiez le paiement, le statut de commande et le stock. Une commande payée nécessite un remboursement.',
  429: 'Trop de tentatives. Patientez 15 minutes avant de réessayer.',
  503: 'L’accès admin n’est pas configuré. Renseignez ADMIN_PASSWORD dans le backend et redémarrez-le.',
};

export function createAdminApi(baseUrl: string, fetcher: typeof fetch = fetch) {
  async function request<T>(
    path: string,
    options: RequestInit,
    validate: (value: unknown) => value is T,
  ): Promise<T> {
    if (!baseUrl.trim())
      throw new AdminApiError('L’adresse de l’API est absente.', 0);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetcher(
        `${baseUrl.trim().replace(/\/$/, '')}${path}`,
        {
          ...options,
          cache: 'no-store',
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new AdminApiError(
          messages[response.status] ?? 'L’API est momentanément indisponible.',
          response.status,
        );
      const value: unknown =
        response.status === 204 ? undefined : await response.json();
      if (!validate(value))
        throw new AdminApiError(
          'La réponse de l’API est incomplète. Actualisez avant de continuer.',
          0,
        );
      return value;
    } catch (error) {
      if (error instanceof AdminApiError) throw error;
      throw new AdminApiError(
        'Connexion interrompue. Actualisez pour vérifier le résultat avant de refaire cette action.',
        0,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  return {
    login: (password: string) =>
      request(
        '/admin/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        },
        isSession,
      ),
    orders: (token: string, page = 1) =>
      request(
        `/admin/orders?page=${page}&limit=20`,
        {
          method: 'GET',
          headers: auth(token),
        },
        isOrders,
      ),
    products: (token: string) =>
      request(
        '/admin/products',
        {
          method: 'GET',
          headers: auth(token),
        },
        (value): value is ApiProduct[] =>
          Array.isArray(value) && value.every(isProduct),
      ),
    analytics: (token: string, month: string) =>
      request(
        `/admin/analytics?month=${encodeURIComponent(month)}`,
        {
          method: 'GET',
          headers: auth(token),
        },
        (value): value is AdminAnalytics =>
          isAnalytics(value) && value.month === month,
      ),
    updateOrderStatus: (
      token: string,
      orderId: string,
      status: 'CONFIRMED' | 'CANCELLED',
    ) =>
      request(
        `/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: 'POST',
          headers: { ...auth(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
        isOrder,
      ),
    restock: (token: string, productId: number, quantity: number) =>
      request(
        `/admin/products/${productId}/restock`,
        {
          method: 'POST',
          headers: { ...auth(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        },
        isProduct,
      ),
    logout: (token: string) =>
      request(
        '/admin/logout',
        {
          method: 'POST',
          headers: auth(token),
        },
        (value): value is undefined => value === undefined,
      ),
  };
}

export const adminApi = createAdminApi(API_BASE_URL);
