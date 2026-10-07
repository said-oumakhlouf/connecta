'use client';

import { useShop } from '@/components/shop/ShopProvider';

export default function MobileOrder() {
  const { offer, order } = useShop();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-[#e9eaed] bg-white/95 px-4 py-2.5 shadow-[0_-8px_30px_#2029380b] backdrop-blur-xl sm:px-5.5 md:hidden">
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <strong className="font-heading text-[19px] font-semibold tracking-[-0.6px]">
            {offer.price} €
          </strong>

          <span className="text-[9px] text-[#8a8f98]">
            {offer.quantity > 1 ? 'le pack' : 'la paire'}
          </span>
        </div>

        <span className="block max-w-35 truncate text-[9px] text-[#72767f]">
          {offer.title}
        </span>
      </div>

      <button
        type="button"
        onClick={() => order()}
        className="rounded-full bg-[#235bfa] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_8px_22px_#235bfa22] transition active:scale-[0.98]"
      >
        Commander
      </button>
    </div>
  );
}
