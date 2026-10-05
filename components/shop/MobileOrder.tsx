'use client';

import { useShop } from '@/components/shop/ShopProvider';

export default function MobileOrder() {
  const { offer, order } = useShop();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-[#e9eaed] bg-white/95 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <strong className="text-[18px] font-semibold leading-none">
            {offer.price} €
          </strong>

          <span className="text-[10px] text-[#72767f]">
            {offer.quantity > 1 ? 'le pack' : 'la paire'}
          </span>
        </div>

        <span className="mt-1 block truncate text-[9px] text-[#8b9098]">
          {offer.title}
        </span>
      </div>

      <button
        type="button"
        onClick={() => order()}
        className="shrink-0 rounded-full bg-[#235bfa] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_10px_24px_#235bfa20] transition hover:-translate-y-px hover:bg-[#1645cf]"
      >
        Commander
      </button>
    </div>
  );
}
