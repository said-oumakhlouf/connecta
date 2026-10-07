import type { AdminAnalytics } from '@/lib/admin-api';
import { formatPrice } from '@/lib/shop-pricing';
import styles from './AdminPanel.module.css';

export default function AnalyticsView({
  data,
  month,
  blocked,
  onMonth,
}: {
  data: AdminAnalytics | null;
  month: string;
  blocked: boolean;
  onMonth: (month: string) => void;
}) {
  const maxUnits = data?.products[0]?.units ?? 1;
  return (
    <section
      className={styles.analytics}
      aria-labelledby="analytics-title"
      aria-busy={blocked}
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>L’ACTIVITÉ DE CONNECTA</p>
          <h2 id="analytics-title">Votre bilan mensuel.</h2>
          <p>
            Commandes du mois choisi, selon l’heure de Paris. Annulations
            exclues des totaux.
          </p>
        </div>
        <div className={styles.monthPicker}>
          <label htmlFor="analytics-month">Mois à analyser</label>
          <input
            id="analytics-month"
            type="month"
            min="2000-01"
            max="2099-12"
            value={month}
            disabled={blocked}
            onChange={(event) => onMonth(event.target.value)}
          />
        </div>
      </div>
      <div className={styles.monthStats}>
        <div>
          <span>Montant des commandes</span>
          <strong>{data ? formatPrice(data.amount) : '—'}</strong>
          <small>En attente + confirmées</small>
        </div>
        <div>
          <span>Commandes</span>
          <strong>{data?.orderCount ?? '—'}</strong>
          <small>Hors annulations</small>
        </div>
        <div>
          <span>Unités commandées</span>
          <strong>{data?.units ?? '—'}</strong>
          <small>Quantités réelles, Duo = 2</small>
        </div>
        <div>
          <span>Panier moyen</span>
          <strong>{data ? formatPrice(data.averageOrder) : '—'}</strong>
          <small>Montant moyen par commande</small>
        </div>
      </div>
      {data && (
        <div className={styles.statusBreakdown}>
          <span>
            <i className={styles.confirmed} />
            Confirmées : <strong>{formatPrice(data.confirmed.amount)}</strong> (
            {data.confirmed.count})
          </span>
          <span>
            <i className={styles.pending} />
            En attente : <strong>{formatPrice(data.pending.amount)}</strong> (
            {data.pending.count})
          </span>
          <span>
            <i className={styles.cancelled} />
            Annulées : <strong>{formatPrice(data.cancelled.amount)}</strong> (
            {data.cancelled.count}) · exclues
          </span>
        </div>
      )}
      <p className={styles.analyticsNote}>
        Ces montants représentent les commandes après remise, pas les paiements
        encaissés ni le bénéfice.
      </p>
      <div className={styles.rankingHeading}>
        <h3>Les produits les plus commandés</h3>
        <span>Classement par unités</span>
      </div>
      {!data ? (
        <p className={styles.muted}>
          {blocked
            ? 'Chargement du bilan…'
            : 'Actualisez pour charger le bilan.'}
        </p>
      ) : !data.products.length ? (
        <p className={styles.muted}>
          Aucune commande non annulée pour ce mois.
        </p>
      ) : (
        <ol className={styles.ranking}>
          {data.products.map((product, index) => (
            <li key={product.productId}>
              <span className={styles.rankNumber}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.rankingProduct}>
                <strong>{product.name}</strong>
                <span>
                  {product.units} unité(s) · {product.orderCount} commande(s)
                </span>
                <div className={styles.rankTrack} aria-hidden="true">
                  <div
                    style={{ width: `${(product.units / maxUnits) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.rankAmount}>
                <strong>{formatPrice(product.amount)}</strong>
                <small>{formatPrice(product.discount)} de remise</small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
