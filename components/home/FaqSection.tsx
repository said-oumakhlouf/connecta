'use client';

import { ChevronDown } from 'lucide-react';

import Container from '@/components/layout/Container';
import { useShop } from '@/components/shop/ShopProvider';
import { getOfferSavings } from '@/lib/product-page';
import { formatPrice } from '@/lib/shop-pricing';

/** Answers describe the current checkout only; no delivery delay, warranty or returns promise is made here. */
export default function FaqSection() {
  const { offers, product } = useShop();
  const savings = getOfferSavings(offers.solo.price, offers.duo.price, offers.duo.quantity);
  const duoAnswer =
    product && savings.amount > 0
      ? `Le pack comprend ${offers.duo.quantity} paires de Hoco EW75 pour ${formatPrice(Math.round(offers.duo.price * 100))}, soit ${formatPrice(savings.perUnit)} la paire et ${formatPrice(savings.amount)} de moins que deux paires achetées séparément. La remise s’applique automatiquement dans le panier pour chaque lot de deux paires.`
      : 'La remise Duo s’applique automatiquement dans le panier pour chaque lot de deux paires de Hoco EW75.';

  const faqs = [
    {
      question: 'Quels produits propose CONNECTA ?',
      answer:
        'Une sélection d’accessoires du quotidien : les écouteurs sans fil Hoco EW75, un câble de charge et un chargeur secteur 20 W. Tous les produits disponibles sont présentés dans la boutique.',
    },
    { question: 'Comment fonctionne l’offre Duo ?', answer: duoAnswer },
    {
      question: 'Combien coûte la livraison ?',
      answer:
        'Les frais dépendent du pays de livraison. Ils sont calculés et affichés dans le panier, avec le total à payer, avant toute validation du paiement.',
    },
    {
      question: 'Comment suivre ma commande ?',
      answer:
        'Rendez-vous dans votre espace client avec l’adresse email utilisée pour la commande : vous recevez un lien de connexion, sans mot de passe. Le statut et le numéro de suivi y apparaissent dès l’expédition.',
    },
    {
      question: 'Le paiement est-il réellement débité ?',
      answer:
        'Pas pour le moment. La boutique fonctionne en mode test : le paiement par carte passe par Stripe, mais aucun débit réel n’est effectué.',
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-16 md:py-24">
      <Container className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">Aide</p>
          <h2 id="faq-title" className="mt-2 text-[28px] font-semibold tracking-[-1.2px] text-ink md:text-[36px]">
            Questions fréquentes
          </h2>
        </div>

        <div>
          {faqs.map(({ question, answer }) => (
            <details key={question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium text-ink marker:hidden">
                <span>{question}</span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="m-0 pr-6 pb-5 text-sm leading-7 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
