import { Boxes, LoaderCircle, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { ApiProduct } from '@/lib/shop-api';
import { formatPrice } from '@/lib/shop-pricing';
import styles from './AdminPanel.module.css';

type Restock = (productId: number, quantity: number) => Promise<boolean>;

function StockCard({
  product,
  blocked,
  pending,
  onRestock,
}: {
  product: ApiProduct;
  blocked: boolean;
  pending: boolean;
  onRestock: Restock;
}) {
  const [quantity, setQuantity] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onRestock(product.id, Number(quantity))) setQuantity('');
  }
  const available = product.active && product.stock > 0;
  return (
    <article className={styles.product}>
      <div className={styles.productTop}>
        <div className={styles.productIcon}>
          <Boxes size={22} />
        </div>
        <span
          className={`${styles.badge} ${available ? styles.confirmed : styles.pending}`}
        >
          {!product.active
            ? 'Inactif'
            : product.stock === 0
              ? 'Épuisé'
              : 'Disponible'}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className={styles.productPrice}>
        {formatPrice(product.price)} l’unité
        {product.duoPrice !== null && ` · Duo ${formatPrice(product.duoPrice)}`}
      </p>
      <div className={styles.stockCount}>
        <strong>{product.stock}</strong>
        <span>unité{product.stock > 1 ? 's' : ''} en stock</span>
      </div>
      <form onSubmit={submit} className={styles.restockForm}>
        <label htmlFor={`restock-${product.id}`}>Unités reçues à ajouter</label>
        <div>
          <input
            id={`restock-${product.id}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            step={1}
            required
            placeholder="Ex. 20"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={blocked}
          />
          <button
            type="submit"
            className={styles.primary}
            disabled={blocked || quantity === ''}
          >
            {pending ? (
              <LoaderCircle size={16} className={styles.spinner} />
            ) : (
              <Plus size={16} />
            )}
            {pending ? 'Ajout…' : 'Ajouter'}
          </button>
        </div>
        <p>
          La quantité s’ajoute au stock actuel.
          {!product.active && ' Ce produit restera inactif.'}
        </p>
      </form>
    </article>
  );
}

export default function StockView({
  products,
  blocked,
  pendingId,
  onRestock,
}: {
  products: ApiProduct[] | null;
  blocked: boolean;
  pendingId: number | null;
  onRestock: Restock;
}) {
  return (
    <section className={styles.section} aria-labelledby="stock-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="stock-title">Produits et réapprovisionnement</h2>
          <p>Une nouvelle livraison ? Ajoutez les unités réellement reçues.</p>
        </div>
      </div>
      {!products ? (
        <div className={styles.empty}>
          Le stock n’a pas encore été chargé. Utilisez Actualiser.
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Boxes size={30} />
          <h3>Aucun produit au catalogue</h3>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <StockCard
              key={product.id}
              product={product}
              blocked={blocked}
              pending={pendingId === product.id}
              onRestock={onRestock}
            />
          ))}
        </div>
      )}
    </section>
  );
}
