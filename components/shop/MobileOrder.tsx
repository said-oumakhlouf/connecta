'use client';

import { useShop } from '@/components/shop/ShopProvider';

export default function MobileOrder() {
  const { offer, order } = useShop();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-[#e9eaed] bg-white/95 px-5.5 py-3 backdrop-blur-xl md:hidden">
      <div className="flex flex-col gap-0.75">
        <strong className="text-[21px] font-semibold">{offer.price} €</strong>

        <span className="text-[9px] text-[#72767f]">{offer.title}</span>
      </div>

      <button
        type="button"
        onClick={() => order()}
        className="rounded-lg bg-[#235bfa] px-5 py-3.5 text-xs font-semibold text-white shadow-[0_10px_24px_#235bfa20] transition hover:-translate-y-px hover:bg-[#1645cf]"
      >
        Commander
      </button>
    </div>
  );
}
