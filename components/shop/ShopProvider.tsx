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
      const candidates = Array.isArray(saved?.items)
        ? saved.items
        : saved?.productId && saved?.quantity
          ? [{ productId: saved.productId, quantity: saved.quantity }]
          : [];
      if (candidates.length > 0 && candidates.length <= MAX_ORDER_UNITS &&
          candidates.every(line => Number.isInteger(line.productId) && line.productId > 0 &&
            Number.isInteger(line.quantity) && line.quantity > 0) &&
          new Set(candidates.map(line => line.productId)).size === candidates.length &&
          countUnits(candidates) <= MAX_ORDER_UNITS) {
        setHasCheckoutAttempt(true);
        setCartItems(candidates);
      }
    } catch {
      /* Invalid or missing checkout-attempt metadata. */
    }
    void refreshProduct();
    return () => { loadSequence.current += 1; };
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

  // A click before the initial catalog arrives is fulfilled after loading.
  useEffect(() => {
    if (!requestedOffer || !product || hasCheckoutAttempt) return;
    const quantity = offers[requestedOffer].quantity;
    setCartItems(current => {
      const others = current.filter(item => item.productId !== product.id);
      return countUnits(others) + quantity <= MAX_ORDER_UNITS && product.stock >= quantity
        ? [...others, { productId: product.id, quantity }].sort((a, b) => a.productId - b.productId)
        : current;
    });
    setRequestedOffer(null);
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
      if (hasCheckoutAttempt) setOrderError('Terminez ou annulez votre réservation avant de modifier le panier.');
      openDialog();
      return;
    }
    const desired = offers[id].quantity;
    const oldHoco = cartItems.find(item => item.productId === product?.id)?.quantity ?? 0;
    if (product && (product.stock < desired || cartCount - oldHoco + desired > MAX_ORDER_UNITS)) {
      setOrderError('Stock insuffisant ou limite de 10 articles atteinte.');
      openDialog();
      return;
    }
    setSelectedOffer(id);
    setOrderError(null);
    openDialog();
    setRequestedOffer(id);
    if (!product) void refreshProduct();
  }

  function addProduct(productId: number) {
    if (submissionRef.current || hasCheckoutAttempt) {
      setOrderError('Terminez ou annulez votre réservation avant de modifier le panier.');
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
    setOrderError(null);
    openDialog();
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
      const key = await checkoutAttempt({
        customerName: customer.customerName.trim(),
        customerEmail: customer.customerEmail.trim().toLowerCase(),
        items,
        shippingAddress: customer.shippingAddress,
        expectedShippingFee: customer.expectedShippingFee,
      }, sessionStorage);
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
