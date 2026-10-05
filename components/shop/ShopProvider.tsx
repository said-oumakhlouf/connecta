'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  OFFERS,
  type Cart,
  type Offer,
  type OfferId,
} from '@/data/offers';

type ShopContextValue = {
  selectedOffer: OfferId;
  offer: Offer;

  cart: Cart | null;
  cartOffer: Offer | null;
  cartCount: number;

  orderComplete: boolean;

  dialogRef: RefObject<HTMLDialogElement | null>;

  selectOffer: (id: OfferId) => void;
  order: (id?: OfferId) => void;
  openCart: () => void;
  closeCart: () => void;
  completeOrder: () => void;
  updateCartQuantity: (change: number) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

type ShopProviderProps = {
  children: ReactNode;
};

export default function ShopProvider({
  children,
}: ShopProviderProps) {
  const [selectedOffer, setSelectedOffer] =
    useState<OfferId>('solo');

  const [cart, setCart] = useState<Cart | null>(null);

  const [orderComplete, setOrderComplete] =
    useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const offer = OFFERS[selectedOffer];

  const cartOffer = cart
    ? OFFERS[cart.id]
    : null;

  const cartCount =
    cart && cartOffer
      ? cart.count * cartOffer.quantity
      : 0;

  function selectOffer(id: OfferId) {
    setSelectedOffer(id);
  }

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function order(id: OfferId = selectedOffer) {
    setCart({
      id,
      count: 1,
    });

    setOrderComplete(false);
    openDialog();
  }

  function openCart() {
    if (cart) {
      openDialog();
      return;
    }

    order();
  }

  function closeCart() {
    setOrderComplete(false);
    
    if(dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }

  function completeOrder() {
    setOrderComplete(true);
  }

  function updateCartQuantity(change: number) {
    setCart((currentCart) => {
      if (!currentCart) {
        return currentCart;
      }

      const count = Math.min(
        10,
        Math.max(
          1,
          currentCart.count + change,
        ),
      );

      return {
        ...currentCart,
        count,
      };
    });
  }

  return (
    <ShopContext.Provider
      value={{
        selectedOffer,
        offer,

        cart,
        cartOffer,
        cartCount,

        orderComplete,

        dialogRef,

        selectOffer,
        order,
        openCart,
        closeCart,
        completeOrder,
        updateCartQuantity,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      'useShop doit être utilisé à l’intérieur de ShopProvider.',
    );
  }

  return context;
}