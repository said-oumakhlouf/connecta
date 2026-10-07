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

function isProduct(value: unknown): value is ApiProduct {
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
    const timeout = setTimeout(() => controller.abort(), 10_000);
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

export const shopApi = createShopApi(
  process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''),
);
