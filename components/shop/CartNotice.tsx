'use client';

import { Check, ShoppingBag, X } from 'lucide-react';
import { useShop } from './ShopProvider';

export default function CartNotice() {
  const { cartNotice, dismissCartNotice, cartCount, openCart } = useShop();
  if (!cartNotice) return null;
  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-24 left-4 right-4 z-[55] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#e1e4e9] bg-white p-4 text-[#17191d] shadow-[0_14px_45px_#10182829] md:bottom-6">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e9f6ef] text-[#22794d]">
        <Check size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{cartNotice}</p>
        <p className="mt-1 text-[11px] text-[#72767f]">{cartCount} article(s) dans votre panier</p>
      </div>
      <button type="button" onClick={() => { dismissCartNotice(); openCart(); }}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#235bfa] px-3 py-2 text-[11px] font-semibold text-white">
        <ShoppingBag size={13} /> Voir
      </button>
      <button type="button" onClick={dismissCartNotice}
        aria-label="Masquer la confirmation d'ajout"
        className="grid size-7 shrink-0 place-items-center rounded-full text-[#72767f] hover:bg-[#f5f6f8]">
        <X size={15} />
      </button>
    </div>
  );
}
