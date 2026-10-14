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
  type ReservationState,
} from '@/lib/shop-api';
import { checkoutAttempt } from '@/lib/checkout-attempt';
import { changeCartLine, countUnits, getMultiCartPrice, type CartLine } from '@/lib/multi-cart';
import { parseCartDraft } from '@/lib/cart-draft';
import {
  clearFinalizedCheckout,
  isDefinitiveCheckoutRefusal,
  readCheckoutKey,
  releaseCheckoutKeepCart,
} from '@/lib/checkout-storage';
import { getMaxCartCount } from '@/lib/shop-pricing';

type ShopContextValue = {
  selectedOffer: OfferId;
  offers: Record<OfferId, Offer>;
  offer: Offer;
  cart: Cart | null;
  cartItems: CartLine[];
  catalog: ApiProduct[];
  catalogLoading: boolean;
  catalogError: string | null;
  addProduct: (productId: number) => void;
  updateProductQuantity: (productId: number, change: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
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
  cartNotice: string;
  dismissCartNotice: () => void;
  isCancellingCheckout: boolean;
  cancelCurrentCheckout: () => Promise<void>;
  /** Server amounts of the pending order, once checked. */
  reservation: ReservationState | null;
  isResumingCheckout: boolean;
  resumeCheckout: () => Promise<void>;
  dialogRef: RefObject<HTMLDialogElement | null>;
  cartOpenVersion: number;
  selectOffer: (id: OfferId) => void;
  order: (id?: OfferId) => void;
  openCart: () => void;
  closeCart: () => void;
  refreshProduct: () => Promise<void>;
  submitOrder: (customer: CustomerDetails, memberCheckout: boolean) => Promise<void>;
  updateCartQuantity: (change: number) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export default function ShopProvider({ children }: { children: ReactNode }) {
  const [selectedOffer, setSelectedOffer] = useState<OfferId>('solo');
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [requestedOffer, setRequestedOffer] = useState<OfferId | null>(null);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckoutAttempt, setHasCheckoutAttempt] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [isCancellingCheckout, setIsCancellingCheckout] = useState(false);
  const [reservation, setReservation] = useState<ReservationState | null>(null);
  const [isResumingCheckout, setIsResumingCheckout] = useState(false);
  const [cartOpenVersion, setCartOpenVersion] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submissionRef = useRef(false);
  const loadSequence = useRef(0);

  const refreshProduct = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setProductLoading(true);
    setCatalogLoading(true);
    setProductError(null);
    setCatalogError(null);
    try {
      const products = await shopApi.getProducts();
      if (sequence !== loadSequence.current) return;
      setCatalog(products);
      const hoco = products.find((item) => item.slug === 'hoco-ew75') ?? null;
      setProduct(hoco);
      if (!hoco) setProductError('Les écouteurs Hoco EW75 sont indisponibles.');
    } catch (error) {
      if (sequence !== loadSequence.current) return;
      const message = error instanceof Error ? error.message : 'Catalogue momentanément indisponible.';
      setCatalog([]);
      setProduct(null);
      setProductError(message);
      setCatalogError(message);
    } finally {
      if (sequence === loadSequence.current) {
        setProductLoading(false);
        setCatalogLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('connectaCheckoutAttempt') ?? 'null') as
        { items?: CartLine[]; productId?: number; quantity?: number } | null;
      const candidates = parseCartDraft(JSON.stringify(Array.isArray(saved?.items)
        ? saved.items
        : saved?.productId && saved?.quantity
          ? [{ productId: saved.productId, quantity: saved.quantity }]
          : []));
      if (candidates.length > 0) {
        setHasCheckoutAttempt(true);
        setCartItems(candidates);
      } else {
        const draft = parseCartDraft(sessionStorage.getItem('connectaCartDraft'));
        if (draft.length > 0) setCartItems(draft);
      }
    } catch {
      /* Storage can be unavailable or contain malformed data. */
    }
    setCartHydrated(true);
    void refreshProduct();
    return () => { loadSequence.current += 1; };
  }, [refreshProduct]);

  // Keep an unpaid, unreserved shopping basket across normal page navigation.
  // Only product IDs and quantities are stored, never personal details.
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      sessionStorage.setItem('connectaCartDraft', JSON.stringify(cartItems));
    } catch {
      /* Browsing without session storage still works. */
    }
  }, [cartItems, cartHydrated]);

  useEffect(() => {
    if (!cartNotice) return;
    const timeout = setTimeout(() => setCartNotice(''), 4500);
    return () => clearTimeout(timeout);
  }, [cartNotice]);

  // Apply the server state of the pending order. Never unlocks on uncertainty.
  const applyReservation = useCallback((result: ReservationState) => {
    if (result.paymentStatus === 'UNPAID') {
      setReservation(result);
      return;
    }
    setReservation(null);
    setHasCheckoutAttempt(false);
    setRequestedOffer(null);
    if (result.paymentStatus === 'PAID') {
      clearFinalizedCheckout(sessionStorage, 'PAID');
      setCartItems([]);
      setCartNotice('Votre paiement est confirmé. Merci pour votre commande.');
    } else {
      // Stock is back on sale: keep the articles as an ordinary basket.
      releaseCheckoutKeepCart(sessionStorage);
      setCartNotice('Votre réservation a expiré. Vos articles sont toujours dans le panier.');
    }
    void refreshProduct();
  }, [refreshProduct]);

  // The key exists but no order was ever created for it: unlock, keep the basket.
  const forgetMissingReservation = useCallback(() => {
    releaseCheckoutKeepCart(sessionStorage);
    setReservation(null);
    setHasCheckoutAttempt(false);
    void refreshProduct();
  }, [refreshProduct]);

  const syncReservation = useCallback(async () => {
    // While the first checkout request is in flight, its order may not exist yet.
    if (submissionRef.current) return;
    const key = readCheckoutKey(sessionStorage);
    if (!key) return;
    try {
      const result = await shopApi.reservationStatus(key);
      if (!submissionRef.current) applyReservation(result);
    } catch (error) {
      if (error instanceof ShopApiError && error.status === 404 && !submissionRef.current)
        forgetMissingReservation();
      /* Otherwise never discard a possibly reserved basket on a network error. */
    }
  }, [applyReservation, forgetMissingReservation]);

  useEffect(() => {
    if (hasCheckoutAttempt) void syncReservation();
  }, [hasCheckoutAttempt, syncReservation]);

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
  const hocoInCart = cartItems.find(item => item.productId === product?.id);
  // Compatibility for the existing Solo/Duo offer components.
  const cart: Cart | null = hocoInCart ? {
    id: selectedOffer,
    count: Math.ceil(hocoInCart.quantity / offers[selectedOffer].quantity),
  } : null;
  const cartOffer = cart ? offers[cart.id] : null;
  const priced = getMultiCartPrice(catalog, cartItems, hasCheckoutAttempt);
  const cartCount = priced.count;
  const cartTotal = priced.total;
  const cartDiscount = priced.discount;
  const maxCartCount = product?.active
    ? getMaxCartCount(product.stock, offer.quantity)
    : 0;

  // A click made before the catalog loaded is handled without creating a checkout.
  useEffect(() => {
    if (!requestedOffer || !product || hasCheckoutAttempt) return;
    const quantity = offers[requestedOffer].quantity;
    setCartItems(current => changeCartLine(current, product, quantity));
    setRequestedOffer(null);
    setCartNotice(`${product.name} ajouté au panier`);
  }, [product, requestedOffer, hasCheckoutAttempt]);

  function selectOffer(id: OfferId) {
    if (!submissionRef.current) setSelectedOffer(id);
  }

  function openDialog() {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
      setCartOpenVersion(value => value + 1);
    }
  }

  function order(id: OfferId = selectedOffer) {
    if (submissionRef.current || hasCheckoutAttempt) {
      if (hasCheckoutAttempt) setOrderError('Votre commande est en attente de paiement. Reprenez le paiement ou annulez la réservation pour modifier votre panier.');
      openDialog();
      return;
    }
    const desired = offers[id].quantity;
    const previous = cartItems.find(item => item.productId === product?.id)?.quantity ?? 0;
    if (product && (!product.active || previous + desired > product.stock)) {
      setOrderError('La quantité demandée dépasse le stock disponible.');
      openDialog();
      return;
    }
    setSelectedOffer(id);
    setOrderError(null);
    if (!product) {
      setRequestedOffer(id);
      void refreshProduct();
      return;
    }
    setCartItems(current => changeCartLine(current, product, desired));
    setCartNotice(`${desired} × ${product.name} ajouté(s) au panier`);
  }

  function addProduct(productId: number) {
    if (submissionRef.current || hasCheckoutAttempt) {
      if (hasCheckoutAttempt) setOrderError('Votre commande est en attente de paiement. Reprenez le paiement ou annulez la réservation pour modifier votre panier.');
      openDialog();
      return;
    }
    const item = catalog.find(value => value.id === productId);
    if (!item || !item.active || item.stock < 1) {
      setOrderError('Ce produit est actuellement indisponible.');
      openDialog();
      return;
    }
    if ((cartItems.find(line => line.productId === productId)?.quantity ?? 0) >= item.stock) {
      setOrderError('La quantité demandée dépasse le stock disponible.');
      openDialog();
      return;
    }
    setCartItems(current => changeCartLine(current, item, 1));
    setCartNotice(`${item.name} ajouté au panier`);
    setOrderError(null);
    // Do not open the cart or Stripe here: the shopper may add more products.
  }

  function updateProductQuantity(productId: number, change: number) {
    if (submissionRef.current || hasCheckoutAttempt) return;
    const item = catalog.find(value => value.id === productId);
    if (!item) return;
    setCartItems(current => changeCartLine(current, item, change));
    setOrderError(null);
  }

  function removeProduct(productId: number) {
    if (submissionRef.current || hasCheckoutAttempt) return;
    setCartItems(current => current.filter(line => line.productId !== productId));
    setOrderError(null);
  }

  function clearCart() {
    if (submissionRef.current || hasCheckoutAttempt) return;
    setCartItems([]);
    setOrderError(null);
    setRequestedOffer(null);
    setCartNotice('Panier vidé.');
  }

  function openCart() {
    openDialog();
    if (submissionRef.current) return;
    void refreshProduct();
    if (hasCheckoutAttempt) void syncReservation();
  }

  function closeCart() {
    if (submissionRef.current) return;
    if (dialogRef.current?.open) dialogRef.current.close();
    setOrderError(null);
  }

  async function cancelCurrentCheckout() {
    if (!hasCheckoutAttempt || submissionRef.current || isCancellingCheckout || isResumingCheckout) return;
    const key = readCheckoutKey(sessionStorage);
    if (!key) {
      setOrderError('Commande en attente introuvable dans ce navigateur. Elle sera annulée automatiquement à son expiration.');
      return;
    }
    setIsCancellingCheckout(true);
    setOrderError(null);
    try {
      const result = await shopApi.cancelReservation(key);
      if (result.paymentStatus === 'UNPAID')
        throw new Error('La réservation est toujours active. Réessayez dans un instant.');
      clearFinalizedCheckout(sessionStorage, result.paymentStatus);
      setReservation(null);
      setHasCheckoutAttempt(false);
      setCartItems([]);
      setRequestedOffer(null);
      setCartNotice(result.paymentStatus === 'PAID'
        ? 'Votre paiement est confirmé. Le panier a été vidé.'
        : 'Réservation annulée. Votre panier est maintenant vide.');
      await refreshProduct();
    } catch (error) {
      if (error instanceof ShopApiError && error.status === 404) {
        forgetMissingReservation();
        return;
      }
      setOrderError(error instanceof Error ? error.message : 'Impossible d’annuler la réservation.');
    } finally {
      setIsCancellingCheckout(false);
    }
  }

  /** Reopen the payment page of the existing order: no new reservation, no form. */
  async function resumeCheckout() {
    if (!hasCheckoutAttempt || submissionRef.current || isCancellingCheckout || isResumingCheckout) return;
    const key = readCheckoutKey(sessionStorage);
    if (!key) {
      setOrderError('Commande en attente introuvable dans ce navigateur. Elle sera annulée automatiquement à son expiration.');
      return;
    }
    setIsResumingCheckout(true);
    setOrderError(null);
    try {
      const result = await shopApi.resumeReservation(key);
      if (result.paymentStatus === 'UNPAID' && result.url && result.sessionId) {
        sessionStorage.setItem('connectaCheckoutSession', JSON.stringify({
          sessionId: result.sessionId,
          url: result.url,
          expiresAt: result.expiresAt,
          total: result.total,
          shippingFee: result.shippingFee,
          testMode: true,
        }));
        window.location.assign(result.url);
        return;
      }
      if (result.paymentStatus === 'UNPAID')
        throw new Error('Votre paiement est en cours de confirmation. Réessayez dans quelques instants.');
      applyReservation(result);
    } catch (error) {
      if (error instanceof ShopApiError && error.status === 404) {
        forgetMissingReservation();
        setOrderError('Commande en attente introuvable. Vos articles sont toujours dans le panier.');
        return;
      }
      setOrderError(error instanceof Error ? error.message : 'Impossible de reprendre le paiement.');
    } finally {
      setIsResumingCheckout(false);
    }
  }

  async function submitOrder(customer: CustomerDetails, memberCheckout: boolean) {
    // A pending order is resumed, never submitted again.
    if (hasCheckoutAttempt) return;
    if (submissionRef.current || !cartItems.length || catalogLoading || catalogError) return;
    if (!hasCheckoutAttempt && !getMultiCartPrice(catalog, cartItems).valid) {
      setOrderError('Stock insuffisant ou panier modifié. Actualisez le panier.');
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
      const items = cartItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
        .sort((a, b) => a.productId - b.productId);
      // Old Solo/Duo reservations stored productId/quantity instead of items.
      // Preserve their fingerprint so an in-progress Stripe session can be resumed.
      let legacy: { productId?: number; quantity?: number; items?: CartLine[] } | null = null;
      try {
        legacy = JSON.parse(sessionStorage.getItem('connectaCheckoutAttempt') ?? 'null');
      } catch { /* No usable legacy attempt. */ }
      const common = {
        customerName: customer.customerName.trim(),
        customerEmail: customer.customerEmail.trim().toLowerCase(),
      };
      const legacyPayload = legacy && !Array.isArray(legacy.items) &&
        items.length === 1 &&
        legacy.productId === items[0].productId && legacy.quantity === items[0].quantity;
      const attemptPayload = legacyPayload
        ? { ...common, productId: items[0].productId, quantity: items[0].quantity,
            shippingAddress: customer.shippingAddress, expectedShippingFee: customer.expectedShippingFee }
        : { ...common, items,
            shippingAddress: customer.shippingAddress, expectedShippingFee: customer.expectedShippingFee };
      const key = await checkoutAttempt(attemptPayload, sessionStorage);
      setHasCheckoutAttempt(true);
      const result = await shopApi.checkoutItems(customer, items, key, memberCheckout);
      sessionStorage.setItem('connectaCheckoutSession', JSON.stringify(result));
      window.location.assign(result.url);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Impossible de confirmer votre commande.');
      // A refused request created no reservation: unlock the basket.
      // Network errors and 5xx stay pending; the cart then offers resume/cancel.
      if (error instanceof ShopApiError && isDefinitiveCheckoutRefusal(error.status)) {
        sessionStorage.removeItem('connectaCheckoutAttempt');
        setHasCheckoutAttempt(false);
        setReservation(null);
        await refreshProduct();
      }
    } finally {
      submissionRef.current = false;
      setIsSubmitting(false);
    }
    // Uncertain outcome (network or server error): load the pending amounts.
    if (readCheckoutKey(sessionStorage)) void syncReservation();
  }

  function updateCartQuantity(change: number) {
    if (product) updateProductQuantity(product.id, change * offers[selectedOffer].quantity);
  }

  return (
    <ShopContext.Provider
      value={{
        selectedOffer,
        offers,
        offer,
        cart,
        cartItems,
        catalog,
        catalogLoading,
        catalogError,
        addProduct,
        updateProductQuantity,
        removeProduct,
        clearCart,
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
        cartNotice,
        dismissCartNotice: () => setCartNotice(''),
        isCancellingCheckout,
        cancelCurrentCheckout,
        reservation,
        isResumingCheckout,
        resumeCheckout,
        dialogRef,
        cartOpenVersion,
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
