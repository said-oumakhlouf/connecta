import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Container from '@/components/layout/Container';
import { buttonSize, primaryButton, secondaryButton } from '@/components/ui/button-styles';

/** Brand first screen: what CONNECTA sells, then a direct route to the catalogue. */
export default function Hero() {
  return (
    <section className="bg-panel">
      <Container className="pt-9 pb-8 md:pt-20 md:pb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-brand">
          Accessoires technologiques
        </p>

        <h1 className="mt-4 max-w-[15em] text-[34px] font-semibold leading-[1.06] tracking-[-1.6px] text-ink sm:text-[44px] md:text-[56px] md:tracking-[-2.6px] xl:text-[64px]">
          Écouteurs, câbles et chargeurs pour tous les jours.
        </h1>

        <p className="mt-5 max-w-150 text-[15px] leading-7 text-muted md:text-base md:leading-8">
          Une sélection courte d’accessoires utiles, à prix clairs. Les frais de livraison sont
          affichés avant le paiement.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/boutique" className={`${primaryButton} ${buttonSize.lg}`}>
            Voir la boutique <ArrowRight size={16} aria-hidden />
          </Link>
          <Link href="/produit/hoco-ew75" className={`${secondaryButton} ${buttonSize.lg}`}>
            Découvrir les Hoco EW75
          </Link>
        </div>
      </Container>
    </section>
  );
}
