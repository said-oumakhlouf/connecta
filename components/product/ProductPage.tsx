'use client';

import {
  Bluetooth,
  ChevronDown,
  Clock3,
  CreditCard,
  Phone,
  RotateCcw,
  Truck,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import Container from '@/components/layout/Container';
import ProductGallery from '@/components/product/ProductGallery';
import { useShop } from '@/components/shop/ShopProvider';
import type { OfferId } from '@/data/offers';
import { PRODUCTS } from '@/data/products';
import {
  canOrderUnits,
  getOfferSavings,
  getOrderCta,
  getProductSpecs,
  getStockState,
  type StockState,
} from '@/lib/product-page';
import { formatPrice } from '@/lib/shop-pricing';

const product = PRODUCTS.ew75;
const SPECS = getProductSpecs();

const HIGHLIGHTS: { Icon: LucideIcon; value: string; label: string }[] = [
  { Icon: Bluetooth, value: product.bluetoothVersion, label: 'Bluetooth' },
  { Icon: Clock3, value: product.musicTime, label: 'D’écoute' },
  { Icon: Phone, value: product.callTime, label: 'D’appel' },
  { Icon: Wifi, value: product.range, label: 'De portée' },
];

const REASSURANCE: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: CreditCard,
    title: 'Paiement sécurisé',
    text: 'Règlement par carte via Stripe.',
  },
  {
    Icon: Truck,
    title: 'Livraison',
    text: 'Frais affichés dans le panier, avant le paiement.',
  },
  {
    Icon: RotateCcw,
    title: 'Rétractation — France',
    text: '14 jours après réception, selon les conditions applicables.',
  },
];

function StockBadge({ state }: { state: StockState }) {
  const styles: Record<StockState['kind'], { dot: string; text: string }> = {
    loading: { dot: 'bg-[#c9ccd2] animate-pulse', text: 'Vérification du stock…' },
    available: { dot: 'bg-[#1f9d55]', text: 'En stock' },
    low: { dot: 'bg-[#e08a00]', text: '' },
    out: { dot: 'bg-[#d64545]', text: 'Rupture de stock' },
    unavailable: { dot: 'bg-[#c9ccd2]', text: '' },
  };
  const { dot } = styles[state.kind];
  const text =
    state.kind === 'low'
      ? `Plus que ${state.stock} en stock`
      : state.kind === 'unavailable'
        ? state.message
        : styles[state.kind].text;

  return (
    <p role="status" className="flex items-center gap-2 text-[11px] font-medium text-[#4b4f57] 2xl:text-xs">
      <span aria-hidden className={`size-2 rounded-full ${dot}`} />
      {text}
    </p>
  );
}

export default function ProductPage() {
  const {
    offers,
    selectedOffer,
    selectOffer,
    order,
    product: apiProduct,
    productLoading,
    productError,
    refreshProduct,
    isSubmitting,
  } = useShop();

  const stock = getStockState({ loading: productLoading, error: productError, product: apiProduct });
  const pricesReady = apiProduct !== null;
  const solo = offers.solo;
  const duo = offers.duo;
  const duoSavings = getOfferSavings(solo.price, duo.price, duo.quantity);
  const current = offers[selectedOffer];
  const cta = getOrderCta({
    stock,
    quantity: current.quantity,
    isSubmitting,
    productLoaded: pricesReady,
  });

  const offerCards: { id: OfferId; badge?: string; note: string }[] = [
    { id: 'solo', note: 'Une paire' },
    {
      id: 'duo',
      badge: duoSavings.amount > 0 ? `−${duoSavings.percent} %` : undefined,
      note:
        duoSavings.amount > 0
          ? `${formatPrice(duoSavings.perUnit)} la paire · ${formatPrice(duoSavings.amount)} d’économie`
          : `${duo.quantity} paires`,
    },
  ];

  const ctaLabel =
    cta.status === 'submitting'
      ? 'Commande en cours…'
      : cta.status === 'checking'
        ? 'Vérification…'
        : cta.status === 'ready'
          ? selectedOffer === 'duo'
            ? 'Commander le Duo'
            : 'Commander une paire'
          : 'Indisponible';

  return (
    <main className="min-h-screen bg-white pb-24 text-[#17191d] md:pb-0">
      <Container className="py-6 md:py-10">
        <nav aria-label="Fil d’Ariane" className="mb-5 text-[10px] text-[#8a8f98] md:mb-8 md:text-[11px]">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-[#235bfa]">
                Accueil
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>Écouteurs sans fil</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-[#17191d]">
              {product.name}
            </li>
          </ol>
        </nav>

        <section className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 2xl:gap-24">
          <ProductGallery />

          <div className="flex max-w-130 flex-col lg:py-6">
            <span className="text-[9px] font-bold tracking-[1.6px] text-[#747983] md:text-[10px]">
              ÉCOUTEURS SANS FIL · {product.brand.toUpperCase()}
            </span>

            <h1 className="my-4 text-[46px] font-semibold leading-[0.95] tracking-[-2.6px] md:text-[64px] md:tracking-[-3.5px] 2xl:text-[82px]">
              {product.name}
            </h1>

            <p className="max-w-112.5 text-[12px] leading-7 text-[#72767f] md:text-sm 2xl:text-base">
              {product.description}
            </p>

            <ul className="mt-6 grid grid-cols-4 gap-2" aria-label="Points clés">
              {HIGHLIGHTS.map(({ Icon, value, label }) => (
                <li key={label} className="flex flex-col items-start gap-1 rounded-xl border border-[#eaedf3] px-3 py-3">
                  <Icon size={15} className="text-[#235bfa]" aria-hidden />
                  <strong className="font-heading text-[13px] font-semibold tracking-[-0.4px] md:text-sm">{value}</strong>
                  <span className="text-[9px] text-[#72767f] md:text-[10px]">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              {pricesReady ? (
                <div className="flex items-baseline gap-3">
                  <strong className="font-heading text-[34px] font-semibold tracking-[-1.7px] md:text-[38px] 2xl:text-[44px]">
                    {formatPrice(Math.round(current.price * 100))}
                  </strong>
                  <span className="text-[11px] text-[#72767f] 2xl:text-[13px]">
                    {current.quantity > 1 ? `les ${current.quantity} paires` : 'la paire'}
                  </span>
                </div>
              ) : (
                <span aria-hidden className="h-10 w-32 animate-pulse rounded-lg bg-[#f0f1f4]" />
              )}
              <StockBadge state={stock} />
            </div>

            <fieldset className="mt-5" disabled={!pricesReady || isSubmitting}>
              <legend className="mb-3 text-[9px] font-bold tracking-[1.4px] text-[#747983]">CHOISISSEZ VOTRE OFFRE</legend>
              <div className="grid grid-cols-2 gap-3">
                {offerCards.map(({ id, badge, note }) => {
                  const offer = offers[id];
                  const available = canOrderUnits(stock, offer.quantity);
                  const checked = selectedOffer === id;
                  return (
                    <label
                      key={id}
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#235bfa] md:p-5 ${
                        checked ? 'border-[#235bfa] bg-[#f5f7fb] shadow-[0_12px_30px_#235bfa14]' : 'border-[#e9eaed] hover:border-[#c9d4f5]'
                      } ${pricesReady && !available && stock.kind !== 'loading' ? 'opacity-60' : ''}`}
                    >
                      <input
                        type="radio"
                        name="offer"
                        value={id}
                        checked={checked}
                        onChange={() => selectOffer(id)}
                        className="sr-only"
                      />
                      {badge && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-[#235bfa] px-2 py-0.5 text-[9px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold tracking-[1.2px] ${checked ? 'text-[#235bfa]' : 'text-[#747983]'}`}>
                        {id === 'duo' ? 'OFFRE DUO' : 'SOLO'}
                      </span>
                      <strong className="font-heading mt-1.5 text-lg font-semibold tracking-[-0.6px] md:text-xl">
                        {pricesReady ? formatPrice(Math.round(offer.price * 100)) : '—'}
                      </strong>
                      <span className="mt-1 text-[10px] leading-4 text-[#72767f] md:text-[11px]">
                        {pricesReady && !available && stock.kind !== 'loading' ? 'Stock insuffisant' : note}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => order(selectedOffer)}
              disabled={cta.disabled}
              className="mt-6 w-full rounded-full bg-[#17191d] px-6 py-4.5 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#235bfa] disabled:cursor-not-allowed disabled:bg-[#c9ccd2] disabled:hover:translate-y-0"
            >
              {ctaLabel}
            </button>

            {stock.kind === 'unavailable' && !productLoading && (
              <button
                type="button"
                onClick={() => void refreshProduct()}
                className="mt-3 self-center text-[11px] font-semibold text-[#235bfa] hover:text-[#1645cf]"
              >
                Réessayer
              </button>
            )}

            <ul className="mt-7 grid gap-4 border-t border-[#e9eaed] pt-6">
              {REASSURANCE.map(({ Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5f7fb] text-[#235bfa]">
                    <Icon size={15} aria-hidden />
                  </span>
                  <span className="text-[11px] leading-5 2xl:text-xs">
                    <strong className="block font-semibold">{title}</strong>
                    <span className="text-[#72767f]">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="specs-title" className="mt-14 grid gap-6 border-t border-[#e9eaed] pt-10 md:mt-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:pt-14">
          <div>
            <span className="text-[9px] font-bold tracking-[1.6px] text-[#747983] md:text-[10px]">EN DÉTAIL</span>
            <h2 id="specs-title" className="mt-3 text-[30px] font-semibold leading-none tracking-[-1.4px] md:text-[40px]">
              Fiche technique
            </h2>
          </div>

          <details open className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 border-b border-[#e9eaed] pb-4 text-[12px] font-semibold marker:hidden 2xl:text-sm">
              Caractéristiques du {product.name}
              <ChevronDown size={18} className="shrink-0 text-[#858b96] transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <dl className="m-0">
              {SPECS.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-6 border-b border-[#f0f1f4] py-3.5 text-[12px] 2xl:text-sm">
                  <dt className="text-[#72767f]">{label}</dt>
                  <dd className="m-0 text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      </Container>
    </main>
  );
}
