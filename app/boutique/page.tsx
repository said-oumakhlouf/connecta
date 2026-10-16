import type { Metadata } from 'next';

import CatalogView from '@/components/shop/CatalogView';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({
  path: '/boutique',
  title: 'Boutique : écouteurs sans fil, câbles et chargeurs',
  description:
    'Tous les accessoires CONNECTA : écouteurs sans fil Hoco EW75, câble de charge et chargeur secteur 20 W. Disponibilité en direct et frais de livraison affichés avant le paiement.',
});

export default function CatalogPage() {
  return <CatalogView />;
}
