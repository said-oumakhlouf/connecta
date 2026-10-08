import { API_BASE_URL } from './api-config';

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  duoPrice: number | null;
  stock: number;
  active: boolean;
};

export type ApiOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING';
  total: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>;
};

export type CustomerDetails = {
  customerName: string;
  customerEmail: string;
};

export type CheckoutSession = {
  sessionId: string;
  url: string;
  expiresAt: string;
  total: number;
  testMode: true;
};
export type CheckoutStatus = {
  orderId: string;
  total: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'EXPIRED';
  expiresAt: string;
  testMode: true;
};

function isCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'checkout.stripe.com' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function isCheckout(value: unknown): value is CheckoutSession {
  return (
    isRecord(value) &&
    typeof value.sessionId === 'string' &&
    /^cs_test_[a-zA-Z0-9]+$/.test(value.sessionId) &&
    isCheckoutUrl(value.url) &&
    typeof value.expiresAt === 'string' &&
    Number.isFinite(Date.parse(value.expiresAt)) &&
    isAmount(value.total) &&
    value.testMode === true
  );
}

function isCheckoutStatus(value: unknown): value is CheckoutStatus {
  return (
    isRecord(value) &&
    typeof value.orderId === 'string' &&
    value.orderId.length > 0 &&
    isAmount(value.total) &&
    ['UNPAID', 'PAID', 'EXPIRED'].includes(String(value.paymentStatus)) &&
    typeof value.expiresAt === 'string' &&
    Number.isFinite(Date.parse(value.expiresAt)) &&
    value.testMode === true
  );
}

export class ShopApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ShopApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isProduct(value: unknown): value is ApiProduct {
  return (
    isRecord(value) &&
    isAmount(value.id) &&
    value.id > 0 &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    isAmount(value.price) &&
    (value.duoPrice === null || isAmount(value.duoPrice)) &&
    isAmount(value.stock) &&
    typeof value.active === 'boolean'
  );
}

function isOrder(value: unknown): value is ApiOrder {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.customerName === 'string' &&
    typeof value.customerEmail === 'string' &&
    value.status === 'PENDING' &&
    isAmount(value.total) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item: unknown) =>
        isRecord(item) &&
        isAmount(item.productId) &&
        item.productId > 0 &&
        isAmount(item.quantity) &&
        item.quantity > 0 &&
        isAmount(item.unitPrice) &&
        isAmount(item.discount) &&
        isAmount(item.lineTotal),
    )
  );
}

const errorMessages: Record<number, string> = {
  400: 'Vérifiez votre nom, votre email et les quantités demandées.',
  404: 'Ce produit n’est plus disponible.',
  409: 'Le stock ou le tarif a changé. Vérifiez le panier avant de valider à nouveau.',
  429: 'Trop de réservations. Patientez 15 minutes avant de recommencer.',
  503: 'Le paiement est momentanément indisponible. Aucune commande payée n’a été confirmée.',
};

export function createShopApi(baseUrl: string, fetcher: typeof fetch = fetch) {
  async function request<T>(
    path: string,
    options: RequestInit,
    validate: (value: unknown) => value is T,
  ): Promise<T> {
    if (!baseUrl.trim()) {
      throw new ShopApiError(
        'Le service de commande est momentanément indisponible.',
        0,
      );
    }
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      path === '/payments/checkout' ? 30000 : 10000,
    );
    try {
      const response = await fetcher(
        `${baseUrl.trim().replace(/\/$/, '')}${path}`,
        {
          ...options,
          cache: 'no-store',
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        throw new ShopApiError(
          errorMessages[response.status] ??
            'Le service de commande est momentanément indisponible.',
          response.status,
        );
      }
      const data: unknown = await response.json();
      if (!validate(data)) {
        throw new ShopApiError(
          'La réponse du service de commande est incomplète. Contactez-nous avant de réessayer.',
          0,
        );
      }
      return data;
    } catch (error) {
      if (error instanceof ShopApiError) throw error;
      throw new ShopApiError(
        'Impossible de confirmer la demande. Vérifiez votre connexion et contactez-nous avant de réessayer.',
        0,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    checkout: (
      customer: CustomerDetails,
      productId: number,
      quantity: number,
      checkoutKey: string,
    ) =>
      request(
        '/payments/checkout',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customer.customerName.trim(),
            customerEmail: customer.customerEmail.trim().toLowerCase(),
            items: [{ productId, quantity }],
            checkoutKey,
          }),
        },
        isCheckout,
      ),
    checkoutStatus: (sessionId: string) =>
      request(
        `/payments/checkout/${encodeURIComponent(sessionId)}`,
        { method: 'GET' },
        isCheckoutStatus,
      ),
    cancelCheckout: (sessionId: string) =>
      request(
        `/payments/checkout/${encodeURIComponent(sessionId)}/cancel`,
        { method: 'POST' },
        isCheckoutStatus,
      ),
    getProduct: () =>
      request('/products/hoco-ew75', { method: 'GET' }, isProduct),
    createOrder: (
      customer: CustomerDetails,
      productId: number,
      quantity: number,
    ) =>
      request(
        '/orders',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customer.customerName.trim(),
            customerEmail: customer.customerEmail.trim().toLowerCase(),
            items: [{ productId, quantity }],
          }),
        },
        isOrder,
      ),
  };
}

export const shopApi = createShopApi(API_BASE_URL);
