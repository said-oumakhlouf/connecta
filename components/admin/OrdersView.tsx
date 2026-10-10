import DeliveryDetails from '@/components/orders/DeliveryDetails';
import FulfillmentControls from './FulfillmentControls';
import { shortReference, type FulfillmentUpdate } from '@/lib/shipping';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReservationStatus from './ReservationStatus';
import type { AdminOrders } from '@/lib/admin-api';
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
  loading,
  onPage,
  pendingOrderId,
  onStatus,
  onFulfillment,
}: {
  data: AdminOrders | null;
  loading: boolean;
  onPage: (page: number) => void;
  pendingOrderId: string | null;
  onFulfillment: (id: string, update: FulfillmentUpdate) => Promise<boolean>;
  onStatus: (id: string, status: 'CONFIRMED' | 'CANCELLED') => Promise<boolean>;
}) {
  const [now, setNow] = useState(() => Date.now());
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
          <h2 id="orders-title">Les dernières commandes</h2>
          <p>
            Suivez les paiements et les réservations de stock.
            Les données sont actualisées automatiquement toutes les 15 secondes.
          </p>
        </div>
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
              : 'Aucune commande pour le moment'}
          </h3>
          <p>
            {data.page > 1
              ? 'Revenez à la page précédente.'
              : 'Les prochaines commandes apparaîtront ici.'}
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
              <div className={styles.orderMeta}>
                <time dateTime={order.createdAt}>
                  {dateFormat.format(new Date(order.createdAt))}
                </time>
                <span>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                  unité(s)
                </span>
              </div>
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
