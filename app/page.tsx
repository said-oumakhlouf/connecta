import type { Metadata } from 'next';

import Announcement from '@/components/home/Announcement';
import FaqSection from '@/components/home/FaqSection';
import Hero from '@/components/home/Hero';
import LifestyleSection from '@/components/home/LifestyleSection';
import OffersSection from '@/components/home/OffersSection';
import ProductShowcase from '@/components/home/ProductShowcase';
import TrustSection from '@/components/home/TrustSection';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: `${SITE.name} — Écouteurs, câbles et chargeurs`,
  description:
    'Accessoires technologiques du quotidien : écouteurs sans fil Hoco EW75, câble de charge et chargeur 20 W. Frais de livraison affichés avant le paiement.',
};

export default function Home() {
  return (
    <>
      <Announcement />

      <main>
        <Hero />
        <ProductShowcase />
        <OffersSection />
        <LifestyleSection />
        <TrustSection />
        <FaqSection />
      </main>
    </>
  );
}
