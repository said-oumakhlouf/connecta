/** Places the current lead product first without changing catalogue or checkout data.
 * Stable sorting keeps future products in their backend-defined relative order.
 */
export function orderStorefrontProducts<T extends { slug: string }>(products: readonly T[]): T[] {
  const priority = (slug: string): number => {
    if (slug === 'hoco-ew75') return 0;
    if (slug.includes('cable')) return 1;
    if (slug.includes('chargeur')) return 2;
    return 3;
  };
  return [...products].sort((a, b) => priority(a.slug) - priority(b.slug));
}

export const LEAD_PRODUCT_SLUG = 'hoco-ew75';

/** Duo is an opt-in offer, not a generic option for catalogue accessories.
 * Keep the lead Hoco eligible even if its Duo is temporarily cleared.
 */
export function canEditDuoOffer(product: { slug: string; duoPrice: number | null }): boolean {
  return product.slug === LEAD_PRODUCT_SLUG || product.duoPrice !== null;
}

export type ProductVisual = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Padding keeps cut-out accessory visuals from touching the frame. */
  padded: boolean;
};

/**
 * Presentation-only data (visual, category, link) keyed by slug.
 * Prices, stock and availability always come from the API product.
 * Every visual is an illustration until authentic product photos are supplied.
 */
export function getProductVisual(slug: string, imageUrl?: string | null, name?: string): ProductVisual {
  if (imageUrl && /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\//.test(imageUrl)) {
    return { src: imageUrl, alt: name ? `Photo de ${name}` : 'Photo du produit', width: 800, height: 800, padded: true };
  }
  if (slug === LEAD_PRODUCT_SLUG)
    return {
      src: '/images/hoco-ew75-features-800.webp',
      alt: 'Visuel d’illustration des écouteurs Hoco EW75 et de leurs principales caractéristiques',
      width: 800,
      height: 600,
      padded: false,
    };
  if (slug.includes('cable'))
    return {
      src: '/images/connecta-cable-demo.webp',
      alt: 'Visuel d’illustration d’un câble USB-A vers USB-C blanc',
      width: 420,
      height: 420,
      padded: true,
    };
  if (slug.includes('chargeur'))
    return {
      src: '/images/connecta-chargeur-demo.webp',
      alt: 'Visuel d’illustration d’un chargeur secteur USB-C blanc',
      width: 420,
      height: 420,
      padded: true,
    };
  return {
    src: '/connecta-logo-blue.svg',
    alt: '',
    width: 704,
    height: 72,
    padded: true,
  };
}

export function getProductCategory(slug: string): string {
  if (slug === LEAD_PRODUCT_SLUG) return 'Écouteurs sans fil';
  if (slug.includes('cable')) return 'Câble de charge';
  if (slug.includes('chargeur')) return 'Chargeur secteur';
  return 'Accessoire';
}

/** Dedicated product page when one exists; accessories stay in the catalogue for now. */
export function getProductHref(slug: string): string | null {
  return slug === LEAD_PRODUCT_SLUG ? '/produit/hoco-ew75' : null;
}
