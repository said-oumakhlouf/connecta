'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

import Container from '@/components/layout/Container';
import { useShop } from '@/components/shop/ShopProvider';
import { buttonSize, primaryButton } from '@/components/ui/button-styles';
import { PRODUCTS } from '@/data/products';
import { getOfferSavings } from '@/lib/product-page';
import { formatPrice } from '@/lib/shop-pricing';

const product = PRODUCTS.ew75;

/** Duo offer for the lead product. Prices are rendered only once they come from the API. */
export default function OffersSection() {
  const { selectedOffer, selectOffer, order, offers, product: apiProduct, isSubmitting } = useShop();
  const pricesReady = apiProduct !== null;
  const savings = getOfferSavings(offers.solo.price, offers.duo.price, offers.duo.quantity);
  const current = offers[selectedOffer];
  const price = (euros: number) => (pricesReady ? formatPrice(Math.round(euros * 100)) : '—');

  if (pricesReady && savings.amount === 0) return null;

  const cards = [
    {
      id: 'solo' as const,
      label: 'Solo',
      detail: `1 paire ${product.name} · ${product.color}`,
    },
    {
      id: 'duo' as const,
      label: 'Duo',
      detail: pricesReady
        ? `2 paires ${product.name} · ${formatPrice(savings.perUnit)} la paire`
        : `2 paires ${product.name}`,
    },
  ];

  return (
    <section id="offres" aria-labelledby="offres-title" className="bg-white py-16 md:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">Offre Duo</p>
            <h2 id="offres-title" className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-1.2px] text-ink md:text-[36px]">
              Deux paires de Hoco EW75, un prix réduit.
            </h2>
            <p className="mt-4 max-w-110 text-[15px] leading-7 text-muted">
              Pour équiper deux personnes ou garder une paire de rechange. La remise est appliquée
              automatiquement dans le panier.
            </p>
            <Link
              href="/produit/hoco-ew75"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Caractéristiques des Hoco EW75 <ArrowRight size={15} aria-hidden />
            </Link>
          </div>

          <div>
            <fieldset disabled={!pricesReady || isSubmitting}>
              <legend className="sr-only">Choisissez votre formule</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {cards.map(({ id, label, detail }) => {
                  const checked = selectedOffer === id;
                  return (
                    <label
                      key={id}
                      className={`relative flex cursor-pointer flex-col rounded-3xl border p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand md:p-6 ${
                        checked ? 'border-brand bg-[#f5f7fd]' : 'border-line bg-white hover:border-[#c9d4f5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="home-offer"
                        value={id}
                        checked={checked}
                        onChange={() => selectOffer(id)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold uppercase tracking-[1.2px] ${checked ? 'text-brand' : 'text-muted'}`}>
                          {label}
                        </span>
                        <span
                          aria-hidden
                          className={`grid size-5 place-items-center rounded-full border ${checked ? 'border-brand bg-brand text-white' : 'border-[#cbd0d8]'}`}
                        >
                          {checked && <Check size={12} strokeWidth={2.5} />}
                        </span>
                      </span>
                      <strong className="mt-4 text-[32px] font-semibold leading-none tracking-[-1.4px] text-ink">
                        {price(offers[id].price)}
                      </strong>
                      <span className="mt-2 text-[13px] text-muted">{detail}</span>
                      {id === 'duo' && pricesReady && (
                        <span className="mt-4 self-start rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
                          {formatPrice(savings.amount)} d’économie
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-ink px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#b9bec8]">
                Votre sélection :{' '}
                <strong className="font-semibold text-white">
                  {current.title} · {price(current.price)}
                </strong>
              </p>
              <button
                type="button"
                onClick={() => order()}
                disabled={!pricesReady || isSubmitting}
                className={`${primaryButton} ${buttonSize.lg}`}
              >
                Ajouter au panier <ArrowRight size={15} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
