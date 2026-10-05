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
      className="m-auto w-[calc(100%-2rem)] max-w-120 rounded-[22px] border-0 p-0 text-[#17191d] shadow-[0_35px_120px_#0003] backdrop:bg-[#151a2466] backdrop:backdrop-blur-[6px]"
    >
      <div className="p-6 md:p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[1.5px] text-[#90959e]">
              CONNECTA
            </span>

            <h2 className="mt-1 text-[26px] font-medium tracking-[-1.2px]">
              {orderComplete ? 'Panier validé' : 'Votre panier'}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="grid size-10 place-items-center rounded-full bg-[#f4f5f7] transition hover:bg-[#e9ebef]"
          >
            <X size={18} />
          </button>
        </div>

        {orderComplete ? (
          <>
            <div className="mx-auto mb-6 mt-10 grid size-16 place-items-center rounded-full bg-[#edf2ff] text-[#235bfa]">
              <Check size={26} />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold">Votre panier est prêt.</h3>

              <p className="mx-auto mt-3 max-w-80 text-[12px] leading-[1.8] text-[#72767f]">
                L’étape de commande complète sera ajoutée lorsque le paiement et
                la livraison seront connectés.
              </p>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="mt-8 flex w-full items-center justify-between rounded-full bg-[#17191d] px-6 py-4 text-xs font-semibold text-white transition hover:bg-[#235bfa]"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          </>
        ) : cart && cartOffer ? (
          <>
            {/* PRODUCT */}
            <div className="mt-8 flex items-center gap-5 rounded-[18px] bg-[#f7f8fa] p-4 md:p-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-white">
                <div className="h-75 w-80 origin-top-left scale-30">
                  <ProductVisual variant="case" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold tracking-[1.3px] text-[#90959e]">
                  {cartOffer.id === 'duo' ? 'PACK DUO' : 'SOLO'}
                </span>

                <h3 className="mt-1 text-[17px] font-semibold">
                  {product.name}
                </h3>

                <p className="mt-1 text-[11px] text-[#72767f]">
                  {product.color} · {cartOffer.title}
                </p>
              </div>

              <strong className="text-[22px] font-semibold tracking-[-1px]">
                {cartOffer.price} €
              </strong>
            </div>

            {/* QUANTITY */}
            <div className="mt-7 flex items-center justify-between border-b border-[#e9eaed] pb-5">
              <div>
                <span className="block text-[12px] font-medium">Quantité</span>

                <span className="mt-1 block text-[10px] text-[#8b9098]">
                  {totalPairs} paire{totalPairs > 1 ? 's' : ''} au total
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  disabled={cart.count <= 1}
                  onClick={() => updateCartQuantity(-1)}
                  className="grid size-9 place-items-center rounded-full border border-[#e0e3e8] bg-white transition hover:border-[#bfc5ce] disabled:cursor-default disabled:opacity-30"
                >
                  <Minus size={15} />
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
                  disabled={cart.count >= 10}
                  onClick={() => updateCartQuantity(1)}
                  className="grid size-9 place-items-center rounded-full border border-[#e0e3e8] bg-white transition hover:border-[#bfc5ce] disabled:cursor-default disabled:opacity-30"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* DETAILS */}
            <div className="space-y-3 border-b border-[#e9eaed] py-5 text-[11px]">
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
            <div className="flex items-end justify-between py-6">
              <div>
                <span className="block text-[11px] text-[#72767f]">Total</span>

                <span className="mt-1 block text-[9px] text-[#a0a5ad]">
                  Hors livraison
                </span>
              </div>

              <strong className="text-[32px] font-semibold tracking-[-1.5px]">
                {totalPrice} €
              </strong>
            </div>

            {/* ORDER */}
            <button
              type="button"
              onClick={completeOrder}
              className="group flex w-full items-center justify-between rounded-full bg-[#235bfa] px-6 py-4.5 text-xs font-semibold text-white transition duration-300 hover:bg-[#1645cf]"
            >
              Passer à la commande
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <button
              type="button"
              onClick={closeCart}
              className="mt-4 w-full bg-transparent text-[11px] text-[#72767f] transition hover:text-[#17191d]"
            >
              Continuer mes achats
            </button>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
