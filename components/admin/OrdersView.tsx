import DeliveryDetails from '@/components/orders/DeliveryDetails';
import FulfillmentControls from './FulfillmentControls';
import { shortReference, type FulfillmentUpdate } from '@/lib/shipping';
import { ArrowLeft, ArrowRight, ClipboardList, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReservationStatus from './ReservationStatus';
import { defaultAdminOrderFilters, type AdminOrderFilters, type AdminOrders } from '@/lib/admin-api';
import { formatPrice } from '@/lib/shop-pricing';
import styles from './AdminPanel.module.css';

const statuses = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
};
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
});

export default function OrdersView({
  data,
  filters,
  onFilters,
  loading,
  onPage,
  pendingOrderId,
  onStatus,
  onFulfillment,
}: {
  data: AdminOrders | null;
  filters: AdminOrderFilters;
  onFilters: (filters: AdminOrderFilters) => void;
  loading: boolean;
  onPage: (page: number) => void;
  pendingOrderId: string | null;
  onFulfillment: (id: string, update: FulfillmentUpdate) => Promise<boolean>;
  onStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED') => Promise<boolean>;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filtering = !!(filters.search || filters.letter || filters.sort !== 'date_desc' || filters.filter !== 'all');
  const hasReservations = data?.orders.some((order) => order.paymentStatus === 'UNPAID');
  useEffect(() => {
    if (!hasReservations) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasReservations]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  return (
    <section
      className={styles.section}
      aria-labelledby="orders-title"
      aria-busy={loading}
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="orders-title">Commandes et clients</h2>
          <p>
            Retrouvez un client, ses produits, sa date de commande et la livraison.
            Actualisation automatique toutes les 15 secondes.
          </p>
        </div>
      </div>
      <div className={styles.orderSearchPanel}>
        <form className={styles.orderSearchForm} role="search" onSubmit={(event) => {
          event.preventDefault();
          const term = searchDraft.trim();
          if (term !== filters.search) onFilters({ ...filters, search: term });
        }}>
          <label htmlFor="admin-order-search">Rechercher un client, email, produit ou référence</label>
          <div>
            <input id="admin-order-search" type="search" maxLength={80} value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Nom, email, produit, n° de commande…"
              disabled={loading} />
            <button type="submit" className={styles.primary} disabled={loading}>
              <Search size={16} /> Rechercher
            </button>
          </div>
        </form>
        <div className={styles.orderSearchOptions}>
          <label>Classer les clients
            <select aria-label="Classement des clients" value={filters.sort} disabled={loading}
              onChange={(event) => onFilters({ ...filters, sort: event.target.value as AdminOrderFilters['sort'] })}>
              <option value="date_desc">Plus récentes</option>
              <option value="name_asc">Nom A → Z</option>
              <option value="name_desc">Nom Z → A</option>
            </select>
          </label>
          <label>État de la commande
            <select aria-label="Filtrer les commandes" value={filters.filter} disabled={loading}
              onChange={(event) => onFilters({ ...filters, filter: event.target.value as AdminOrderFilters['filter'] })}>
              <option value="all">Tous les états</option>
              <option value="paid">Payées</option>
              <option value="unpaid">En attente de paiement</option>
              <option value="preparing">En préparation</option>
              <option value="shipped">Expédiées</option>
              <option value="delivered">Livrées</option>
            </select>
          </label>
          {filtering && <button type="button" className={styles.orderReset} disabled={loading}
            onClick={() => { setSearchDraft(''); onFilters(defaultAdminOrderFilters); }}>
            <X size={14} /> Effacer les filtres
          </button>}
        </div>
        <div className={styles.letters} aria-label="Filtrer par initiale du client">
          <button type="button" aria-pressed={!filters.letter} disabled={loading}
            className={!filters.letter ? styles.letterSelected : ''}
            onClick={() => onFilters({ ...filters, letter: '' })}>Tous</button>
          {letters.map(letter => (
            <button type="button" key={letter} aria-label={`Clients commençant par ${letter}`}
              aria-pressed={filters.letter === letter} disabled={loading}
              className={filters.letter === letter ? styles.letterSelected : ''}
              onClick={() => onFilters({ ...filters, letter: filters.letter === letter ? '' : letter })}>
              {letter}
            </button>
          ))}
        </div>
        <p className={styles.orderSearchCaption}>
          {data ? `${data.total} commande${data.total > 1 ? 's' : ''} trouvée${data.total > 1 ? 's' : ''}` : 'Recherche des commandes…'}
          {' · '}Les recherches portent sur toutes les commandes, pas uniquement cette page.
        </p>
      </div>
      {!data ? (
        <div className={styles.empty}>
          {loading
            ? 'Chargement des commandes…'
            : 'Actualisez pour charger les commandes.'}
        </div>
      ) : data.orders.length === 0 ? (
        <div className={styles.empty}>
          <ClipboardList size={30} />
          <h3>
            {data.page > 1
              ? 'Aucune commande sur cette page'
              : filtering ? 'Aucun résultat pour cette recherche' : 'Aucune commande pour le moment'}
          </h3>
          <p>
            {data.page > 1
              ? 'Revenez à la page précédente.'
              : filtering ? 'Essayez une autre initiale, un autre nom ou effacez les filtres.' : 'Les prochaines commandes apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className={styles.orders}>
          {data.orders.map((order) => (
            <article key={order.id} className={styles.order}>
              <div className={styles.orderTop}>
                <div>
                  <h3>{order.customerName}</h3>
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className={styles.email}
                  >
                    {order.customerEmail}
                  </a>
                </div>
                <div className={styles.orderAmount}>
                  <strong>{formatPrice(order.total)}</strong>
                  <span
                    className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}
                  >
                    {statuses[order.status]}
                  </span>
                </div>
              </div>
              <ReservationStatus order={order} now={now} />
              <div className={styles.orderProducts} aria-label="Produits commandés">
                {order.items.map(item => (
                  <div key={item.productId}>
                    <span>{item.productName}</span>
                    <strong>× {item.quantity}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.orderMeta}>
                <time dateTime={order.createdAt} title="Date de commande">
                  Commandée le {dateFormat.format(new Date(order.createdAt))}
                </time>
                <span>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                  unité(s)
                </span>
              </div>
              {order.deliveredAt ? (
                <p className={styles.deliveryDate}>
                  <time dateTime={order.deliveredAt}>
                    Réception confirmée le {dateFormat.format(new Date(order.deliveredAt))}
                  </time>
                  <small>Statut enregistré dans CONNECTA</small>
                </p>
              ) : order.shippedAt ? (
                <p className={styles.shippingDate}>
                  Expédiée le {dateFormat.format(new Date(order.shippedAt))} · Réception non confirmée
                </p>
              ) : null}
              <details className={styles.details}>
                <summary>Détail de la commande</summary>
                <p className={styles.orderId}>Réservation n° {shortReference(order.id)}</p>
                {order.items.map((item) => (
                  <div key={item.productId} className={styles.orderItem}>
                    <div>
                      <strong>{item.productName}</strong>
                      <small>
                        {item.quantity} × {formatPrice(item.unitPrice)}
                        {item.discount > 0 &&
                          ` · remise ${formatPrice(item.discount)}`}
                      </small>
                    </div>
                    <strong>{formatPrice(item.lineTotal)}</strong>
                  </div>
                ))}
                <DeliveryDetails order={order} />
              </details>
              <FulfillmentControls order={order} disabled={loading} onUpdate={onFulfillment} />
              {order.status !== 'CANCELLED' &&
                order.paymentStatus !== 'PAID' && (
                  <div className={styles.orderActions}>
                    {cancellingId === order.id ? (
                      <>
                        <p>
                          Annuler cette commande ? Les{' '}
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{' '}
                          unité(s) seront remises en stock. Cette action est
                          définitive.
                        </p>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          disabled={loading}
                          onClick={async () => {
                            if (await onStatus(order.id, 'CANCELLED'))
                              setCancellingId(null);
                          }}
                        >
                          {pendingOrderId === order.id
                            ? 'Annulation…'
                            : 'Oui, annuler la commande'}
                        </button>
                        <button
                          type="button"
                          className={styles.secondary}
                          disabled={loading}
                          onClick={() => setCancellingId(null)}
                        >
                          Conserver la commande
                        </button>
                      </>
                    ) : (
                      <>
                        {order.status === 'PENDING' &&
                          (order.paymentStatus === 'LEGACY' ||
                            !order.paymentStatus) && (
                            <button
                              type="button"
                              className={styles.primary}
                              disabled={loading}
                              onClick={() =>
                                void onStatus(order.id, 'CONFIRMED')
                              }
                            >
                              {pendingOrderId === order.id
                                ? 'Confirmation…'
                                : 'Confirmer la commande'}
                            </button>
                          )}
                        <button
                          type="button"
                          className={styles.secondary}
                          disabled={loading}
                          onClick={() => setCancellingId(order.id)}
                        >
                          Annuler
                        </button>
                        <p>Le statut de commande ne valide pas un paiement.</p>
                      </>
                    )}
                  </div>
                )}
            </article>
          ))}
        </div>
      )}
      {data && data.total > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.secondary}
            type="button"
            disabled={loading || data.page <= 1}
            onClick={() => onPage(data.page - 1)}
          >
            <ArrowLeft size={15} />
            Précédent
          </button>
          <span>
            Page {data.page} sur {pages}
          </span>
          <button
            className={styles.secondary}
            type="button"
            disabled={loading || data.page >= pages}
            onClick={() => onPage(data.page + 1)}
          >
            Suivant
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
