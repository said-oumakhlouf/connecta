'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

import AnimatedProduct from '@/components/product/AnimatedProduct';
import { useShop } from '@/components/shop/ShopProvider';
import { OFFERS } from '@/data/offers';
import { PRODUCTS } from '@/data/products';
import { SITE } from '@/data/site';

const product = PRODUCTS.ew75;
const soloOffer = OFFERS.solo;

export default function Hero() {
  const { order } = useShop();

  return (
    <section id="produit" className="relative overflow-hidden bg-[#f7f8fa]">
      <div className="pointer-events-none absolute -left-40 top-20 size-120 rounded-full bg-[#235bfa08] blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100vh-110px)] w-full max-w-310 grid-cols-1 items-center gap-10 px-5.5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-12 md:py-16 xl:max-w-335 xl:gap-16 2xl:max-w-375 2xl:gap-24 2xl:px-16">
        {/* TEXTE */}
        <div className="relative z-10 max-w-135 2xl:max-w-155">
          <div className="mb-7 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[1.7px] text-[#7a8089] md:text-[10px]">
            <span className="h-px w-7 bg-[#235bfa]" />
            {SITE.name} / ÉCOUTEURS SANS FIL
          </div>

          <h1 className="max-w-140 text-[54px] font-semibold leading-[0.93] tracking-[-3px] text-[#17191d] md:text-[66px] md:tracking-[-4px] xl:text-[78px] 2xl:text-[90px] 2xl:tracking-[-5px]">
            Des écouteurs simples.
            <br />
            Pour tous les jours.
            <br />
            <span className="text-[#235bfa]">Sans les fils.</span>
          </h1>

          <p className="mt-7 max-w-110 text-[12px] leading-[1.9] text-[#70757e] md:text-sm 2xl:text-[16px]">
            Bluetooth {product.bluetoothVersion}, jusqu’à {product.musicTime}{' '}
            d’écoute et un boîtier compact. Les {product.name} vont à
            l’essentiel.
          </p>

          <div className="mt-8 flex items-end gap-4">
            <strong className="text-[38px] font-semibold leading-none tracking-[-2px] text-[#17191d] md:text-[44px]">
              {soloOffer.price} €
            </strong>

            <span className="pb-1 text-[11px] text-[#7c818a]">la paire</span>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => order('solo')}
              className="group flex min-w-55 items-center justify-between gap-8 rounded-full bg-[#17191d] px-6 py-4.5 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#235bfa]"
            >
              Commander
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <Link
              href="/produit/hoco-ew75"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold text-[#51565f] transition hover:text-[#235bfa]"
            >
              Voir la fiche produit
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-2 text-[9px] text-[#969ba3] md:text-[10px]">
            <Check size={13} strokeWidth={1.8} />
            Simple. Compact. Toujours avec vous.
          </div>
        </div>

        {/* PRODUIT */}
        <div className="relative h-115 overflow-hidden rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_50%_34%,#ffffff_0%,#ffffff_25%,transparent_55%),linear-gradient(145deg,#f0f3f8,#e3e8f0)] shadow-[0_40px_100px_#18203314] md:h-140 xl:h-155 2xl:h-175">
          <div className="absolute inset-x-7 top-7 z-20 flex items-start justify-between md:inset-x-9 md:top-9">
            <div>
              <span className="block text-[8px] font-bold tracking-[1.6px] text-[#7f8691]">
                {product.brand.toUpperCase()}
              </span>

              <strong className="mt-1 block text-[13px] font-semibold tracking-[-0.2px] text-[#17191d]">
                {product.model}
              </strong>
            </div>

            <span className="text-[10px] font-medium text-[#616771]">
              {product.color}
            </span>
          </div>

          <AnimatedProduct />

          <div className="absolute bottom-7 left-7 z-20 md:bottom-9 md:left-9">
            <span className="text-[10px] font-medium text-[#616771]">
              Bluetooth {product.bluetoothVersion} · {product.musicTime}{' '}
              d’écoute · {product.range}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
