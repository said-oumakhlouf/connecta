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

  const totalPairs = cart && cartOffer ? cart.count * cartOffer.quantity : 0;
  const totalPrice = cart && cartOffer ? cart.count * cartOffer.price : 0;
  const pricePerPair = cartOffer ? cartOffer.price / cartOffer.quantity : 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={closeCart}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeCart();
        }
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-110 rounded-[18px] border-0 p-0 text-[#17191d] shadow-[0_30px_100px_#0003] backdrop:bg-[#151a2466] backdrop:backdrop-blur-[6px] sm:w-[calc(100%-2rem)] sm:max-w-120 sm:rounded-[22px]"
    >
      <div className="p-4 sm:p-6 md:p-8">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[8px] font-bold tracking-[1.4px] text-[#90959e] sm:text-[9px] sm:tracking-[1.5px]">
              CONNECTA
            </span>

            <h2 className="mt-1 text-[22px] font-medium tracking-[-1px] sm:text-[26px] sm:tracking-[-1.2px]">
              {orderComplete ? 'Panier validé' : 'Votre panier'}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="grid size-8.5 place-items-center rounded-full bg-[#f4f5f7] transition hover:bg-[#e9ebef] sm:size-10"
          >
            <X size={17} />
          </button>
        </div>

        {orderComplete ? (
          <>
            <div className="mx-auto mb-5 mt-7 grid size-13 place-items-center rounded-full bg-[#edf2ff] text-[#235bfa] sm:mb-6 sm:mt-10 sm:size-16">
              <Check size={23} />
            </div>

            <div className="text-center">
              <h3 className="text-[17px] font-semibold sm:text-xl">
                Votre panier est prêt.
              </h3>

              <p className="mx-auto mt-2.5 max-w-80 text-[11px] leading-[1.7] text-[#72767f] sm:mt-3 sm:text-[12px] sm:leading-[1.8]">
                L’étape de commande complète sera ajoutée lorsque le paiement et
                la livraison seront connectés.
              </p>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="mt-6 flex w-full items-center justify-between rounded-full bg-[#17191d] px-5 py-3.5 text-[11px] font-semibold text-white transition hover:bg-[#235bfa] sm:mt-8 sm:px-6 sm:py-4 sm:text-xs"
            >
              Continuer
              <ArrowRight size={15} />
            </button>
          </>
        ) : cart && cartOffer ? (
          <>
            {/* PRODUCT */}
            <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-[#f7f8fa] p-3 sm:mt-8 sm:gap-5 sm:rounded-[18px] sm:p-4 md:p-5">
              <div className="h-18 w-18 shrink-0 overflow-hidden rounded-[10px] bg-white sm:h-24 sm:w-24 sm:rounded-[14px]">
                <div className="h-75 w-80 origin-top-left scale-[0.225] sm:scale-30">
                  <ProductVisual variant="case" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-bold tracking-[1.2px] text-[#90959e] sm:text-[9px] sm:tracking-[1.3px]">
                  {cartOffer.id === 'duo' ? 'PACK DUO' : 'SOLO'}
                </span>

                <h3 className="mt-0.5 text-[14px] font-semibold sm:mt-1 sm:text-[17px]">
                  {product.name}
                </h3>

                <p className="mt-0.5 text-[9px] text-[#72767f] sm:mt-1 sm:text-[11px]">
                  {product.color} · {cartOffer.title}
                </p>
              </div>

              <strong className="shrink-0 text-[18px] font-semibold tracking-[-0.8px] sm:text-[22px] sm:tracking-[-1px]">
                {cartOffer.price} €
              </strong>
            </div>

            {/* QUANTITY */}
            <div className="mt-5 flex items-center justify-between border-b border-[#e9eaed] pb-4 sm:mt-7 sm:pb-5">
              <div>
                <span className="block text-[11px] font-medium sm:text-[12px]">
                  Quantité
                </span>

                <span className="mt-0.5 block text-[9px] text-[#8b9098] sm:mt-1 sm:text-[10px]">
                  {totalPairs} paire{totalPairs > 1 ? 's' : ''} au total
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  disabled={cart.count <= 1}
                  onClick={() => updateCartQuantity(-1)}
                  className="grid size-8 place-items-center rounded-full border border-[#e0e3e8] bg-white transition hover:border-[#bfc5ce] disabled:cursor-default disabled:opacity-30 sm:size-9"
                >
                  <Minus size={14} />
                </button>

                <span
                  aria-live="polite"
                  className="min-w-4 text-center text-[12px] font-semibold sm:min-w-5 sm:text-sm"
                >
                  {cart.count}
                </span>

                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  disabled={cart.count >= 10}
                  onClick={() => updateCartQuantity(1)}
                  className="grid size-8 place-items-center rounded-full border border-[#e0e3e8] bg-white transition hover:border-[#bfc5ce] disabled:cursor-default disabled:opacity-30 sm:size-9"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* DETAILS */}
            <div className="space-y-2.5 border-b border-[#e9eaed] py-4 text-[10px] sm:space-y-3 sm:py-5 sm:text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#7d828b]">Prix par paire</span>
                <span>{pricePerPair} €</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7d828b]">Nombre de paires</span>
                <span>{totalPairs}</span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="flex items-end justify-between py-4.5 sm:py-6">
              <div>
                <span className="block text-[10px] text-[#72767f] sm:text-[11px]">
                  Total
                </span>

                <span className="mt-0.5 block text-[8px] text-[#a0a5ad] sm:mt-1 sm:text-[9px]">
                  Hors livraison
                </span>
              </div>

              <strong className="text-[27px] font-semibold tracking-[-1.3px] sm:text-[32px] sm:tracking-[-1.5px]">
                {totalPrice} €
              </strong>
            </div>

            {/* ORDER */}
            <button
              type="button"
              onClick={completeOrder}
              className="group flex w-full items-center justify-between rounded-full bg-[#235bfa] px-5 py-3.5 text-[11px] font-semibold text-white transition duration-300 hover:bg-[#1645cf] sm:px-6 sm:py-4.5 sm:text-xs"
            >
              Passer à la commande
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full bg-transparent text-[10px] text-[#72767f] transition hover:text-[#17191d] sm:mt-4 sm:text-[11px]"
            >
              Continuer mes achats
            </button>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
