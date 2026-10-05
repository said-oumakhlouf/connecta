import { OFFERS } from '@/data/offers';
import { PRODUCTS } from '@/data/products';
import { ChevronDown } from 'lucide-react';

const product = PRODUCTS.ew75;
const soloOffer = OFFERS.duo;
const duoOffer = OFFERS.duo;
const duoUnitPrice = duoOffer.price / duoOffer.quantity;
const duoSavings = soloOffer.price * duoOffer.quantity - duoOffer.price;

const FAQS = [
  {
    question: `Que contient une paire ${product.name} ?`,
    answer: `Deux écouteurs ${product.name} et leur boîtier de recharge. Le contenu exact et les accessoires seront confirmés avant l’ouverture des ventes.`,
  },
  {
    question: 'Puis-je les utiliser avec mon téléphone ?',
    answer:
      'Ils sont destinés aux appareils disposant du Bluetooth. La compatibilité précise sera confirmée dans la fiche produit définitive.',
  },
  {
    question: 'Comment fonctionne l’offre Duo ?',
    answer: `Le pack comprend ${duoOffer.quantity} paires pour ${duoOffer.price}€, soit ${duoUnitPrice} € la paire et ${duoSavings} € de moins que deux paires achetées séparément.`,
  },
  {
    question: 'Quelles sont les conditions de livraison et de retour ?',
    answer:
      'Les modalités de livraison, de retour et de garantie seront précisées avant le lancement des ventes.',
  },
] as const;

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto grid w-full max-w-310 grid-cols-1 gap-4 px-5.5 py-13.75 md:grid-cols-[1fr_1.35fr] md:gap-15 md:px-12 md:py-22.5 xl:max-w-335 2xl:max-w-375 2xl:px-16 2xl:py-25"
    >
      {/* INTRO */}
      <div>
        <span className="text-[10px] font-bold tracking-[1.6px] text-[#747983]">
          FAQ
        </span>

        <h2 className="mt-4 max-w-110 text-[38px] font-medium leading-[1.08] tracking-[-2px] md:text-[50px]">
          Une question ?
          <br />
          On vous répond.
        </h2>

        <p className="mt-6 max-w-95 text-[13px] leading-[1.8] text-[#72767f] md:text-[14px]">
          Retrouvez l’essentiel sur les {product.name}, l’offre Duo, la
          livraison et les retours.
        </p>
      </div>

      {/* FAQ */}
      <div id="questions">
        {FAQS.map(({ question, answer }) => (
          <details key={question} className="group border-b border-[#e9eaed]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5.25 text-[12px] leading-[1.6] marker:hidden 2xl:text-sm">
              <span>{question}</span>

              <ChevronDown
                size={18}
                className="shrink-0 text-[#858b96] transition-transform duration-200 group-open:rotate-180"
              />
            </summary>

            <p className="m-0 pr-6.25 pb-3.75 text-[12px] leading-[1.8] text-[#72767f] 2xl:text-sm">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
