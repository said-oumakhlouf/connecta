'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { buttonSize, primaryButton } from '@/components/ui/button-styles';
import { useShop } from '@/components/shop/ShopProvider';
import { getProductCategory, getProductHref, getProductVisual } from '@/lib/catalog-display';
import { getCartStockAvailability } from '@/lib/multi-cart';
import { displayProductName } from '@/lib/product-display';
import { formatPrice } from '@/lib/shop-pricing';
import type { ApiProduct } from '@/lib/shop-api';

/** Presentation state for one live catalogue product (prices and stock from the API only). */
export function useCatalogItem(item: ApiProduct) {
  const { cartItems, hasCheckoutAttempt, isSubmitting, addProduct } = useShop();
  const availability = getCartStockAvailability(item, cartItems, hasCheckoutAttempt);
  const soldOut = !item.active || (item.stock < 1 && availability.inCart === 0);
  const duoSavings =
    item.duoPrice != null && item.duoPrice < item.price * 2 ? item.price * 2 - item.duoPrice : 0;
  const status = soldOut
    ? 'Épuisé'
    : availability.inCart
      ? `${availability.inCart} ${hasCheckoutAttempt ? (availability.inCart > 1 ? 'réservés' : 'réservé') : 'dans votre panier'}`
      : 'Disponible';

  return {
    name: displayProductName(item.name),
    category: getProductCategory(item.slug),
    visual: getProductVisual(item.slug, item.imageUrl, item.name),
    href: getProductHref(item.slug),
    duoSavings,
    soldOut,
    inCart: availability.inCart > 0,
    status,
    canAdd: !isSubmitting && availability.canAdd,
    add: () => addProduct(item.id),
  };
}

export function StockStatus({ status, soldOut, inCart }: { status: string; soldOut: boolean; inCart: boolean }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${soldOut ? 'bg-[#c9ccd2]' : inCart ? 'bg-brand' : 'bg-[#1f9d55]'}`}
      />
      <span className={inCart ? 'font-medium text-brand' : undefined}>{status}</span>
    </p>
  );
}

export function AddButton({ canAdd, add, name, label = 'Ajouter' }: { canAdd: boolean; add: () => void; name: string; label?: string }) {
  return (
    <button
      type="button"
      disabled={!canAdd}
      onClick={add}
      aria-label={`Ajouter ${name} au panier`}
      className={`${primaryButton} ${buttonSize.md} shrink-0`}
    >
      <Plus size={15} aria-hidden /> {label}
    </button>
  );
}

type ProductCardProps = {
  item: ApiProduct;
  /** "grid": vertical catalogue card. "row": compact horizontal card for secondary products. */
  layout?: 'grid' | 'row';
  headingLevel?: 'h2' | 'h3';
};

export default function ProductCard({ item, layout = 'grid', headingLevel: Heading = 'h2' }: ProductCardProps) {
  const product = useCatalogItem(item);
  const { visual } = product;

  const media = (
    <Image
      src={visual.src}
      alt={visual.alt}
      width={visual.width}
      height={visual.height}
      className={`h-full w-full object-contain ${visual.padded ? 'p-4' : ''}`}
    />
  );
  const title = product.href ? (
    <Link href={product.href} className="hover:text-brand">
      {product.name}
    </Link>
  ) : (
    product.name
  );

  if (layout === 'row')
    return (
      <article className="flex gap-4 rounded-3xl border border-line bg-white p-4 sm:gap-5 sm:p-5">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-panel sm:size-28">
          {media}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">{product.category}</p>
          <Heading className="mt-1 text-base font-semibold tracking-[-0.3px] text-ink">{title}</Heading>
          <div className="mt-1">
            <StockStatus status={product.status} soldOut={product.soldOut} inCart={product.inCart} />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <strong className="text-lg tracking-[-0.4px] text-ink">{formatPrice(item.price)}</strong>
            <AddButton canAdd={product.canAdd} add={product.add} name={product.name} />
          </div>
        </div>
      </article>
    );

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white">
      <div className="grid aspect-[5/4] place-items-center overflow-hidden bg-panel">
        {product.href ? (
          <Link href={product.href} tabIndex={-1} aria-hidden className="block h-full w-full">
            {media}
          </Link>
        ) : (
          media
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">{product.category}</p>
        <Heading className="mt-2 text-xl font-semibold tracking-[-0.6px] text-ink">{title}</Heading>
        {product.duoSavings > 0 && item.duoPrice != null && (
          <p className="mt-2 text-[13px] font-semibold text-brand">
            Offre Duo · 2 pour {formatPrice(item.duoPrice)} · {formatPrice(product.duoSavings)} d’économie
          </p>
        )}
        <div className="mt-2">
          <StockStatus status={product.status} soldOut={product.soldOut} inCart={product.inCart} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-7">
          <strong className="text-2xl tracking-[-0.8px] text-ink">{formatPrice(item.price)}</strong>
          <AddButton canAdd={product.canAdd} add={product.add} name={product.name} />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'row' }) {
  return layout === 'row' ? (
    <div aria-hidden className="flex gap-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <div className="size-24 shrink-0 animate-pulse rounded-2xl bg-panel sm:size-28" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-3 w-24 animate-pulse rounded bg-panel" />
        <div className="h-4 w-40 animate-pulse rounded bg-panel" />
        <div className="h-6 w-20 animate-pulse rounded bg-panel" />
      </div>
    </div>
  ) : (
    <div aria-hidden className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="aspect-[5/4] animate-pulse bg-panel" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-panel" />
        <div className="h-5 w-44 animate-pulse rounded bg-panel" />
        <div className="h-7 w-24 animate-pulse rounded bg-panel" />
      </div>
    </div>
  );
}
