'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  LogOut,
  Mail,
  Package,
  RefreshCw,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';
import ReservationStatus from '@/components/admin/ReservationStatus';
import {
  memberApi,
  MemberApiError,
  type MemberProfile,
  type MemberOrders,
} from '@/lib/member-api';
import { formatPrice } from '@/lib/shop-pricing';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
});
const button =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-40';

export default function MemberPanel() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [data, setData] = useState<MemberOrders | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const sequence = useRef(0);
  const submitting = useRef(false);
  const loginLink = useRef<string | null>(null);

  const report = useCallback((problem: unknown) => {
    if (problem instanceof MemberApiError && problem.status === 401) {
      sequence.current++;
      setProfile(null);
      setData(null);
    }
    setError(
      problem instanceof Error ? problem.message : 'Une erreur est survenue.',
    );
  }, []);

  useEffect(() => {
    let active = true;
    const candidate =
      new URLSearchParams(window.location.hash.slice(1)).get('connexion') ??
      loginLink.current;
    if (candidate) {
      loginLink.current = candidate;
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname,
      );
      if (/^[a-f0-9]{64}$/.test(candidate)) setToken(candidate);
      else setError('Lien de connexion invalide. Demandez un nouveau lien.');
      setBusy(false);
      return;
    }
    void memberApi
      .me()
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((problem: unknown) => {
        if (
          active &&
          !(problem instanceof MemberApiError && problem.status === 401)
        )
          report(problem);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      sequence.current++;
    };
  }, [report]);

  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const result = await memberApi.orders(page);
      if (request === sequence.current) {
        setData(result);
        setError('');
      }
    } catch (problem) {
      if (request === sequence.current) report(problem);
    }
  }, [page, report]);

  useEffect(() => {
    if (!profile) return;
    void load();
    let refreshing = false;
    const poll = setInterval(() => {
      if (document.hidden || submitting.current || refreshing) return;
      refreshing = true;
      void load().finally(() => {
        refreshing = false;
      });
    }, 15000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
      sequence.current++;
    };
  }, [profile, load]);

  async function act(action: () => Promise<void>) {
    if (submitting.current) return;
    submitting.current = true;
    sequence.current++;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (problem) {
      report(problem);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await act(async () => {
      const result = await memberApi.login(email);
      setMessage(
        result.delivery === 'console'
          ? 'Mode test local : le lien de connexion est affiché dans le terminal du backend. Aucun email n’a été envoyé.'
          : 'Votre lien de connexion a été envoyé. Vérifiez votre boîte mail et vos courriers indésirables. Il est valable 15 minutes.',
      );
    });
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-7 text-[#17191d] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#72767f]"
            >
              <ArrowLeft size={15} /> Boutique
            </a>
            {profile && (
              <button
                type="button"
                disabled={busy}
                className={`${button} bg-white`}
                onClick={() =>
                  void act(async () => {
                    await memberApi.logout();
                    sequence.current++;
                    setProfile(null);
                    setData(null);
                    setPage(1);
                    setEmail('');
                  })
                }
              >
                <LogOut size={16} /> Déconnexion
              </button>
            )}
          </div>
        </header>
        <p className="mb-3 text-[10px] font-semibold tracking-[2px] text-[#72767f]">
          VOTRE ESPACE CONNECTA
        </p>
        <h1 className="text-3xl font-semibold tracking-[-1px] sm:text-4xl">
          {profile ? 'Mes commandes.' : 'Bienvenue chez vous.'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#72767f]">
          {profile
            ? profile.email
            : 'Retrouvez vos commandes et gérez vos réservations, sans mot de passe.'}
        </p>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800"
          >
            {message}
          </p>
        )}
        {!profile ? (
          <section className="mt-8 max-w-lg rounded-2xl border border-[#e9eaed] bg-white p-6 sm:p-8">
            {token ? (
              <>
                <Mail size={28} className="mb-5 text-[#235bfa]" />
                <h2 className="text-lg font-semibold">
                  Confirmer ma connexion
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#72767f]">
                  Ce lien permet d’accéder aux commandes de votre adresse email.
                  Confirmez pour ouvrir votre espace membre.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  className={`${button} mt-6 w-full bg-[#235bfa] text-white`}
                  onClick={() =>
                    void act(async () => {
                      const result = await memberApi.verify(token);
                      setToken('');
                      setPage(1);
                      setProfile(result);
                    })
                  }
                >
                  {busy ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <ArrowRight size={17} />
                  )}{' '}
                  Ouvrir mon espace
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setToken('');
                    setError('');
                  }}
                  className={`${button} mt-2 w-full`}
                >
                  Demander un nouveau lien
                </button>
              </>
            ) : (
              <form onSubmit={login}>
                <label
                  htmlFor="member-email"
                  className="mb-3 block text-sm font-medium"
                >
                  Votre adresse email
                </label>
                <input
                  id="member-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                  className="w-full rounded-xl border border-[#dfe2e8] px-4 py-3 text-base outline-none focus:border-[#235bfa]"
                />
                <p className="mt-3 text-xs leading-5 text-[#72767f]">
                  Utilisez l’adresse de vos commandes. Vous recevrez un lien
                  valable 15 minutes pour vous connecter ou créer votre compte.
                </p>
                <button
                  type="submit"
                  disabled={busy}
                  className={`${button} mt-6 w-full bg-[#235bfa] text-white`}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Mail size={17} />
                  )}{' '}
                  Recevoir mon lien
                </button>
              </form>
            )}
          </section>
        ) : (
          <>
            <div className="my-7 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#72767f]">
                Actualisation automatique toutes les 15 secondes.
              </p>
              <button
                type="button"
                disabled={busy}
                className={`${button} bg-white`}
                onClick={() => void act(load)}
              >
                <RefreshCw size={15} /> Actualiser
              </button>
            </div>
            {!data ? (
              <p className="rounded-2xl bg-white p-8">
                Chargement de vos commandes…
              </p>
            ) : data.orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center">
                <Package size={30} className="mx-auto mb-4 text-[#235bfa]" />
                <h2 className="text-lg font-semibold">
                  Aucune commande sur cette page
                </h2>
                <a
                  href="/"
                  className={`${button} mt-5 bg-[#235bfa] text-white`}
                >
                  Découvrir la boutique <ArrowRight size={15} />
                </a>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {data.orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-[#e9eaed] bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#72767f]">
                          {dateFormat.format(new Date(order.createdAt))}
                        </p>
                        <h2 className="mt-2 font-semibold">
                          {order.items[0].productName}
                        </h2>
                      </div>
                      <strong className="whitespace-nowrap text-lg">
                        {formatPrice(order.total)}
                      </strong>
                    </div>
                    <p className="my-3 text-sm font-medium">
                      {order.paymentStatus === 'PAID'
                        ? 'Payée'
                        : order.paymentStatus === 'EXPIRED'
                          ? 'Réservation terminée'
                          : order.status === 'CANCELLED'
                            ? 'Annulée'
                            : order.status === 'CONFIRMED'
                              ? 'Confirmée'
                              : 'En attente'}
                    </p>
                    <ReservationStatus order={order} now={now} customer />
                    <details className="mt-5 border-t border-[#eff0f3] pt-4 text-sm">
                      <summary className="cursor-pointer font-medium">
                        Détail de ma commande
                      </summary>
                      <p className="my-3 break-all text-[10px] text-[#72767f]">
                        N° {order.id}
                      </p>
                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="mt-3 flex justify-between gap-3"
                        >
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <strong>{formatPrice(item.lineTotal)}</strong>
                        </div>
                      ))}
                    </details>
                    {order.paymentStatus === 'UNPAID' && (
                      <div className="mt-5 border-t border-[#eff0f3] pt-4">
                        {confirmId === order.id ? (
                          <>
                            <p className="mb-3 text-sm leading-6">
                              Annuler cette réservation et libérer les articles
                              ?
                            </p>
                            <button
                              type="button"
                              disabled={busy}
                              className={`${button} bg-red-50 text-red-800`}
                              onClick={() =>
                                void act(async () => {
                                  await memberApi.cancel(order.id);
                                  setConfirmId(null);
                                  await load();
                                  setMessage(
                                    'Réservation annulée. Les articles sont de nouveau disponibles.',
                                  );
                                })
                              }
                            >
                              Oui, annuler
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              className={button}
                              onClick={() => setConfirmId(null)}
                            >
                              Conserver
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              className={`${button} bg-[#235bfa] text-white`}
                              onClick={() =>
                                void act(async () => {
                                  const session = await memberApi.resume(
                                    order.id,
                                  );
                                  sessionStorage.setItem(
                                    'connectaCheckoutSession',
                                    JSON.stringify(session),
                                  );
                                  window.location.assign(session.url);
                                })
                              }
                            >
                              Reprendre le paiement
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              className={`${button} bg-[#f6f7f9]`}
                              onClick={() => setConfirmId(order.id)}
                            >
                              Annuler la réservation
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
            {data && data.total > 20 && (
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={busy || page === 1}
                  className={`${button} bg-white`}
                  onClick={() => {
                    setData(null);
                    setPage(page - 1);
                  }}
                >
                  Précédent
                </button>
                <span className="text-sm">
                  Page {page} sur {Math.ceil(data.total / 20)}
                </span>
                <button
                  type="button"
                  disabled={busy || page * 20 >= data.total}
                  className={`${button} bg-white`}
                  onClick={() => {
                    setData(null);
                    setPage(page + 1);
                  }}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
