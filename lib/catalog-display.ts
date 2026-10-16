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
