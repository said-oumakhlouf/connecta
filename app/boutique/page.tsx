'use client';

import Image from 'next/image';
import { ArrowRight, Cable, Package, ShieldCheck } from 'lucide-react';
import { displayProductName } from '@/lib/product-display';
import Container from '@/components/layout/Container';
import { useShop } from '@/components/shop/ShopProvider';
import { formatPrice } from '@/lib/shop-pricing';
import { getCartStockAvailability } from '@/lib/multi-cart';

export default function CatalogPage() {
  const { catalog, catalogLoading, catalogError, cartItems, addProduct, openCart, isSubmitting, hasCheckoutAttempt, refreshProduct } = useShop();

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-20 text-[#17191d]">
      <Container className="pt-10 pb-16 md:pt-16 md:pb-20">
        <div className="mb-10 max-w-180 md:mb-12">
          <div className="max-w-170">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#235bfa]">LA SÉLECTION CONNECTA</span>
            <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-[-2px] md:text-[64px]">
              Votre quotidien. <span className="text-[#235bfa]">Connecté.</span>
            </h1>
            <p className="mt-5 max-w-130 text-sm leading-7 text-[#747982]">
              Des accessoires technologiques simples, utiles et sélectionnés pour vous accompagner au quotidien.
            </p>
            <p className="mt-5 inline-flex items-start gap-2 text-xs leading-5 text-[#747982]">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#235bfa]" aria-hidden="true" />
              <span>Boutique de démonstration · Produits fictifs et paiements de test, sans débit réel.</span>
            </p>
          </div>
        </div>
        {catalogLoading && <p role="status" className="text-sm text-[#747982]">Chargement des produits et des stocks…</p>}
        {catalogError && (
          <div role="alert" className="rounded-xl border border-[#f0c4c4] bg-white p-6 text-sm text-[#a43535]">
            {catalogError}
            <button type="button" onClick={() => void refreshProduct()} className="ml-3 font-semibold underline">Réessayer</button>
          </div>
        )}
        {!catalogLoading && !catalogError && catalog.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-sm">Aucun produit disponible pour le moment.</p>
        )}
        {hasCheckoutAttempt && (
          <div role="status" className="mb-6 rounded-2xl border border-[#f1d2aa] bg-[#fff8ee] p-5 text-sm text-[#835424]">
            <p className="font-semibold">Votre commande est en attente de paiement.</p>
            <p className="mt-1">
              Vos articles sont réservés quelques minutes. Finalisez le paiement, ou annulez la
              commande pour modifier votre panier.
            </p>
            <button type="button" onClick={openCart} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#235bfa] px-5 py-2.5 text-xs font-semibold text-white">
              Finaliser ma commande <ArrowRight size={14} />
            </button>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map(item => {
            const isHoco = item.slug === 'hoco-ew75';
            const isCable = item.slug.includes('cable');
            const availability = getCartStockAvailability(item, cartItems, hasCheckoutAttempt);
            const soldOut = !item.active || (item.stock < 1 && availability.inCart === 0);
            return (
              <article key={item.id} className="group flex overflow-hidden flex-col rounded-[24px] border border-[#e4e7ec] bg-white shadow-[0_10px_35px_#17203306] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_#17203316]">
                <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-[#f0f3f8]">
                  {isHoco ? (
                    <Image src="/images/hoco-ew75-features-800.webp" alt="Écouteurs Hoco EW75" width={800} height={600} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.025]" />
                  ) : (
                    <div className="grid size-26 place-items-center rounded-[26px] bg-white text-[#235bfa] shadow-sm">
                      {isCable ? <Cable size={48} strokeWidth={1.2} /> : <Package size={48} strokeWidth={1.2} />}
                    </div>
                  )}
                  {item.slug.endsWith('-test') && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-[#69717d]">Visuel de démonstration</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] font-bold tracking-[1.6px] text-[#90959e]">{isHoco ? 'ÉCOUTEURS SANS FIL' : 'ACCESSOIRES CONNECTA'}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.6px]">{displayProductName(item.name)}</h2>
                  {isHoco && item.duoPrice != null && item.duoPrice < item.price * 2 && (
                    <p className="mt-2 text-xs font-medium text-[#235bfa]">Offre Duo : 2 pour {formatPrice(item.duoPrice)}</p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-[#72767f]" aria-live="polite">
                    {soldOut ? (
                      <p>Épuisé</p>
                    ) : availability.inCart ? (
                      <p className="font-medium text-[#235bfa]">
                        {availability.inCart} {hasCheckoutAttempt ? (availability.inCart > 1 ? 'réservés' : 'réservé') : 'dans votre panier'}
                      </p>
                    ) : (
                      <p>Disponible</p>
                    )}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-7">
                    <strong className="text-2xl tracking-[-0.8px]">{formatPrice(item.price)}</strong>
                    <button type="button" disabled={isSubmitting || !availability.canAdd}
                      onClick={() => addProduct(item.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#235bfa] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#1748cb] disabled:cursor-not-allowed disabled:bg-[#b5bdca]">
                      Ajouter <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
