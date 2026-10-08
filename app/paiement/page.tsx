import { Suspense } from 'react';
import PaymentReturn from '@/components/shop/PaymentReturn';

export const metadata = {
  title: 'Votre paiement | CONNECTA',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="p-12 text-center">Vérification du paiement…</main>
      }
    >
      <PaymentReturn />
    </Suspense>
  );
}
