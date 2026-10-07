'use client';

import { ArrowRight, Check } from 'lucide-react';

import { useShop } from '@/components/shop/ShopProvider';
import { PRODUCTS } from '@/data/products';

const product = PRODUCTS.ew75;

export default function OffersSection() {
  const {
    selectedOffer,
    selectOffer,
    order,
    offers: currentOffers,
  } = useShop();
  const offers = Object.values(currentOffers);
  const duoSavings =
    currentOffers.solo.price * currentOffers.duo.quantity -
    currentOffers.duo.price;

  const offer = offers.find(
    (currentOffer) => currentOffer.id === selectedOffer,
  );

  if (!offer) {
    return null;
  }

  return (
    <section id="offres" className="bg-[#f7f8fa] py-16 md:py-24 2xl:py-30">
      <div className="mx-auto w-full max-w-310 px-5.5 md:px-12 xl:max-w-335 2xl:max-w-375 2xl:px-16">
        {/* INTRO */}
        <div className="mb-10 max-w-170 md:mb-14">
          <span className="text-[9px] font-bold tracking-[1.6px] text-[#7a8089] md:text-[10px]">
            CHOISISSEZ VOTRE FORMULE
          </span>

          <h2 className="mt-4 text-[38px] font-medium leading-none tracking-[-2px] md:text-[52px] md:tracking-[-2.8px]">
            Une paire.
            <br />
            Ou deux.
          </h2>

          <p className="mt-5 max-w-115 text-[11px] leading-[1.8] text-[#747982] md:text-sm">
            Même expérience. À vous de choisir comment en profiter.
          </p>
        </div>

        {/* OFFRES */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {offers.map((currentOffer) => {
            const isSelected = selectedOffer === currentOffer.id;

            const isDuo = currentOffer.id === 'duo';

            return (
              <button
                key={currentOffer.id}
                type="button"
                onClick={() => selectOffer(currentOffer.id)}
                aria-pressed={isSelected}
                className={`
                  group relative min-h-70 overflow-hidden rounded-[22px]
                  border p-6 text-left transition duration-300
                  md:min-h-85 md:p-8
                  ${
                    isSelected
                      ? 'border-[#17191d] bg-white shadow-[0_25px_70px_#2029380d]'
                      : 'border-[#e2e5ea] bg-white/60 hover:-translate-y-1 hover:border-[#bcc2cc] hover:bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <span className="text-[8px] font-bold tracking-[1.5px] text-[#90969f]">
                      {isDuo ? 'À PARTAGER' : 'POUR VOUS'}
                    </span>

                    <h3 className="mt-3 text-[21px] font-semibold tracking-[-0.8px] md:text-[25px]">
                      {currentOffer.title}
                    </h3>
                  </div>

                  <div
                    className={`
                      grid size-6 place-items-center rounded-full border
                      transition
                      ${
                        isSelected
                          ? 'border-[#17191d] bg-[#17191d] text-white'
                          : 'border-[#cbd0d8]'
                      }
                    `}
                  >
                    {isSelected && <Check size={13} strokeWidth={2} />}
                  </div>
                </div>

                <p className="mt-4 max-w-85 text-[11px] leading-[1.7] text-[#747982] md:text-xs">
                  {currentOffer.description}
                </p>

                {isDuo && duoSavings > 0 && (
                  <span className="mt-5 inline-flex rounded-full bg-[#edf2ff] px-3 py-1.5 text-[8px] font-bold text-[#235bfa]">
                    {duoSavings} € économisés
                  </span>
                )}

                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-5 md:inset-x-8 md:bottom-8">
                  <span className="text-[9px] leading-5 text-[#9a9fa8]">
                    {currentOffer.quantity} paire
                    {currentOffer.quantity > 1 ? 's' : ''}
                    <br />
                    {product.name} · {product.color}
                  </span>

                  <strong className="text-[38px] font-semibold leading-none tracking-[-2px] md:text-[46px]">
                    {currentOffer.price} €
                  </strong>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTION */}
        <div className="mt-5 flex flex-col justify-between gap-5 rounded-[18px] bg-[#17191d] px-6 py-5 text-white md:flex-row md:items-center md:px-8 md:py-6">
          <div>
            <span className="text-[8px] font-bold tracking-[1.5px] text-[#89909d]">
              VOTRE SÉLECTION
            </span>

            <div className="mt-1 flex items-center gap-3">
              <strong className="text-[15px] font-semibold md:text-[17px]">
                {offer.title}
              </strong>

              <span className="text-[12px] text-[#8f96a3]">·</span>

              <strong className="text-[15px] font-semibold md:text-[17px]">
                {offer.price} €
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => order()}
            className="group flex min-w-55 items-center justify-between gap-8 rounded-full bg-[#235bfa] px-6 py-4 text-xs font-semibold transition hover:bg-white hover:text-[#17191d]"
          >
            Commander
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
