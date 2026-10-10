"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import {
  shopApi,
  type CheckoutStatus,
  type CheckoutSession,
} from "@/lib/shop-api";
import { formatPrice } from "@/lib/shop-pricing";
import { shortReference } from "@/lib/shipping";
import BrandName from "@/components/layout/BrandName";

export default function PaymentReturn() {
  const params = useSearchParams();
  const [sessionId, setSessionId] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [data, setData] = useState<CheckoutStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const cancelling = useRef(false);

  useEffect(() => {
    let saved: CheckoutSession | null = null;
    try {
      saved = JSON.parse(
        sessionStorage.getItem("connectaCheckoutSession") ?? "null",
      );
    } catch {
      /* Optional resume data. */
    }
    const id = params.get("session_id") ?? saved?.sessionId ?? "";
    setSessionId(/^cs_test_[a-zA-Z0-9]+$/.test(id) ? id : "");
    if (saved?.sessionId === id) {
      try {
        const url = new URL(saved.url);
        if (url.protocol === "https:" && url.hostname === "checkout.stripe.com")
          setResumeUrl(saved.url);
      } catch {
        /* Invalid saved URL. */
      }
    }
  }, [params]);

  const refresh = useCallback(async () => {
    if (!sessionId || cancelling.current) return;
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError("");
    try {
      const result = await shopApi.checkoutStatus(sessionId);
      if (sequence !== requestSequence.current) return;
      setData(result);
      if (result.paymentStatus !== "UNPAID") {
        sessionStorage.removeItem("connectaCheckoutAttempt");
        sessionStorage.removeItem("connectaCheckoutSession");
      }
    } catch (problem) {
      if (sequence !== requestSequence.current) return;
      setError(
        problem instanceof Error
          ? problem.message
          : "Vérification indisponible.",
      );
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
    return () => {
      requestSequence.current += 1;
    };
  }, [refresh]);
  useEffect(() => {
    if (
      !data ||
      data.paymentStatus !== "UNPAID" ||
      params.get("retour") === "1"
    )
      return;
    const timer = setTimeout(() => void refresh(), 5000);
    return () => clearTimeout(timer);
  }, [data, params, refresh]);

  async function cancel() {
    if (!sessionId || loading) return;
    cancelling.current = true;
    requestSequence.current += 1;
    setLoading(true);
    setError("");
    try {
      setData(await shopApi.cancelCheckout(sessionId));
      sessionStorage.removeItem("connectaCheckoutAttempt");
      sessionStorage.removeItem("connectaCheckoutSession");
    } catch (problem) {
      setError(
        problem instanceof Error ? problem.message : "Annulation indisponible.",
      );
    } finally {
      cancelling.current = false;
      setLoading(false);
    }
  }

  const paid = data?.paymentStatus === "PAID";
  const expired = data?.paymentStatus === "EXPIRED";
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <div className="rounded-3xl border border-[#e9eaed] bg-white p-7 text-center sm:p-12">
        <p className="mb-5 text-[10px] font-semibold tracking-widest text-[#72767f]">
          <BrandName /> · MODE TEST
        </p>
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-[#edf2ff] text-[#235bfa]">
          {paid ? <CheckCircle2 size={30} /> : <Clock size={30} />}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {paid
            ? "Paiement test confirmé."
            : expired
              ? "Réservation annulée."
              : "Votre paiement."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#72767f]">
          {paid
            ? "Stripe a confirmé le paiement de test. Votre commande est enregistrée ; aucun argent réel n’a été débité."
            : expired
              ? "Les articles ont été remis à disposition. Vous pouvez revenir à la boutique."
              : params.get("retour") === "1"
                ? "Vous avez quitté le paiement. Reprenez-le ou annulez la réservation pour libérer les articles."
                : "Nous vérifions la confirmation auprès de Stripe. Le retour sur cette page ne suffit pas à valider un paiement."}
        </p>
        {data && (
          <dl className="mt-7 space-y-4 rounded-2xl bg-[#f7f8fa] p-5 text-left text-sm">
            <div>
              <dt className="text-[#72767f]">Commande</dt>
              <dd className="mt-1 break-all font-medium">{shortReference(data.orderId)}</dd>
            </div>
            {data.shippingFee !== undefined && <>
              <div className="flex justify-between"><dt>Articles</dt><dd>{formatPrice(data.total - data.shippingFee)}</dd></div>
              <div className="flex justify-between"><dt>Livraison</dt><dd>{formatPrice(data.shippingFee)}</dd></div>
            </>}
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="font-semibold">{formatPrice(data.total)}</dd>
            </div>
            {data.paymentStatus === "UNPAID" && (
              <div>
                <dt className="text-[#72767f]">Réservation jusqu’au</dt>
                <dd>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "Europe/Paris",
                  }).format(new Date(data.expiresAt))}
                </dd>
              </div>
            )}
          </dl>
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {!paid && !expired && sessionId && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void refresh()}
              className="flex items-center gap-2 rounded-full border px-5 py-3 text-sm disabled:opacity-40"
            >
              <RefreshCw size={15} />
              {loading ? "Vérification…" : "Vérifier le paiement"}
            </button>
            {data?.paymentStatus === "UNPAID" && (
              <>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    referrerPolicy="no-referrer"
                    className="rounded-full bg-[#235bfa] px-5 py-3 text-sm text-white"
                  >
                    Reprendre le paiement
                  </a>
                )}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void cancel()}
                  className="rounded-full border px-5 py-3 text-sm disabled:opacity-40"
                >
                  Annuler la réservation
                </button>
              </>
            )}
          </div>
        )}
        {!sessionId && (
          <p className="mt-5 text-sm text-[#72767f]">
            Aucune réservation à vérifier dans ce navigateur. Les réservations
            non payées expirent automatiquement.
          </p>
        )}
        <a
          href="/"
          className="mt-7 inline-block text-sm font-semibold text-[#235bfa]"
        >
          Retour à la boutique →
        </a>
      </div>
    </main>
  );
}
