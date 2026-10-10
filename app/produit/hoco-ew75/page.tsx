import type { Metadata } from 'next';

import ProductPage from '@/components/product/ProductPage';
import { PRODUCT_GALLERY, galleryImageSrc } from '@/data/product-gallery';
import { PRODUCTS } from '@/data/products';
import { SITE } from '@/data/site';
import { getProductJsonLd, serializeJsonLd } from '@/lib/product-page';

const product = PRODUCTS.ew75;
/** Optional public origin (e.g. https://connecta.fr) used for absolute URLs; never a secret. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined;
const images = PRODUCT_GALLERY.map((image) => galleryImageSrc(image, 1600));
const title = `${product.name} — Écouteurs sans fil Bluetooth ${product.bluetoothVersion}`;
const description = `${product.name} : écouteurs sans fil ${product.color.toLowerCase()}s, Bluetooth ${product.bluetoothVersion}, jusqu’à ${product.musicTime} d’écoute et ${product.range} de portée. Offres Solo et Duo sur ${SITE.name}.`;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: `${title} | ${SITE.name}`,
  description,
  ...(siteUrl ? { alternates: { canonical: '/produit/hoco-ew75' } } : {}),
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'fr_FR',
    title,
    description,
    ...(siteUrl ? { url: '/produit/hoco-ew75', images: [{ url: images[0], width: 1448, height: 1086, alt: PRODUCT_GALLERY[0].alt }] } : {}),
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function HocoEW75Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(getProductJsonLd(images, siteUrl)) }}
      />
      <ProductPage />
    </>
  );
}
