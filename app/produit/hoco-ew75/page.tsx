'use client';

import Container from '@/components/layout/Container';
import OrderButton from '@/components/shop/OrderButton';
import { useShop } from '@/components/shop/ShopProvider';
import { PRODUCTS } from '@/data/products';
import Image from 'next/image';

const product = PRODUCTS.ew75;

export default function HocoEW75Page() {
  const { offers } = useShop();
  const soloOffer = offers.solo;
  const duoOffer = offers.duo;
  const duoUnitPrice = duoOffer.price / duoOffer.quantity;
  return (
    <main className="min-h-screen bg-white text-[#17191d]">
      <Container className="py-8 md:py-12">
        <section className="grid items-stretch gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 2xl:gap-24">
          {/* VISUEL */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#f5f6f8] shadow-[0_30px_80px_#20293810]">
            <Image
              src="/images/hoco-ew75-features.png"
              alt={`${product.name} avec ses principales caractéristiques : Bluetooth ${product.bluetoothVersion}, jusqu’à ${product.musicTime} d’écoute, portée jusqu’à ${product.range} et commandes tactiles.`}
              width={1448}
              height={1086}
              priority
              className="h-auto w-full"
            />
          </div>

          {/* INFORMATIONS */}
          <div className="flex max-w-130 flex-col justify-center py-2 lg:py-12">
            <span className="text-[9px] font-bold tracking-[1.6px] text-[#747983] md:text-[10px]">
              ÉCOUTEURS SANS FIL
            </span>

            <h1 className="my-4 text-[50px] font-semibold leading-[0.95] tracking-[-2.8px] md:text-[64px] md:tracking-[-3.5px] 2xl:text-[82px]">
              {product.name}
            </h1>

            <p className="max-w-112.5 text-[12px] leading-7 text-[#72767f] md:text-sm 2xl:text-base">
              {product.description}
            </p>

            <div className="mt-8 flex items-center gap-5">
              <strong className="font-heading text-[34px] font-semibold tracking-[-1.7px] md:text-[38px] 2xl:text-[44px]">
                {soloOffer.price} €
              </strong>

              <span className="border-l border-[#e9eaed] pl-5 text-[11px] text-[#72767f] 2xl:text-[13px]">
                La paire
              </span>
            </div>

            <div className="mt-7 rounded-xl border border-[#eaedf3] bg-[#f5f7fb] p-5 md:p-6">
              <span className="mb-2 block text-[8px] font-bold tracking-[1.4px] text-[#235bfa]">
                OFFRE DUO
              </span>

              <strong className="block text-lg font-semibold md:text-xl">
                {duoOffer.quantity} paires pour {duoOffer.price} €
              </strong>

              <p className="mt-1.5 text-[10px] text-[#72767f] md:text-[11px]">
                Soit {duoUnitPrice} € la paire.
              </p>

              <OrderButton
                offerId="duo"
                className="font-heading mt-4 text-[11px] font-semibold text-[#235bfa] transition hover:text-[#1645cf]"
              >
                Choisir le Duo →
              </OrderButton>
            </div>

            <OrderButton
              offerId="solo"
              className="mt-6 w-full rounded-full bg-[#17191d] px-6 py-4.5 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#235bfa]"
            >
              Commander une paire
            </OrderButton>
          </div>
        </section>
      </Container>
    </main>
  );
}
