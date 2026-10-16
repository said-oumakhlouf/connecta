'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Container from '@/components/layout/Container';
import ProductCard, {
  AddButton,
  ProductCardSkeleton,
  StockStatus,
  useCatalogItem,
} from '@/components/shop/ProductCard';
import { useShop } from '@/components/shop/ShopProvider';
import { buttonSize, secondaryButton } from '@/components/ui/button-styles';
import { PRODUCTS } from '@/data/products';
import { LEAD_PRODUCT_SLUG, orderStorefrontProducts } from '@/lib/catalog-display';
import type { ApiProduct } from '@/lib/shop-api';
import { formatPrice } from '@/lib/shop-pricing';

const lead = PRODUCTS.ew75;

/** Lead product card: static technical facts, live price, stock and Duo price from the API. */
function FeaturedProduct({ item }: { item: ApiProduct }) {
  const product = useCatalogItem(item);
  const { visual } = product;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white md:flex-row">
      <Link
        href={product.href ?? '/boutique'}
        tabIndex={-1}
        aria-hidden
        className="grid aspect-[4/3] place-items-center bg-panel md:w-1/2 md:shrink-0 md:self-stretch md:aspect-auto"
      >
        <Image
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          priority
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-center p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
            Produit phare
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
            {product.category}
          </span>
        </div>

        <h3 className="mt-3 text-[26px] font-semibold tracking-[-1px] text-ink md:text-[30px]">
          <Link href={product.href ?? '/boutique'} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Bluetooth {lead.bluetoothVersion} · jusqu’à {lead.musicTime} d’écoute · portée jusqu’à{' '}
          {lead.range} · boîtier de recharge.
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="flex items-baseline gap-2">
            <strong className="text-[30px] font-semibold tracking-[-1.2px] text-ink">
              {formatPrice(item.price)}
            </strong>
            <span className="text-xs text-muted">la paire</span>
          </p>
          <StockStatus status={product.status} soldOut={product.soldOut} inCart={product.inCart} />
        </div>

        {product.duoSavings > 0 && item.duoPrice != null && (
          <a
            href="#offres"
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-[13px] text-ink transition-colors hover:bg-[#e2eaff]"
          >
            <span>
              <strong className="font-semibold text-brand">Offre Duo</strong> · 2 paires pour{' '}
              {formatPrice(item.duoPrice)}, soit {formatPrice(product.duoSavings)} d’économie
            </span>
            <ArrowRight size={15} className="shrink-0 text-brand" aria-hidden />
          </a>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <AddButton canAdd={product.canAdd} add={product.add} name={product.name} label="Ajouter au panier" />
          {product.href && (
            <Link href={product.href} className={`${secondaryButton} ${buttonSize.md}`}>
              Voir la fiche
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProductShowcase() {
  const { catalog, catalogLoading, catalogError, refreshProduct } = useShop();
  const ordered = orderStorefrontProducts(catalog);
  const featured = ordered.find((item) => item.slug === LEAD_PRODUCT_SLUG);
  const others = ordered.filter((item) => item !== featured);

  return (
    <section id="selection" aria-labelledby="selection-title" className="bg-panel pb-16 md:pb-24">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-10 md:mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">
              La sélection
            </p>
            <h2 id="selection-title" className="mt-2 text-[28px] font-semibold tracking-[-1.2px] text-ink md:text-[36px]">
              Nos accessoires
            </h2>
          </div>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Tout voir dans la boutique <ArrowRight size={15} aria-hidden />
          </Link>
        </div>

        {catalogError ? (
          <div role="alert" className="rounded-2xl border border-[#f0c4c4] bg-white p-6 text-sm text-[#a43535]">
            {catalogError}
            <button type="button" onClick={() => void refreshProduct()} className="ml-3 font-semibold underline">
              Réessayer
            </button>
          </div>
        ) : catalogLoading && catalog.length === 0 ? (
          <div className="grid gap-5" role="status" aria-label="Chargement des produits">
            <ProductCardSkeleton />
            <div className="grid gap-5 md:grid-cols-2">
              <ProductCardSkeleton layout="row" />
              <ProductCardSkeleton layout="row" />
            </div>
          </div>
        ) : catalog.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-muted">Aucun produit disponible pour le moment.</p>
        ) : (
          <div className="grid gap-5">
            {featured && <FeaturedProduct item={featured} />}
            {others.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {others.map((item) => (
                  <ProductCard key={item.id} item={item} layout="row" headingLevel="h3" />
                ))}
              </div>
            )}
          </div>
        )}

        {catalog.length > 0 && (
          <p className="mt-5 text-xs text-muted">Visuels d’illustration non contractuels.</p>
        )}
      </Container>
    </section>
  );
}
