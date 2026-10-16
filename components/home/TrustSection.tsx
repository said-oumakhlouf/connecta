import { CreditCard, PackageSearch, Truck, type LucideIcon } from 'lucide-react';

import Container from '@/components/layout/Container';

/** Factual buying information only: every line describes behaviour that exists in the checkout today. */
const POINTS: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: CreditCard,
    title: 'Paiement par carte sécurisé',
    text: 'Le règlement s’effectue sur une page de paiement Stripe. La boutique est actuellement en mode test : aucun débit réel n’est effectué.',
  },
  {
    Icon: Truck,
    title: 'Frais de livraison affichés avant de payer',
    text: 'Le montant dépend du pays de livraison et apparaît dans le panier avec le total, avant le paiement.',
  },
  {
    Icon: PackageSearch,
    title: 'Suivi de commande en ligne',
    text: 'Depuis votre espace client, retrouvez vos commandes, leur statut et le numéro de suivi dès l’expédition.',
  },
];

export default function TrustSection() {
  return (
    <section id="achat" aria-labelledby="achat-title" className="bg-panel py-16 md:py-24">
      <Container>
        <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">Acheter chez CONNECTA</p>
        <h2 id="achat-title" className="mt-2 max-w-160 text-[28px] font-semibold leading-[1.1] tracking-[-1.2px] text-ink md:text-[36px]">
          Une commande simple, sans surprise au moment de payer.
        </h2>

        <ul className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
          {POINTS.map(({ Icon, title, text }) => (
            <li key={title} className="rounded-3xl border border-line bg-white p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon size={18} aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-[-0.3px] text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
