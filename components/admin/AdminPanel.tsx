'use client';

import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import Logo from '@/components/layout/Logo';
import BrandName from '@/components/layout/BrandName';
import {
  adminApi,
  AdminApiError,
  type AdminOrders,
  type AdminSession,
  type AdminAnalytics,
} from '@/lib/admin-api';
import type { ApiProduct } from '@/lib/shop-api';
import OrdersView from './OrdersView';
import StockView from './StockView';
import AnalyticsView from './AnalyticsView';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'orders' | 'stock'>('orders');
  const [orders, setOrders] = useState<AdminOrders | null>(null);
  const [products, setProducts] = useState<ApiProduct[] | null>(null);
  const [month, setMonth] = useState(() => {
    const parts = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(new Date());
    return `${parts.find((part) => part.type === 'year')!.value}-${parts.find((part) => part.type === 'month')!.value}`;
  });
  const monthRef = useRef(month);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const activeToken = useRef<string | null>(null);
  const requestSequence = useRef(0);
  const submitting = useRef(false);

  const endSession = useCallback((message = '') => {
    activeToken.current = null;
    requestSequence.current++;
    setSession(null);
    setOrders(null);
    setProducts(null);
    setAnalytics(null);
    setLoading(false);
    setPendingId(null);
    setPendingOrderId(null);
    setPassword('');
    setSuccess('');
    setError(message);
  }, []);

  const reportError = useCallback(
    (problem: unknown) => {
      const message =
        problem instanceof Error ? problem.message : 'Une erreur est survenue.';
      if (problem instanceof AdminApiError && problem.status === 401)
        endSession(message);
      else setError(message);
    },
    [endSession],
  );

  const load = useCallback(
    async (token: string, page = 1, selectedMonth = monthRef.current) => {
      const sequence = ++requestSequence.current;
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const [nextOrders, nextProducts, nextAnalytics] = await Promise.all([
          adminApi.orders(token, page),
          adminApi.products(token),
          adminApi.analytics(token, selectedMonth),
        ]);
        if (
          sequence !== requestSequence.current ||
          token !== activeToken.current
        )
          return;
        setOrders(nextOrders);
        setProducts(nextProducts);
        setAnalytics(nextAnalytics);
      } catch (problem) {
        if (
          sequence === requestSequence.current &&
          token === activeToken.current
        )
          reportError(problem);
      } finally {
        if (sequence === requestSequence.current) setLoading(false);
      }
    },
    [reportError],
  );

  useEffect(() => {
    if (!session) return;
    void load(session.token);
    const timer = setTimeout(
      () => endSession('Votre session a expiré. Reconnectez-vous.'),
      Math.max(0, Date.parse(session.expiresAt) - Date.now()),
    );
    return () => {
      clearTimeout(timer);
      requestSequence.current++;
    };
  }, [session, load, endSession]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      const nextSession = await adminApi.login(password);
      activeToken.current = nextSession.token;
      setSession(nextSession);
      setPassword('');
      setTab('orders');
    } catch (problem) {
      reportError(problem);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function logout() {
    if (!session || submitting.current) return;
    submitting.current = true;
    setLoading(true);
    try {
      await adminApi.logout(session.token);
    } catch {
      /* Local credentials are cleared even if the API is unavailable. */
    } finally {
      submitting.current = false;
      endSession();
    }
  }

  async function restock(
    productId: number,
    quantity: number,
  ): Promise<boolean> {
    if (!session || submitting.current || loading) return false;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      setError('Saisissez une quantité entière entre 1 et 10 000.');
      return false;
    }
    submitting.current = true;
    setPendingId(productId);
    setError('');
    setSuccess('');
    const token = session.token;
    try {
      const updated = await adminApi.restock(token, productId, quantity);
      if (token !== activeToken.current) return false;
      setProducts(
        (current) =>
          current?.map((product) =>
            product.id === updated.id ? updated : product,
          ) ?? null,
      );
      setSuccess(
        `${quantity} unité${quantity > 1 ? 's' : ''} ajoutée${quantity > 1 ? 's' : ''} pour ${updated.name}. Nouveau stock : ${updated.stock}.`,
      );
      return true;
    } catch (problem) {
      if (token === activeToken.current) reportError(problem);
      return false;
    } finally {
      submitting.current = false;
      setPendingId(null);
    }
  }

  async function updateOrderStatus(
    orderId: string,
    status: 'CONFIRMED' | 'CANCELLED',
  ): Promise<boolean> {
    if (!session || submitting.current || loading) return false;
    submitting.current = true;
    setPendingOrderId(orderId);
    setError('');
    setSuccess('');
    const token = session.token;
    let changed = false;
    try {
      const updated = await adminApi.updateOrderStatus(token, orderId, status);
      if (token !== activeToken.current) return false;
      changed = true;
      setOrders((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((order) =>
                order.id === updated.id ? updated : order,
              ),
            }
          : null,
      );
      setSuccess(
        status === 'CANCELLED'
          ? 'Commande annulée. Les articles ont été remis en stock.'
          : 'Commande confirmée. Le paiement reste à vérifier séparément.',
      );
      setAnalytics(null);
      const [nextAnalytics, nextProducts] = await Promise.all([
        adminApi.analytics(token, monthRef.current),
        status === 'CANCELLED'
          ? adminApi.products(token)
          : Promise.resolve(null),
      ]);
      if (token === activeToken.current) {
        setAnalytics(nextAnalytics);
        if (nextProducts) setProducts(nextProducts);
      }
      return true;
    } catch (problem) {
      if (token === activeToken.current) reportError(problem);
      return changed;
    } finally {
      submitting.current = false;
      setPendingOrderId(null);
    }
  }

  if (!session)
    return (
      <main className={styles.loginPage}>
        <div className={styles.loginCard}>
          <Logo />
          <div className={styles.loginIcon}>
            <LockKeyhole size={23} />
          </div>
          <p className={styles.eyebrow}>ESPACE ADMINISTRATEUR</p>
          <h1>Bienvenue chez vous.</h1>
          <p className={styles.muted}>
            Retrouvez vos commandes et gérez votre stock <BrandName />.
          </p>
          <form onSubmit={login} className={styles.loginForm}>
            <label htmlFor="admin-password">Mot de passe administrateur</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <button className={styles.primary} disabled={loading} type="submit">
              {loading ? (
                <LoaderCircle size={17} className={styles.spinner} />
              ) : (
                <ArrowRight size={17} />
              )}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
          <a href="/" className={styles.backLink}>
            <ArrowLeft size={15} /> Retour à la boutique
          </a>
        </div>
      </main>
    );

  const blocked = loading || pendingId !== null || pendingOrderId !== null;
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Logo />
          <span>Administration</span>
        </div>
        <div className={styles.headerActions}>
          <a href="/" className={styles.storeLink}>
            Voir la boutique <ArrowRight size={14} />
          </a>
          <button
            type="button"
            className={styles.logout}
            onClick={() => void logout()}
            disabled={blocked}
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>VOTRE BOUTIQUE, EN UN COUP D’ŒIL</p>
            <h1>Le tableau de bord.</h1>
            <p className={styles.muted}>
              Les commandes reçues et le stock disponible, au même endroit.
            </p>
          </div>
          <button
            className={styles.secondary}
            type="button"
            disabled={blocked}
            onClick={() => void load(session.token, orders?.page ?? 1)}
          >
            <RefreshCw
              size={15}
              className={loading ? styles.spinner : undefined}
            />
            {loading ? 'Chargement…' : 'Actualiser'}
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <ClipboardList size={19} />
            <span>Commandes reçues</span>
            <strong>{orders?.total ?? '—'}</strong>
            <small>Tous les statuts</small>
          </div>
          <div className={styles.stat}>
            <Boxes size={19} />
            <span>Unités en stock</span>
            <strong>
              {products?.reduce((sum, product) => sum + product.stock, 0) ??
                '—'}
            </strong>
            <small>
              {products
                ? `${products.length} produit${products.length > 1 ? 's' : ''} au catalogue`
                : 'Chargement du catalogue'}
            </small>
          </div>
          <div className={styles.stat}>
            <CheckCircle2 size={19} />
            <span>Produits disponibles</span>
            <strong>
              {products?.filter(
                (product) => product.active && product.stock > 0,
              ).length ?? '—'}
            </strong>
            <small>Actifs et en stock</small>
          </div>
        </div>
        <AnalyticsView
          data={analytics}
          month={month}
          blocked={blocked}
          onMonth={(nextMonth) => {
            if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(nextMonth) || blocked) return;
            monthRef.current = nextMonth;
            setMonth(nextMonth);
            setAnalytics(null);
            void load(session.token, orders?.page ?? 1, nextMonth);
          }}
        />
        <nav className={styles.tabs} aria-label="Vues de l’administration">
          <button
            type="button"
            className={tab === 'orders' ? styles.selectedTab : ''}
            onClick={() => setTab('orders')}
            aria-current={tab === 'orders' ? 'page' : undefined}
          >
            <ClipboardList size={17} />
            Commandes
          </button>
          <button
            type="button"
            className={tab === 'stock' ? styles.selectedTab : ''}
            onClick={() => setTab('stock')}
            aria-current={tab === 'stock' ? 'page' : undefined}
          >
            <Boxes size={17} />
            Produits et stock
          </button>
        </nav>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className={styles.success} role="status">
            <CheckCircle2 size={17} />
            {success}
          </p>
        )}
        {tab === 'orders' ? (
          <OrdersView
            data={orders}
            loading={blocked}
            pendingOrderId={pendingOrderId}
            onStatus={updateOrderStatus}
            onPage={(page) => void load(session.token, page)}
          />
        ) : (
          <StockView
            products={products}
            blocked={blocked}
            pendingId={pendingId}
            onRestock={restock}
          />
        )}
      </main>
    </div>
  );
}
