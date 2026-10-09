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
  type ApiProduct,
  type CustomerDetails,
} from '@/lib/shop-api';
import { checkoutAttempt } from '@/lib/checkout-attempt';
import { getCartPrice, getMaxCartCount, MAX_ORDER_UNITS } from '@/lib/shop-pricing';

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
  isSubmitting: boolean;
  hasCheckoutAttempt: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckoutAttempt, setHasCheckoutAttempt] = useState(false);
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
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('connectaCheckoutAttempt') ?? 'null',
      ) as { quantity?: number } | null;
      if (
        saved &&
        Number.isInteger(saved.quantity) &&
        saved.quantity! >= 1 &&
        saved.quantity! <= MAX_ORDER_UNITS
      ) {
        setHasCheckoutAttempt(true);
        setCart({ id: 'solo', count: saved.quantity! });
      }
    } catch {
      /* No previous checkout to resume. */
    }
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
    product?.active && cartOffer
      ? getMaxCartCount(product.stock, cartOffer.quantity)
      : 0;

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
    setOrderError(null);
    openDialog();
    void refreshProduct();
  }

  function openCart() {
    if (cart) {
      openDialog();
      if (!submissionRef.current) void refreshProduct();
    } else {
      order();
    }
  }

  function closeCart() {
    if (submissionRef.current) return;
    if (dialogRef.current?.open) dialogRef.current.close();
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
    if (
      !product.active ||
      (!hasCheckoutAttempt && cart.count > maxCartCount) ||
      cartCount < 1 || cartCount > MAX_ORDER_UNITS
    ) {
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
      const key = await checkoutAttempt(
        {
          customerName: customer.customerName.trim(),
          customerEmail: customer.customerEmail.trim().toLowerCase(),
          productId: product.id,
          quantity: cartCount,
        },
        sessionStorage,
      );
      setHasCheckoutAttempt(true);
      const result = await shopApi.checkout(
        customer,
        product.id,
        cartCount,
        key,
      );
      sessionStorage.setItem('connectaCheckoutSession', JSON.stringify(result));
      window.location.assign(result.url);
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
        sessionStorage.removeItem('connectaCheckoutAttempt');
        setHasCheckoutAttempt(false);
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
        isSubmitting,
        hasCheckoutAttempt,
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
