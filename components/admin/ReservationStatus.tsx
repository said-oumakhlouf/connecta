import { Clock3 } from 'lucide-react';
import type { AdminOrder } from '@/lib/admin-api';
import { reservationTime } from '@/lib/reservation-time';
import styles from './AdminPanel.module.css';

const deadlineFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'Europe/Paris',
});

export default function ReservationStatus({
  order,
  now,
  customer = false,
}: {
  order: Pick<AdminOrder, 'paymentStatus' | 'reservedUntil'>;
  now: number;
  customer?: boolean;
}) {
  if (order.paymentStatus !== 'UNPAID') {
    return (
      <p className={styles.muted}>
        {order.paymentStatus === 'PAID'
          ? customer
            ? 'Paiement confirmé'
            : 'Paiement Stripe confirmé · mode test'
          : order.paymentStatus === 'EXPIRED'
            ? customer
              ? 'Réservation terminée'
              : 'Réservation terminée · stock restitué (annulation ou expiration)'
            : customer
              ? 'Ancienne commande · contactez-nous pour son suivi'
              : 'Ancienne commande sans paiement Stripe'}
      </p>
    );
  }
  const remaining = reservationTime(order.reservedUntil, now);
  return (
    <div className={styles.reservation}>
      <p>
        <Clock3 size={16} aria-hidden="true" />{' '}
        {customer
          ? 'Paiement en attente'
          : 'Paiement en attente · stock réservé'}
      </p>
      <strong>
        {remaining
          ? remaining.expired
            ? 'Vérification de l’expiration…'
            : `Temps restant : ${remaining.label}`
          : 'Échéance indisponible'}
      </strong>
      {remaining && order.reservedUntil && (
        <small>
          Expiration :{' '}
          <time dateTime={order.reservedUntil}>
            {deadlineFormat.format(new Date(order.reservedUntil))}
          </time>{' '}
          (heure de Paris)
        </small>
      )}
      {remaining?.expired && (
        <small>
          {customer
            ? 'Votre réservation est en cours de vérification.'
            : 'La restitution du stock attend la confirmation du backend.'}
        </small>
      )}
    </div>
  );
}
