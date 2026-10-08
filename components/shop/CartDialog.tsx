'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, LoaderCircle, Minus, Plus, X } from 'lucide-react';
import ProductVisual from '@/components/product/ProductVisual';
import BrandName from '@/components/layout/BrandName';
import { useShop } from '@/components/shop/ShopProvider';
import { PRODUCTS } from '@/data/products';
import { formatPrice } from '@/lib/shop-pricing';

export default function CartDialog() {
  const {
    dialogRef,
    cart,
    cartOffer,
    cartCount,
    cartTotal,
    cartDiscount,
    maxCartCount,
    product,
    productLoading,
    productError,
    orderError,
    isSubmitting,
    hasCheckoutAttempt,
    closeCart,
    submitOrder,
    refreshProduct,
    updateCartQuantity,
  } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const unavailable = product && (!product.active || product.stock === 0);
  const insufficientStock = product && cartCount > product.stock;
  const canSubmit =
    !!product &&
    !productLoading &&
    !productError &&
    (hasCheckoutAttempt || (!unavailable && !insufficientStock)) &&
    !isSubmitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitOrder({ customerName, customerEmail });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-title"
      onClose={closeCart}
      onCancel={(event) => {
        if (isSubmitting) event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-120 overflow-y-auto rounded-[22px] border-0 p-0 text-[#17191d] shadow-[0_30px_100px_#0003] backdrop:bg-[#151a2466] backdrop:backdrop-blur-[6px]"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[9px] font-bold tracking-[1.5px] text-[#90959e]">
              <BrandName />
            </span>
            <h2
              id="cart-title"
              className="mt-1 text-[26px] font-medium tracking-[-1.2px]"
            >
              Votre panier
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            disabled={isSubmitting}
            aria-label="Fermer le panier"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f5f7] transition hover:bg-[#e9ebef] disabled:opacity-40"
          >
            <X size={17} />
          </button>
        </div>

        {cart && cartOffer ? (
          <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f7f8fa] p-3 sm:gap-4 sm:p-4">
              <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-white">
                <div className="h-75 w-80 origin-top-left scale-[0.225]">
                  <ProductVisual variant="case" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold tracking-[1.2px] text-[#90959e]">
                  {cartOffer.id === 'duo' ? 'PACK DUO' : 'SOLO'}
                </span>
                <h3 className="mt-1 text-base font-semibold">
                  {product?.name ?? PRODUCTS.ew75.name}
                </h3>
                <p className="mt-1 text-xs text-[#72767f]">
                  {PRODUCTS.ew75.color} · {cartOffer.title}
                </p>
              </div>
              <strong className="shrink-0 text-lg font-semibold tracking-[-0.8px]">
                {formatPrice(cartOffer.price * 100)}
              </strong>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-[#e9eaed] pb-5">
              <div>
                <span className="block text-sm font-medium">
                  {cartOffer.id === 'duo'
                    ? 'Nombre de packs'
                    : 'Nombre de paires'}
                </span>
                <span className="mt-1 block text-xs text-[#8b9098]">
                  {cartCount} paire{cartCount > 1 ? 's' : ''} au total
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  disabled={cart.count <= 1 || isSubmitting || productLoading}
                  onClick={() => updateCartQuantity(-1)}
                  className="grid size-9 place-items-center rounded-full border border-[#e0e3e8] bg-white disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span
                  aria-live="polite"
                  className="min-w-5 text-center text-sm font-semibold"
                >
                  {cart.count}
                </span>
                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  disabled={
                    cart.count >= maxCartCount || isSubmitting || productLoading
                  }
                  onClick={() => updateCartQuantity(1)}
                  className="grid size-9 place-items-center rounded-full border border-[#e0e3e8] bg-white disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-3 text-xs text-[#72767f]">
              {productLoading
                ? 'Vérification du prix et du stock…'
                : product
                  ? `${product.stock} paire(s) en stock`
                  : null}
            </div>
            {(productError || unavailable || insufficientStock) && (
              <div
                role="alert"
                className="mt-3 rounded-xl bg-[#fff1f0] p-3 text-xs leading-5 text-[#ae302a]"
              >
                {productError ??
                  (unavailable
                    ? 'Ce produit est actuellement épuisé.'
                    : 'La quantité demandée dépasse le stock disponible. Diminuez la quantité ou choisissez une paire Solo.')}
                {productError && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      void refreshProduct();
                    }}
                    className="mt-2 block font-semibold underline"
                  >
                    Actualiser la disponibilité
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 space-y-3 border-b border-[#e9eaed] pb-5 text-sm">
              {cartDiscount > 0 && (
                <div className="flex justify-between text-[#235bfa]">
                  <span>Remise Duo appliquée</span>
                  <span>−{formatPrice(cartDiscount)}</span>
                </div>
              )}
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[#72767f]">Total</span>
                  <span className="mt-1 block text-[10px] text-[#a0a5ad]">
                    Hors livraison
                  </span>
                </div>
                <strong className="text-[30px] font-semibold tracking-[-1.5px]">
                  {formatPrice(cartTotal)}
                </strong>
              </div>
            </div>

            <fieldset
              disabled={isSubmitting}
              className="mt-5 min-w-0 space-y-4 border-0 p-0"
            >
              <legend className="mb-4 text-sm font-semibold">
                Vos coordonnées
              </legend>
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-2 block text-xs font-medium"
                >
                  Nom complet
                </label>
                <input
                  id="customer-name"
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-xl border border-[#e0e3e8] bg-white px-4 py-3 text-base outline-none focus:border-[#235bfa] focus:ring-2 focus:ring-[#235bfa20]"
                />
              </div>
              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-2 block text-xs font-medium"
                >
                  Adresse email
                </label>
                <input
                  id="customer-email"
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#e0e3e8] bg-white px-4 py-3 text-base outline-none focus:border-[#235bfa] focus:ring-2 focus:ring-[#235bfa20]"
                />
              </div>
            </fieldset>

            {orderError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-[#fff1f0] p-3 text-xs leading-5 text-[#ae302a]"
              >
                {orderError}
              </p>
            )}
            {hasCheckoutAttempt && (
              <p className="mt-3 text-xs leading-5 text-[#72767f]">
                Une tentative existe déjà. Réessayez avec les mêmes coordonnées
                et quantités pour la reprendre, ou{' '}
                <a href="/paiement?retour=1" className="underline">
                  vérifiez votre réservation
                </a>
                .
              </p>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 flex w-full items-center justify-between rounded-full bg-[#235bfa] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1645cf] disabled:cursor-default disabled:opacity-45"
            >
              {isSubmitting ? 'Préparation du paiement…' : 'Passer au paiement'}
              {isSubmitting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <ArrowRight size={15} />
              )}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#8b9098]">
              Paiement Stripe en mode test : aucun débit réel. Articles réservés
              environ 30 minutes.
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={closeCart}
              className="mt-3 w-full bg-transparent text-xs text-[#72767f] transition hover:text-[#17191d] disabled:opacity-40"
            >
              Continuer mes achats
            </button>
          </form>
        ) : null}
      </div>
    </dialog>
  );
}
