'use client';

import { usePathname } from 'next/navigation';

import { useShop } from '@/components/shop/ShopProvider';
import { getOrderCta, getStockState, isProductPagePath } from '@/lib/product-page';
import { formatPrice } from '@/lib/shop-pricing';

/** Pages where a sticky lead-product purchase bar would compete with the page's own purpose. */
const HIDDEN_ON = new Set(['/boutique', '/compte']);

export default function MobileOrder() {
  const pathname = (usePathname() ?? '').replace(/\/+$/, '') || '/';
  if (HIDDEN_ON.has(pathname)) return null;
  return <ProductMobileOrder showName={!isProductPagePath(pathname)} />;
}

/** Same guards as the product page button (loading, API errors, availability, offer quantity).
 * Prices appear only once they come from the API. */
function ProductMobileOrder({ showName }: { showName: boolean }) {
  const { offer, order, product, productLoading, productError, isSubmitting } = useShop();
  const stock = getStockState({ loading: productLoading, error: productError, product });
  const cta = getOrderCta({
    stock,
    quantity: offer.quantity,
    isSubmitting,
    productLoaded: product !== null,
  });

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#e9eaed] bg-white/95 px-4 py-2.5 shadow-[0_-8px_30px_#2029380b] backdrop-blur-xl sm:px-5.5 md:hidden">
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          {cta.priceValidated ? (
            <>
              <strong className="font-heading text-[19px] font-semibold tracking-[-0.6px]">
                {formatPrice(Math.round(offer.price * 100))}
              </strong>
              <span className="text-[11px] text-[#8a8f98]">
                {offer.quantity > 1 ? 'le pack' : 'la paire'}
              </span>
            </>
          ) : (
            <span aria-hidden className="my-1 block h-5 w-20 animate-pulse rounded-md bg-[#f0f1f4]" />
          )}
        </div>

        <span
          role="status"
          className={`block max-w-48 truncate text-[11px] ${cta.status === 'insufficient' || cta.status === 'unavailable' ? 'text-[#a3471f]' : 'text-[#72767f]'}`}
        >
          {cta.hint ?? (showName ? `Hoco EW75 · ${offer.title}` : offer.title)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => order()}
        disabled={cta.disabled}
        className="shrink-0 rounded-full bg-[#235bfa] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_8px_22px_#235bfa22] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#c9ccd2] disabled:shadow-none disabled:active:scale-100"
      >
        {cta.status === 'checking' ? 'Vérification…' : cta.status === 'ready' || cta.status === 'submitting' ? 'Ajouter au panier' : 'Indisponible'}
      </button>
    </div>
  );
}
