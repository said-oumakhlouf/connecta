'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { OFFERS, type Cart, type Offer, type OfferId } from '@/data/offers';
import {
  shopApi,
  ShopApiError,
  type ApiOrder,
  type ApiProduct,
  type CustomerDetails,
} from '@/lib/shop-api';
import { getCartPrice } from '@/lib/shop-pricing';

type ShopContextValue = {
  selectedOffer: OfferId;
  offers: Record<OfferId, Offer>;
  offer: Offer;
  cart: Cart | null;
  cartOffer: Offer | null;
  cartCount: number;
  cartTotal: number;
  cartDiscount: number;
  maxCartCount: number;
  product: ApiProduct | null;
  productLoading: boolean;
  productError: string | null;
  orderError: string | null;
  receipt: ApiOrder | null;
  isSubmitting: boolean;
  dialogRef: RefObject<HTMLDialogElement | null>;
  selectOffer: (id: OfferId) => void;
  order: (id?: OfferId) => void;
  openCart: () => void;
  closeCart: () => void;
  refreshProduct: () => Promise<void>;
  submitOrder: (customer: CustomerDetails) => Promise<void>;
  updateCartQuantity: (change: number) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export default function ShopProvider({ children }: { children: ReactNode }) {
  const [selectedOffer, setSelectedOffer] = useState<OfferId>('solo');
  const [cart, setCart] = useState<Cart | null>(null);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ApiOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submissionRef = useRef(false);
  const loadSequence = useRef(0);

  const refreshProduct = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setProductLoading(true);
    setProductError(null);
    try {
      const result = await shopApi.getProduct();
      if (sequence === loadSequence.current) setProduct(result);
    } catch (error) {
      if (sequence === loadSequence.current) {
        setProduct(null);
        setProductError(
          error instanceof Error
            ? error.message
            : 'Produit momentanément indisponible.',
        );
      }
    } finally {
      if (sequence === loadSequence.current) setProductLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProduct();
    return () => {
      loadSequence.current += 1;
    };
  }, [refreshProduct]);

  const soloPrice = product?.price ?? OFFERS.solo.price * 100;
  const duoPrice = product ? product.duoPrice : OFFERS.duo.price * 100;
  const offers: Record<OfferId, Offer> = {
    solo: { ...OFFERS.solo, price: soloPrice / 100 },
    duo: {
      ...OFFERS.duo,
      price: Math.min(duoPrice ?? soloPrice * 2, soloPrice * 2) / 100,
    },
  };
  const offer = offers[selectedOffer];
  const cartOffer = cart ? offers[cart.id] : null;
  const cartCount = cart && cartOffer ? cart.count * cartOffer.quantity : 0;
  const { total: cartTotal, discount: cartDiscount } = getCartPrice(
    soloPrice,
    duoPrice,
    cartCount,
  );
  const maxCartCount =
    product && cartOffer
      ? Math.min(10, Math.floor(product.stock / cartOffer.quantity))
      : 10;

  function selectOffer(id: OfferId) {
    if (!submissionRef.current) setSelectedOffer(id);
  }

  function openDialog() {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function order(id: OfferId = selectedOffer) {
    if (submissionRef.current) return;
    setSelectedOffer(id);
    setCart({ id, count: 1 });
    setReceipt(null);
    setOrderError(null);
    openDialog();
    void refreshProduct();
  }

  function openCart() {
    if (cart || receipt) {
      openDialog();
      if (!receipt && !submissionRef.current) void refreshProduct();
    } else {
      order();
    }
  }

  function closeCart() {
    if (submissionRef.current) return;
    if (dialogRef.current?.open) dialogRef.current.close();
    setReceipt(null);
    setOrderError(null);
  }

  async function submitOrder(customer: CustomerDetails) {
    if (
      submissionRef.current ||
      !cart ||
      !product ||
      productLoading ||
      productError
    )
      return;
    if (!product.active || cartCount > product.stock || cartCount < 1) {
      setOrderError('La quantité demandée dépasse le stock disponible.');
      return;
    }
    if (customer.customerName.trim().length < 2) {
      setOrderError('Indiquez un nom comportant au moins deux caractères.');
      return;
    }

    submissionRef.current = true;
    setIsSubmitting(true);
    setOrderError(null);
    try {
      const result = await shopApi.createOrder(customer, product.id, cartCount);
      setReceipt(result);
      setCart(null);
      void refreshProduct();
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : 'Impossible de confirmer votre commande.',
      );
      if (
        error instanceof ShopApiError &&
        (error.status === 409 || error.status === 404)
      ) {
        await refreshProduct();
      }
    } finally {
      submissionRef.current = false;
      setIsSubmitting(false);
    }
  }

  function updateCartQuantity(change: number) {
    if (submissionRef.current) return;
    setOrderError(null);
    setCart((current) =>
      current
        ? {
            ...current,
            count: Math.min(
              Math.max(1, maxCartCount),
              Math.max(1, current.count + change),
            ),
          }
        : null,
    );
  }

  return (
    <ShopContext.Provider
      value={{
        selectedOffer,
        offers,
        offer,
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
        receipt,
        isSubmitting,
        dialogRef,
        selectOffer,
        order,
        openCart,
        closeCart,
        refreshProduct,
        submitOrder,
        updateCartQuantity,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context)
    throw new Error('useShop doit être utilisé à l’intérieur de ShopProvider.');
  return context;
}
