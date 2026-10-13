'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Cable, LoaderCircle, Minus, Package, Plus, X } from 'lucide-react';
import ShippingFields from './ShippingFields';
import { shopApi } from '@/lib/shop-api';
import { memberApi, MemberApiError, type MemberProfile } from '@/lib/member-api';
import type { ShippingAddress, ShippingOptions } from '@/lib/shipping';
import ProductVisual from '@/components/product/ProductVisual';
import BrandName from '@/components/layout/BrandName';
import { useShop } from '@/components/shop/ShopProvider';
import { formatPrice, getCartPrice, MAX_ORDER_UNITS } from '@/lib/shop-pricing';
import { getMultiCartPrice } from '@/lib/multi-cart';

export default function CartDialog() {
  const {
    dialogRef,
    cartItems,
    catalog,
    catalogLoading,
    catalogError,
    cartCount,
    cartTotal,
    cartDiscount,
    product,
    orderError,
    isSubmitting,
    hasCheckoutAttempt,
    cartOpenVersion,
    closeCart,
    submitOrder,
    refreshProduct,
    updateProductQuantity,
    removeProduct,
  } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [accountState, setAccountState] = useState<'checking' | 'ready' | 'error'>('checking');
  const [accountRetry, setAccountRetry] = useState(0);
  const lastMemberEmail = useRef<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({ country: 'FR', line1: '', line2: '', city: '', postalCode: '', region: '' });
  const [shippingOptions, setShippingOptions] = useState<ShippingOptions | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [shippingRefresh, setShippingRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setShippingError('');
    setShippingOptions(null);
    void shopApi.shippingOptions().then(options => {
      if (!active) return;
      setShippingOptions(options);
      setShippingAddress(current => options.destinations.some(d => d.country === current.country) || !options.destinations[0]
        ? current : { ...current, country: options.destinations[0].country, postalCode: '', region: options.destinations[0].country === 'CA' ? 'QC' : '' });
    }).catch(() => { if (active) setShippingError('Impossible de charger les frais de livraison.'); });
    return () => { active = false; };
  }, [shippingRefresh]);
  useEffect(() => {
    if (cartOpenVersion === 0) return;
    let active = true;
    setAccountState('checking');
    void memberApi.me().then(profile => {
      if (!active) return;
      lastMemberEmail.current = profile.email;
      setMember(profile);
      setCustomerEmail(profile.email);
      setCustomerName(profile.customerName ?? '');
      setShippingAddress(profile.shippingAddress ?? {
        country: 'FR', line1: '', line2: '', city: '', postalCode: '', region: '',
      });
      setAccountState('ready');
    }).catch(error => {
      if (!active) return;
      if (error instanceof MemberApiError && error.status === 401) {
        // Clear old member details after logout or session expiry, not guest form entries.
        if (lastMemberEmail.current) {
          setCustomerEmail('');
          setCustomerName('');
          setShippingAddress({
            country: 'FR', line1: '', line2: '', city: '', postalCode: '', region: '',
          });
        }
        lastMemberEmail.current = null;
        setMember(null);
        setAccountState('ready');
      } else {
        setAccountState('error');
      }
    });
    return () => { active = false; };
  }, [cartOpenVersion, accountRetry]);

  const shippingFee = shippingOptions?.destinations.find(d => d.country === shippingAddress.country)?.fee;
  const priced = getMultiCartPrice(catalog, cartItems);
  const canSubmit =
    shippingFee !== undefined &&
    cartItems.length > 0 &&
    cartCount <= MAX_ORDER_UNITS &&
    !catalogLoading &&
    !catalogError &&
    (hasCheckoutAttempt || priced.valid) &&
    !isSubmitting &&
    accountState === 'ready';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (shippingFee === undefined) return;
    if (accountState !== 'ready') return;
    void submitOrder({ customerName, customerEmail, shippingAddress, expectedShippingFee: shippingFee }, !!member);
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

        {cartItems.length > 0 ? (
          <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <div className="mt-6 space-y-3">
              {cartItems.map((line) => {
                const item = catalog.find(p => p.id === line.productId);
                const isHoco = item?.id === product?.id;
                const lineAmount = item ? getCartPrice(item.price, item.duoPrice, line.quantity).total : 0;
                return (
                  <div key={line.productId} className="rounded-2xl bg-[#f7f8fa] p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-[#235bfa]">
                        {isHoco ? (
                          <div className="h-75 w-80 origin-top-left scale-[0.2]">
                            <ProductVisual variant="case" />
                          </div>
                        ) : item?.slug.includes('cable') ? <Cable size={25} /> : <Package size={25} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">{item?.name ?? 'Produit indisponible'}</h3>
                        <p className="mt-1 text-xs text-[#72767f]">
                          {item ? `${formatPrice(item.price)} l’unité` : 'Référence non disponible'}
                        </p>
                        <button type="button" disabled={isSubmitting || hasCheckoutAttempt}
                          onClick={() => removeProduct(line.productId)}
                          className="mt-2 text-[11px] text-[#72767f] underline disabled:opacity-40">
                          Retirer
                        </button>
                      </div>
                      <strong className="text-sm font-semibold">{item ? formatPrice(lineAmount) : '—'}</strong>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[#e1e4e9] pt-3">
                      <span className="text-xs text-[#72767f]">
                        {item ? `${item.stock} en stock` : 'Produit introuvable'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label={`Diminuer ${item?.name ?? 'produit'}`}
                          disabled={isSubmitting || hasCheckoutAttempt || !item}
                          onClick={() => updateProductQuantity(line.productId, -1)}
                          className="grid size-8 place-items-center rounded-full border border-[#dfe3e8] disabled:opacity-40">
                          <Minus size={14} />
                        </button>
                        <span className="min-w-4 text-center text-xs font-semibold">{line.quantity}</span>
                        <button type="button" aria-label={`Augmenter ${item?.name ?? 'produit'}`}
                          disabled={isSubmitting || hasCheckoutAttempt || !item || line.quantity >= item.stock || cartCount >= MAX_ORDER_UNITS}
                          onClick={() => updateProductQuantity(line.productId, 1)}
                          className="grid size-8 place-items-center rounded-full border border-[#dfe3e8] disabled:opacity-40">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#72767f]">
              {cartCount} article(s) au total, maximum {MAX_ORDER_UNITS} unités par commande.
              Une seule réservation non payée par email.
            </p>
            {!catalogLoading && !catalogError && !priced.valid && !hasCheckoutAttempt && (
              <p role="alert" className="mt-3 rounded-xl bg-[#fff1f0] p-3 text-xs text-[#ae302a]">
                Un produit est épuisé, inactif ou le panier dépasse le stock disponible.
              </p>
            )}
            {catalogError && (
              <div role="alert" className="mt-3 rounded-xl bg-[#fff1f0] p-3 text-xs text-[#ae302a]">
                {catalogError}
                <button type="button" className="ml-2 underline" onClick={() => void refreshProduct()}>
                  Actualiser
                </button>
              </div>
            )}
            {hasCheckoutAttempt && (
              <p className="mt-3 text-xs text-[#72767f]">
                Réservation en cours : le panier est verrouillé pour permettre une reprise sûre du paiement.
              </p>
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
                  <span className="block text-[#72767f]">Sous-total des articles</span>
                  <span className="mt-1 block text-[10px] text-[#a0a5ad]">
                    Livraison calculée selon la destination
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
              {accountState === 'checking' && (
                <p role="status" className="text-xs text-[#72767f]">Vérification de votre compte…</p>
              )}
              {accountState === 'error' && (
                <div role="alert" className="rounded-xl bg-[#fff1f0] p-3 text-xs text-[#ae302a]">
                  Impossible de vérifier votre session. Réessayez avant de payer.
                  <button type="button" className="ml-2 font-semibold underline" onClick={() => setAccountRetry(value => value + 1)}>
                    Réessayer
                  </button>
                </div>
              )}
              {member && accountState === 'ready' && (
                <p className="text-xs text-[#235bfa]">
                  {member.customerName ? 'Connecté à CONNECTA : vos coordonnées ont été récupérées depuis votre dernière commande payée.' : 'Connecté à CONNECTA : votre adresse email est déjà renseignée.'}
                </p>
              )}
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
                  readOnly={!!member}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#e0e3e8] bg-white px-4 py-3 text-base outline-none focus:border-[#235bfa] focus:ring-2 focus:ring-[#235bfa20]"
                />
              </div>
              {member && (
                <p className="text-xs text-[#72767f]">
                  Adresse email liée à votre compte. Pour acheter avec une autre adresse,{' '}
                  <a href="/compte" className="font-medium underline">changez de compte</a>.
                </p>
              )}
            </fieldset>

            <ShippingFields address={shippingAddress} options={shippingOptions} onChange={setShippingAddress} disabled={isSubmitting || !shippingOptions} />
            <div className="mt-5 space-y-3 rounded-2xl bg-[#f7f8fa] p-4 text-sm" aria-live="polite">
              <div className="flex justify-between gap-3"><span>Livraison</span><strong>{shippingFee === undefined ? 'Indisponible' : formatPrice(shippingFee)}</strong></div>
              <div className="flex justify-between gap-3 border-t border-[#e0e3e8] pt-3 text-lg"><span>Total à payer</span><strong>{shippingFee === undefined ? '—' : formatPrice(cartTotal + shippingFee)}</strong></div>
              <p className="text-xs text-[#72767f]">Montants en euros, livraison incluse.</p>
              {shippingOptions?.provisional && <p className="text-xs text-[#72767f]">Tarifs de livraison provisoires pour les essais.</p>}
              {shippingError && <p role="alert" className="text-[#ae302a]">{shippingError}</p>}
              {shippingOptions?.destinations.length === 0 && <p>Aucune destination disponible pour le moment.</p>}
              <button type="button" disabled={isSubmitting} className="text-xs underline" onClick={() => setShippingRefresh(v => v + 1)}>Actualiser les frais de livraison</button>
            </div>

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
        ) : (
          <div className="mt-6 space-y-3 text-sm text-[#72767f]">
            {(orderError || catalogError) && (
              <p role="alert" className="rounded-xl bg-[#fff1f0] p-3 text-[#ae302a]">{orderError ?? catalogError}</p>
            )}
            <p>Votre panier est vide. <a href="/boutique" className="text-[#235bfa] underline">Découvrir la boutique</a></p>
          </div>
        )}
      </div>
    </dialog>
  );
}
