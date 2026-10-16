import type { Metadata } from 'next';

import Announcement from '@/components/home/Announcement';
import FaqSection from '@/components/home/FaqSection';
import Hero from '@/components/home/Hero';
import LifestyleSection from '@/components/home/LifestyleSection';
import OffersSection from '@/components/home/OffersSection';
import ProductShowcase from '@/components/home/ProductShowcase';
import TrustSection from '@/components/home/TrustSection';
import { SITE } from '@/data/site';
import { serializeJsonLd } from '@/lib/product-page';
import { getSiteJsonLd, publicPageMetadata } from '@/lib/seo';

const homeTitle = `${SITE.name} — Écouteurs, câbles et chargeurs pour tous les jours`;
const homeMetadata = publicPageMetadata({
  path: '/',
  title: homeTitle,
  description:
    'Accessoires technologiques du quotidien : écouteurs sans fil Hoco EW75 avec offre Duo, câble de charge et chargeur 20 W. Frais de livraison affichés avant le paiement.',
});

export const metadata: Metadata = { ...homeMetadata, title: { absolute: homeTitle } };

const siteJsonLd = getSiteJsonLd();

export default function Home() {
  return (
    <>
      {siteJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd) }} />
      )}
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
