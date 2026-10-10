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
