'use client';

import { ArrowRight } from 'lucide-react';
import { useShop } from '@/components/shop/ShopProvider';
import { formatPrice } from '@/lib/shop-pricing';

export default function Announcement() {
  const { offers, product } = useShop();
  const duoOffer = offers.duo;
  // The Duo price is only shown once it comes from the API, never from the static fallback.
  const hasDuo = product !== null && product.duoPrice !== null && product.duoPrice < product.price * 2;
  if (product && !hasDuo) return null;

  return (
    <div className="bg-ink px-4 py-2.5 text-center text-xs text-[#cdd0d8]">
      <a href="#offres" className="inline-flex items-center gap-2 hover:text-white">
        Offre Duo Hoco EW75
        {hasDuo && (
          <strong className="font-heading font-semibold text-white">
            {duoOffer.quantity} paires pour {formatPrice(Math.round(duoOffer.price * 100))}
          </strong>
        )}
        <ArrowRight size={13} aria-hidden />
      </a>
    </div>
  );
}
