import { PRODUCTS } from '../data/products';

export const LOW_STOCK_THRESHOLD = 5;

export type StockInput = {
  loading: boolean;
  error: string | null;
  product: { stock: number; active: boolean } | null;
};

export type StockState =
  | { kind: 'loading' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'out' }
  | { kind: 'low'; stock: number }
  | { kind: 'available'; stock: number };

/** Availability shown on the product page, always derived from the live API product. */
export function getStockState({ loading, error, product }: StockInput): StockState {
  if (loading && !product) return { kind: 'loading' };
  if (!product)
    return {
      kind: 'unavailable',
      message: error ?? 'Disponibilité momentanément indisponible.',
    };
  if (!product.active)
    return { kind: 'unavailable', message: 'Produit momentanément indisponible.' };

  const stock = Math.max(0, Math.floor(product.stock));
  if (stock === 0) return { kind: 'out' };
  if (stock <= LOW_STOCK_THRESHOLD) return { kind: 'low', stock };
  return { kind: 'available', stock };
}

export function canOrderUnits(state: StockState, units: number) {
  return (state.kind === 'available' || state.kind === 'low') && state.stock >= units;
}

/** Savings of a multi-unit offer versus buying the same units individually. Euros in, cents out. */
export function getOfferSavings(unitPrice: number, offerPrice: number, quantity: number) {
  const unitCents = Math.round(unitPrice * 100);
  const offerCents = Math.round(offerPrice * 100);
  const regularCents = unitCents * quantity;
  const amount = regularCents - offerCents;

  if (quantity < 2 || unitCents <= 0 || offerCents <= 0 || amount <= 0)
    return { amount: 0, percent: 0, perUnit: offerCents / Math.max(quantity, 1) };

  return {
    amount,
    percent: Math.round((amount / regularCents) * 100),
    perUnit: Math.round(offerCents / quantity),
  };
}

export type ProductSpec = { label: string; value: string };

/** Technical sheet built only from the specifications stored in data/products.ts. */
export function getProductSpecs(product = PRODUCTS.ew75): ProductSpec[] {
  return [
    { label: 'Marque', value: product.brand },
    { label: 'Modèle', value: product.model },
    { label: 'Couleur', value: product.color },
    { label: 'Bluetooth', value: product.bluetoothVersion },
    { label: 'Fréquence', value: product.frequency },
    { label: 'Autonomie en écoute', value: `Jusqu’à ${product.musicTime}` },
    { label: 'Autonomie en appel', value: `Jusqu’à ${product.callTime}` },
    { label: 'Portée sans fil', value: `Jusqu’à ${product.range}` },
  ];
}

/**
 * schema.org Product without price or availability: those come from the API at runtime
 * and must never be frozen into the static export.
 */
export function getProductJsonLd(images: readonly string[], siteUrl?: string) {
  const product = PRODUCTS.ew75;
  const base = siteUrl?.replace(/\/$/, '');
  const absolute = (path: string) => (base ? `${base}${path}` : path);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.id.toUpperCase(),
    model: product.model,
    color: product.color,
    brand: { '@type': 'Brand', name: product.brand },
    category: 'Écouteurs sans fil',
    image: images.map(absolute),
    ...(base ? { url: `${base}/produit/hoco-ew75` } : {}),
    additionalProperty: getProductSpecs(product)
      .slice(3)
      .map(({ label, value }) => ({ '@type': 'PropertyValue', name: label, value })),
  };
}

/** Serialises JSON-LD safely for an inline <script> tag. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export const PRODUCT_PAGE_PATH = '/produit/hoco-ew75';

export function isProductPagePath(pathname: string | null | undefined) {
  return (pathname ?? '').replace(/\/+$/, '') === PRODUCT_PAGE_PATH;
}

export type OrderCtaInput = {
  stock: StockState;
  /** Units required by the selected offer (1 for Solo, 2 for Duo). */
  quantity: number;
  isSubmitting: boolean;
  /** True only once the product (and therefore its prices) came from the API. */
  productLoaded: boolean;
};

export type OrderCta = {
  status: 'submitting' | 'checking' | 'ready' | 'insufficient' | 'unavailable';
  disabled: boolean;
  /** Whether the displayed price comes from the API rather than the static fallback. */
  priceValidated: boolean;
  /** Short availability hint for compact surfaces (null when ready). */
  hint: string | null;
};

/** Single source of truth for every "Commander" button of the product page. */
export function getOrderCta({ stock, quantity, isSubmitting, productLoaded }: OrderCtaInput): OrderCta {
  const priceValidated = productLoaded;
  if (isSubmitting)
    return { status: 'submitting', disabled: true, priceValidated, hint: 'Commande en cours…' };
  if (stock.kind === 'loading')
    return { status: 'checking', disabled: true, priceValidated, hint: 'Vérification du stock…' };
  if (canOrderUnits(stock, quantity))
    return { status: 'ready', disabled: false, priceValidated, hint: null };
  if (stock.kind === 'available' || stock.kind === 'low')
    return { status: 'insufficient', disabled: true, priceValidated, hint: 'Stock insuffisant pour cette offre' };
  return {
    status: 'unavailable',
    disabled: true,
    priceValidated,
    hint: stock.kind === 'out' ? 'Rupture de stock' : stock.message,
  };
}
