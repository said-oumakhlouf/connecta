'use client';

import { ArrowRight, Check, Minus, Plus, X } from 'lucide-react';

import ProductVisual from '@/components/product/ProductVisual';
import { useShop } from '@/components/shop/ShopProvider';
import { PRODUCTS } from '@/data/products';

const product = PRODUCTS.ew75;

export default function CartDialog() {
  const {
    dialogRef,
    cart,
    cartOffer,
    orderComplete,
    closeCart,
    completeOrder,
    updateCartQuantity,
  } = useShop();

  return (
    <dialog
      ref={dialogRef}
      onClose={closeCart}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeCart();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-110 rounded-[14px] border-0 p-0 text-[#17191d] shadow-[0_30px_120px_#0003] backdrop:bg-[#151a2466] backdrop:backdrop-blur-[5px]"
    >
      <div className="p-7">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-2xl font-medium tracking-[-1px]">
            {orderComplete ? 'Merci pour le test !' : 'Votre panier'}
          </h2>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="grid place-items-center bg-transparent p-1.25"
          >
            <X size={22} />
          </button>
        </div>

        {orderComplete ? (
          <>
            {/* SUCCESS */}
            <div className="mx-auto mb-5 mt-7.5 grid size-15 place-items-center rounded-full bg-[#edf2ff] text-[#235bfa]">
              <Check size={24} />
            </div>

            <p className="text-xs leading-[1.8] text-[#72767f]">
              Le parcours de commande fonctionne. Aucune commande n’a été passée
              et aucun montant n’a été débité.
            </p>

            <button
              type="button"
              onClick={closeCart}
              className="mt-2.5 flex w-full items-center justify-between gap-7.5 rounded-lg bg-[#235bfa] px-5.5 py-4.25 text-xs font-semibold text-white transition hover:-translate-y-px hover:bg-[#1645cf]"
            >
              Continuer la découverte
              <ArrowRight size={18} />
            </button>
          </>
        ) : cart && cartOffer ? (
          <>
            {/* PRODUCT */}
            <div className="flex items-center gap-5 py-7.5">
              <div className="h-25 w-23.75 shrink-0 overflow-hidden rounded-lg bg-[#f6f7f9]">
                <div className="h-75 w-80 origin-top-left scale-30">
                  <ProductVisual variant="case" />
                </div>
              </div>

              <div>
                <h3 className="m-0 mb-2 text-base font-medium">{product.name}</h3>

                <p className="m-0 mb-2 text-xs text-[#72767f]">
                  {cartOffer.title} · {product.color}
                </p>

                <strong className="text-base font-semibold">
                  {cartOffer.price} €
                </strong>
              </div>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center justify-between border-t border-[#e9eaed] py-4.5 text-xs">
              <span>
                Quantité {cart.id === 'duo' ? 'de packs' : 'de paires'}
              </span>

              <div className="flex items-center gap-3.75">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  disabled={cart.count <= 1}
                  onClick={() => updateCartQuantity(-1)}
                  className="grid size-7.5 place-items-center rounded-[5px] border border-[#e9eaed] bg-white disabled:cursor-default disabled:opacity-35"
                >
                  <Minus size={16} />
                </button>

                <span aria-live="polite" className="min-w-4 text-center">
                  {cart.count}
                </span>

                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  disabled={cart.count >= 10}
                  onClick={() => updateCartQuantity(1)}
                  className="grid size-7.5 place-items-center rounded-[5px] border border-[#e9eaed] bg-white disabled:cursor-default disabled:opacity-35"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* TOTAL */}
            <div className="flex items-center justify-between border-t border-[#e9eaed] py-4.5 text-xs">
              <span>Total</span>

              <strong className="text-[25px] font-semibold tracking-[-1px]">
                {cartOffer.price * cart.count} €
              </strong>
            </div>

            {/* DISCLAIMER */}
            <p className="rounded-[5px] bg-[#f6f7f9] p-3.25 text-[11px] leading-[1.7] text-[#72767f]">
              Panier simulé. Livraison à préciser au lancement. Aucun paiement
              réel.
            </p>

            {/* ORDER */}
            <button
              type="button"
              onClick={completeOrder}
              className="mt-2.5 w-full rounded-lg bg-[#235bfa] px-5.5 py-4.25 text-xs font-semibold text-white transition hover:-translate-y-px hover:bg-[#1645cf]"
            >
              Tester la commande
            </button>

            <button
              type="button"
              onClick={closeCart}
              className="mt-4.25 w-full border-0 bg-transparent text-[11px] text-[#72767f] transition-colors hover:text-[#17191d]"
            >
              Continuer mes découvertes
            </button>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
