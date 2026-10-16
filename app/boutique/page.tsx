'use client';

import { ArrowRight } from 'lucide-react';
import { orderStorefrontProducts } from '@/lib/catalog-display';
import Container from '@/components/layout/Container';
import ProductCard, { ProductCardSkeleton } from '@/components/shop/ProductCard';
import { useShop } from '@/components/shop/ShopProvider';

export default function CatalogPage() {
  const { catalog, catalogLoading, catalogError, openCart, hasCheckoutAttempt, refreshProduct } = useShop();

  const featuredCatalog = orderStorefrontProducts(catalog);

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-20 text-[#17191d]">
      <Container className="pt-10 pb-16 md:pt-16 md:pb-20">
        <div className="mb-10 max-w-180 md:mb-12">
          <div className="max-w-170">
            <span className="text-[11px] font-semibold uppercase tracking-[1.6px] text-brand">La boutique CONNECTA</span>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.05] tracking-[-1.6px] md:text-[52px] md:tracking-[-2.4px]">
              Tous nos accessoires
            </h1>
            <p className="mt-4 max-w-130 text-[15px] leading-7 text-muted">
              Écouteurs sans fil, câbles et chargeurs. Les frais de livraison sont affichés dans le
              panier, avant le paiement.
            </p>
          </div>
        </div>
        {catalogLoading && <p role="status" className="sr-only">Chargement des produits et des stocks…</p>}
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
          {catalogLoading && catalog.length === 0
            ? [0, 1, 2].map(index => <ProductCardSkeleton key={index} />)
            : featuredCatalog.map(item => <ProductCard key={item.id} item={item} />)}
        </div>
        {catalog.length > 0 && (
          <p className="mt-6 text-xs text-muted">Visuels d’illustration non contractuels.</p>
        )}
      </Container>
    </main>
  );
}
