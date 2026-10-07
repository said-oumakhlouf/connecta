'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import BrandName from '@/components/layout/BrandName';

import AnimatedProduct from '@/components/product/AnimatedProduct';
import { useShop } from '@/components/shop/ShopProvider';
import { PRODUCTS } from '@/data/products';

const product = PRODUCTS.ew75;

export default function Hero() {
  const { order, offers } = useShop();
  const soloOffer = offers.solo;

  return (
    <section id="produit" className="relative overflow-hidden bg-[#f7f8fa]">
      <div className="pointer-events-none absolute -left-40 top-20 size-120 rounded-full bg-[#235bfa08] blur-3xl" />

      <div className="mx-auto grid w-full max-w-310 grid-cols-1 items-center gap-8 px-4 py-9 sm:px-5.5 sm:py-11 md:min-h-[calc(100vh-90px)] md:grid-cols-[0.85fr_1.15fr] md:gap-10 md:px-12 md:py-16 xl:max-w-335 xl:gap-16 2xl:max-w-375 2xl:gap-24 2xl:px-16">
        {/* TEXTE */}
        <div className="relative z-10 max-w-135 2xl:max-w-155">
          <div className="mb-5 flex items-center gap-2.5 text-[8px] font-bold uppercase tracking-[1.4px] text-[#7a8089] sm:text-[9px] md:mb-7 md:gap-3 md:text-[10px] md:tracking-[1.7px]">
            <span className="h-px w-5 bg-[#235bfa] md:w-7" />
            <BrandName /> / ÉCOUTEURS SANS FIL
          </div>

          <h1 className="max-w-140 text-[38px] font-semibold leading-[1.02] tracking-[-1.8px] text-[#17191d] sm:text-[44px] sm:tracking-[-2px] md:text-[56px] md:leading-[0.98] md:tracking-[-2.6px] xl:text-[64px] 2xl:text-[76px] 2xl:tracking-[-3.5px]">
            Des écouteurs simples.
            <br />
            Pour tous les jours.
            <br />
            <span className="text-[#235bfa]">Sans les fils.</span>
          </h1>

          <p className="mt-5 max-w-110 text-[12px] leading-[1.75] text-[#70757e] sm:text-[13px] md:mt-7 md:text-sm md:leading-[1.9] 2xl:text-[16px]">
            Bluetooth {product.bluetoothVersion}, jusqu’à {product.musicTime}{' '}
            d’écoute et un boîtier compact. Les {product.name} vont à
            l’essentiel.
          </p>

          <div className="mt-6 flex items-end gap-3 md:mt-8 md:gap-4">
            <strong className="font-heading text-[34px] font-semibold leading-none tracking-[-1.7px] text-[#17191d] md:text-[44px] md:tracking-[-2px]">
              {soloOffer.price} €
            </strong>

            <span className="pb-1 text-[10px] text-[#7c818a] md:text-[11px]">
              la paire
            </span>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
            <button
              type="button"
              onClick={() => order('solo')}
              className="group flex min-w-46 items-center justify-between gap-6 rounded-full bg-[#17191d] px-5 py-3.5 text-[11px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#235bfa] sm:min-w-52.5 sm:px-6 sm:py-4 md:min-w-55 md:gap-8 md:py-4.5 md:text-xs"
            >
              Commander
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <Link
              href="/produit/hoco-ew75"
              className="font-heading group inline-flex items-center gap-2 text-[10px] font-semibold text-[#51565f] transition hover:text-[#235bfa] md:text-[11px]"
            >
              Voir la fiche produit
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[9px] text-[#969ba3] md:mt-7 md:text-[10px]">
            <Check size={13} strokeWidth={1.8} />
            Simple. Compact. Toujours avec vous.
          </div>
        </div>

        {/* PRODUIT */}
        <div className="relative h-95 overflow-hidden rounded-[22px] border border-white/80 bg-[radial-gradient(circle_at_50%_34%,#ffffff_0%,#ffffff_25%,transparent_55%),linear-gradient(145deg,#f0f3f8,#e3e8f0)] shadow-[0_30px_70px_#18203312] sm:h-110 md:h-140 md:rounded-[28px] md:shadow-[0_40px_100px_#18203314] xl:h-155 2xl:h-175">
          <div className="absolute inset-x-5 top-5 z-20 flex items-start justify-between md:inset-x-9 md:top-9">
            <div>
              <span className="block text-[7px] font-bold tracking-[1.5px] text-[#7f8691] md:text-[8px] md:tracking-[1.6px]">
                {product.brand.toUpperCase()}
              </span>

              <strong className="mt-1 block text-[12px] font-semibold tracking-[-0.2px] text-[#17191d] md:text-[13px]">
                {product.model}
              </strong>
            </div>

            <span className="text-[9px] font-medium text-[#616771] md:text-[10px]">
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
