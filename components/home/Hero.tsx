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

      <div className="mx-auto grid w-full max-w-310 grid-cols-1 items-center gap-8 px-5.5 py-9 md:min-h-[calc(100vh-110px)] md:grid-cols-[0.85fr_1.15fr] md:gap-10 md:px-12 md:py-16 xl:max-w-335 xl:gap-16 2xl:max-w-375 2xl:gap-24 2xl:px-16">
        {/* TEXTE */}
        <div className="relative z-10 max-w-135 2xl:max-w-155">
          <div className="mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[1.5px] text-[#7a8089] md:mb-7 md:text-[10px] md:tracking-[1.7px]">
            <span className="h-px w-7 bg-[#235bfa]" />
            {SITE.name} / ÉCOUTEURS SANS FIL
          </div>

          <h1 className="max-w-140 text-[42px] font-semibold leading-[0.96] tracking-[-2.2px] text-[#17191d] sm:text-[48px] md:text-[66px] md:tracking-[-4px] xl:text-[78px] 2xl:text-[90px] 2xl:tracking-[-5px]">
            Des écouteurs simples.
            <br />
            Pour tous les jours.
          </h1>

          <p className="mt-5 max-w-110 text-[13px] leading-[1.8] text-[#70757e] md:mt-7 md:text-sm 2xl:text-[16px]">
            Bluetooth {product.bluetoothVersion}, jusqu’à {product.musicTime}{' '}
            d’écoute et un boîtier compact. Les {product.name} vont à
            l’essentiel.
          </p>

          <div className="mt-6 flex items-end gap-3 md:mt-8 md:gap-4">
            <strong className="text-[34px] font-semibold leading-none tracking-[-1.8px] text-[#17191d] md:text-[44px]">
              {soloOffer.price} €
            </strong>

            <span className="pb-1 text-[11px] text-[#7c818a]">la paire</span>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8 md:gap-4">
            <button
              type="button"
              onClick={() => order('solo')}
              className="group flex w-full items-center justify-between gap-8 rounded-full bg-[#17191d] px-6 py-4 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#235bfa] sm:w-auto sm:min-w-55 md:py-4.5"
            >
              Commander
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <Link
              href="/produit/hoco-ew75"
              className="group inline-flex items-center gap-2 px-1 text-[11px] font-semibold text-[#51565f] transition hover:text-[#235bfa]"
            >
              Voir la fiche produit
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[10px] text-[#969ba3] md:mt-7">
            <Check size={13} strokeWidth={1.8} />
            Simple. Compact. Toujours avec vous.
          </div>
        </div>

        {/* PRODUIT */}
        <div className="relative h-96 overflow-hidden rounded-[22px] border border-white/80 bg-[radial-gradient(circle_at_50%_34%,#ffffff_0%,#ffffff_25%,transparent_55%),linear-gradient(145deg,#f0f3f8,#e3e8f0)] shadow-[0_30px_70px_#18203312] sm:h-105 md:h-140 md:rounded-[28px] md:shadow-[0_40px_100px_#18203314] xl:h-155 2xl:h-175">
          <div className="absolute inset-x-5 top-5 z-20 flex items-start justify-between md:inset-x-9 md:top-9">
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

          <div className="absolute bottom-5 left-5 z-20 md:bottom-9 md:left-9">
            <span className="text-[9px] font-medium text-[#616771] md:text-[10px]">
              Bluetooth {product.bluetoothVersion} · {product.musicTime}{' '}
              d’écoute · {product.range}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
