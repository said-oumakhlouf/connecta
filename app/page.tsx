import Announcement from '@/components/home/Announcement';
import BenefitsSection from '@/components/home/BenefitsSection';
import BrandSection from '@/components/home/BrandSection';
import FaqSection from '@/components/home/FaqSection';
import GallerySection from '@/components/home/GallerySection';
import Hero from '@/components/home/Hero';
import LifestyleSection from '@/components/home/LifestyleSection';
import OffersSection from '@/components/home/OffersSection';

export default function Home() {
  return (
    <>
      <Announcement />

      <main>
        <Hero />
        <BenefitsSection />
        <LifestyleSection />
        <GallerySection />
        <BrandSection />
        <OffersSection />
        <FaqSection />
      </main>
    </>
  );
}
