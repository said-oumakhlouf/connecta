'use client';

import { Boxes, LoaderCircle, Pencil, Plus, Save, Upload, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AdminProduct, ProductEdit } from '@/lib/admin-api';
import { getProductVisual } from '@/lib/catalog-display';
import { formatPrice } from '@/lib/shop-pricing';
import styles from './AdminPanel.module.css';

type Restock = (productId: number, quantity: number) => Promise<boolean>;
type SaveProduct = (productId: number, update: ProductEdit) => Promise<boolean>;
type UploadPhoto = (file: File) => Promise<string | null>;

function centsFromInput(input: string): number | null {
  const clean = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [euros, cents = ''] = clean.split('.');
  const amount = Number(euros) * 100 + Number(cents.padEnd(2, '0'));
  return Number.isSafeInteger(amount) && amount >= 1 && amount <= 2_147_483_647 ? amount : null;
}

function ProductEditor({
  product, blocked, onSave, onUpload, onClose,
}: {
  product: AdminProduct; blocked: boolean; onSave: SaveProduct; onUpload: UploadPhoto; onClose: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState((product.price / 100).toFixed(2));
  const [duoPrice, setDuoPrice] = useState(product.duoPrice === null ? '' : (product.duoPrice / 100).toFixed(2));
  const [description, setDescription] = useState(product.description ?? '');
  const [active, setActive] = useState(product.active);
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  const visual = getProductVisual(product.slug, imageUrl, name);
  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || blocked || uploading) return;
    setUploading(true);
    setLocalError('');
    try {
      const url = await onUpload(file);
      if (url) setImageUrl(url);
      else setLocalError('Photo non importée. Vérifiez la configuration du stockage.');
    } finally {
      setUploading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || blocked) return;
    const priceCents = centsFromInput(price);
    const duoCents = duoPrice.trim() ? centsFromInput(duoPrice) : null;
    if (!name.trim() || !priceCents || (duoPrice.trim() && !duoCents)) {
      setLocalError('Vérifiez le nom et les montants en euros (ex. 35,00).');
      return;
    }
    if (duoCents !== null && duoCents > priceCents * 2) {
      setLocalError('Le Duo ne peut pas coûter plus de deux produits.');
      return;
    }
    setLocalError('');
    const updated = await onSave(product.id, {
      name: name.trim(), price: priceCents, duoPrice: duoCents,
      description: description.trim() || null, imageUrl, active,
    });
    if (updated) onClose();
  }

  const field = 'mt-1 w-full rounded-xl border border-[#dfe2e8] bg-white p-3 text-sm outline-none focus:border-[#235bfa]';
  return (
    <form onSubmit={save} className="mt-5 space-y-4 border-t border-[#e9eaed] pt-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">Modifier la fiche produit</h4>
        <button type="button" onClick={onClose} disabled={blocked || uploading} aria-label="Fermer l’éditeur">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Photo URL validated by the API, otherwise a local catalogue illustration. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={visual.src} alt={visual.alt} width={96} height={96}
          className="size-24 rounded-xl bg-[#f7f8fa] object-contain p-1" />
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfe2e8] bg-white px-3 py-2 text-xs font-semibold">
            {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Import en cours…' : 'Importer une photo'}
            <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp"
              disabled={blocked || uploading} onChange={event => void uploadPhoto(event)} />
          </label>
          {imageUrl && (
            <button type="button" className="text-left text-xs text-[#72767f] underline"
              disabled={blocked || uploading} onClick={() => setImageUrl(null)}>
              Revenir au visuel initial
            </button>
          )}
          <span className="text-[11px] text-[#72767f]">JPG, PNG ou WebP · 5 Mo maximum</span>
        </div>
      </div>
      <label className="block text-xs font-semibold">Nom du produit
        <input className={field} value={name} onChange={event => setName(event.target.value)}
          minLength={2} maxLength={150} required disabled={blocked || uploading} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-semibold">Prix en €
          <input className={field} value={price} onChange={event => setPrice(event.target.value)}
            inputMode="decimal" required disabled={blocked || uploading} />
        </label>
        <label className="block text-xs font-semibold">Duo en €
          <input className={field} value={duoPrice} onChange={event => setDuoPrice(event.target.value)}
            inputMode="decimal" placeholder="Aucun Duo" disabled={blocked || uploading} />
        </label>
      </div>
      <label className="block text-xs font-semibold">Description du produit
        <textarea className={field} rows={4} value={description} maxLength={2000}
          onChange={event => setDescription(event.target.value)} disabled={blocked || uploading} />
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold">
        <input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)}
          disabled={blocked || uploading} />
        Produit actif et visible dans la boutique
      </label>
      {localError && <p role="alert" className="text-xs text-red-700">{localError}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={styles.primary} disabled={blocked || uploading}>
          <Save size={15} /> Enregistrer les modifications
        </button>
        <button type="button" className={styles.secondary} onClick={onClose} disabled={blocked || uploading}>Annuler</button>
      </div>
    </form>
  );
}

function StockCard({
  product, blocked, pending, onRestock, onSave, onUpload,
}: {
  product: AdminProduct; blocked: boolean; pending: boolean;
  onRestock: Restock; onSave: SaveProduct; onUpload: UploadPhoto;
}) {
  const [quantity, setQuantity] = useState('');
  const [editing, setEditing] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onRestock(product.id, Number(quantity))) setQuantity('');
  }
  const available = product.active && product.stock > 0;
  return (
    <article className={styles.product}>
      <div className={styles.productTop}>
        <div className={styles.productIcon}><Boxes size={22} /></div>
        <span className={`${styles.badge} ${available ? styles.confirmed : styles.pending}`}>
          {!product.active ? 'Inactif' : product.stock === 0 ? 'Épuisé' : 'Disponible'}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className={styles.productPrice}>
        {formatPrice(product.price)} l’unité
        {product.duoPrice !== null && ` · Duo ${formatPrice(product.duoPrice)}`}
      </p>
      <div className={styles.stockCount}>
        <strong>{product.stock}</strong>
        <span>unité{product.stock > 1 ? 's' : ''} disponible{product.stock > 1 ? 's' : ''}</span>
      </div>
      <p className={styles.muted}>
        {product.reservedUnits} unité(s) réservée(s) en attente de paiement.
        Elles sont déjà déduites du stock disponible.
      </p>
      <form onSubmit={submit} className={styles.restockForm}>
        <label htmlFor={`restock-${product.id}`}>Unités reçues à ajouter</label>
        <div>
          <input id={`restock-${product.id}`} type="number" inputMode="numeric"
            min={1} max={10000} step={1} required placeholder="Ex. 20"
            value={quantity} onChange={event => setQuantity(event.target.value)} disabled={blocked} />
          <button type="submit" className={styles.primary} disabled={blocked || quantity === ''}>
            {pending ? <LoaderCircle size={16} className={styles.spinner} /> : <Plus size={16} />}
            {pending ? 'Ajout…' : 'Ajouter'}
          </button>
        </div>
        <p>La quantité s’ajoute au stock actuel. {!product.active && 'Ce produit restera inactif.'}</p>
      </form>
      {!editing ? (
        <button type="button" onClick={() => setEditing(true)} disabled={blocked}
          className={`${styles.secondary} mt-4 w-full`}>
          <Pencil size={15} /> Modifier prix, description et photo
        </button>
      ) : (
        <ProductEditor product={product} blocked={blocked} onSave={onSave}
          onUpload={onUpload} onClose={() => setEditing(false)} />
      )}
    </article>
  );
}

export default function StockView({
  products, blocked, pendingId, onRestock, onSave, onUpload,
}: {
  products: AdminProduct[] | null; blocked: boolean; pendingId: number | null;
  onRestock: Restock; onSave: SaveProduct; onUpload: UploadPhoto;
}) {
  return (
    <section className={styles.section} aria-labelledby="stock-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="stock-title">Produits et réapprovisionnement</h2>
          <p>Modifiez les prix, descriptions et photos de votre catalogue sans toucher au code.</p>
        </div>
      </div>
      {!products ? (
        <div className={styles.empty}>Le stock n’a pas encore été chargé. Utilisez Actualiser.</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}><Boxes size={30} /><h3>Aucun produit au catalogue</h3></div>
      ) : (
        <div className={styles.productGrid}>
          {products.map(product => (
            <StockCard key={product.id} product={product} blocked={blocked}
              pending={pendingId === product.id} onRestock={onRestock} onSave={onSave} onUpload={onUpload} />
          ))}
        </div>
      )}
    </section>
  );
}
