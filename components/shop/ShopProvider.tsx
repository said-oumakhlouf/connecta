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
import { changeCartLine, countUnits, getMultiCartPrice, type CartLine } from '@/lib/multi-cart';
import { parseCartDraft } from '@/lib/cart-draft';
import { MAX_ORDER_UNITS } from '@/lib/shop-pricing';

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

  // A paid or expired Stripe session must not keep the local basket locked.
  useEffect(() => {
    if (!hasCheckoutAttempt) return;
    let sessionId = '';
    try {
      const session = JSON.parse(sessionStorage.getItem('connectaCheckoutSession') ?? 'null') as
        { sessionId?: string } | null;
      sessionId = session?.sessionId ?? '';
    } catch { /* Payment return will handle invalid stored sessions. */ }
    if (!/^cs_test_[a-zA-Z0-9]+$/.test(sessionId)) return;
    let active = true;
    void shopApi.checkoutStatus(sessionId).then(result => {
      if (!active || result.paymentStatus === 'UNPAID') return;
      sessionStorage.removeItem('connectaCheckoutAttempt');
      sessionStorage.removeItem('connectaCheckoutSession');
      setHasCheckoutAttempt(false);
      if (result.paymentStatus === 'PAID') {
        setCartItems([]);
        sessionStorage.removeItem('connectaCartDraft');
      }
      void refreshProduct();
    }).catch(() => {
      /* Never discard an unknown payment reservation on a network error. */
    });
    return () => { active = false; };
  }, [hasCheckoutAttempt, refreshProduct]);

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
  const priced = getMultiCartPrice(catalog, cartItems);
  const cartCount = priced.count;
  const cartTotal = priced.total;
  const cartDiscount = priced.discount;
  const otherUnits = cartCount - (hocoInCart?.quantity ?? 0);
  const maxCartCount = product?.active
    ? Math.floor(Math.min(product.stock, MAX_ORDER_UNITS - otherUnits) / offer.quantity)
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
      if (hasCheckoutAttempt) setOrderError('Une réservation Stripe existe déjà. Annulez-la pour continuer vos achats.');
      openDialog();
      return;
    }
    const desired = offers[id].quantity;
    const previous = cartItems.find(item => item.productId === product?.id)?.quantity ?? 0;
    if (product && (!product.active || previous + desired > product.stock ||
      cartCount + desired > MAX_ORDER_UNITS)) {
      setOrderError('Stock insuffisant ou limite de 10 articles atteinte.');
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
      if (hasCheckoutAttempt) setOrderError('Une réservation Stripe existe déjà. Annulez-la pour continuer vos achats.');
      openDialog();
      return;
    }
    const item = catalog.find(value => value.id === productId);
    if (!item || !item.active || item.stock < 1) {
      setOrderError('Ce produit est actuellement indisponible.');
      openDialog();
      return;
    }
    if (cartCount >= MAX_ORDER_UNITS ||
        (cartItems.find(line => line.productId === productId)?.quantity ?? 0) >= item.stock) {
      setOrderError('Stock insuffisant ou limite de 10 articles atteinte.');
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

  function openCart() {
    openDialog();
    if (!submissionRef.current) void refreshProduct();
  }

  function closeCart() {
    if (submissionRef.current) return;
    if (dialogRef.current?.open) dialogRef.current.close();
    setOrderError(null);
  }

  async function cancelCurrentCheckout() {
    if (!hasCheckoutAttempt || submissionRef.current || isCancellingCheckout) return;
    let sessionId = '';
    try {
      const saved = JSON.parse(sessionStorage.getItem('connectaCheckoutSession') ?? 'null') as
        { sessionId?: string } | null;
      sessionId = saved?.sessionId ?? '';
    } catch { /* No valid checkout session was saved. */ }
    if (!/^cs_test_[a-zA-Z0-9]+$/.test(sessionId)) {
      setOrderError('Impossible de retrouver la session Stripe. Vérifiez la page paiement ou attendez l’expiration de la réservation.');
      return;
    }
    setIsCancellingCheckout(true);
    setOrderError(null);
    try {
      const result = await shopApi.cancelCheckout(sessionId);
      if (result.paymentStatus === 'UNPAID')
        throw new Error('La réservation reste active. Réessayez ou vérifiez le paiement.');
      sessionStorage.removeItem('connectaCheckoutAttempt');
      sessionStorage.removeItem('connectaCheckoutSession');
      setHasCheckoutAttempt(false);
      if (result.paymentStatus === 'PAID') {
        setCartItems([]);
        sessionStorage.removeItem('connectaCartDraft');
        setCartNotice('Le paiement a déjà été confirmé. Consultez vos commandes.');
      } else {
        setCartNotice('Réservation annulée : vous pouvez modifier votre panier.');
      }
      await refreshProduct();
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Impossible d’annuler la réservation.');
    } finally {
      setIsCancellingCheckout(false);
    }
  }

  async function submitOrder(customer: CustomerDetails, memberCheckout: boolean) {
    if (submissionRef.current || !cartItems.length || catalogLoading || catalogError) return;
    if ((!hasCheckoutAttempt && !getMultiCartPrice(catalog, cartItems).valid) ||
        cartCount > MAX_ORDER_UNITS) {
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
      if (error instanceof ShopApiError && (error.status === 409 || error.status === 404)) {
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
