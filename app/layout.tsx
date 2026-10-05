import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope } from 'next/font/google';

import CartDialog from '@/components/shop/CartDialog';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileOrder from '@/components/shop/MobileOrder';
import ShopProvider from '@/components/shop/ShopProvider';
import { SITE } from '@/data/site';

import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body>
        <ShopProvider>
          <Header />

          {children}

          <Footer />

          <MobileOrder />
          <CartDialog />
        </ShopProvider>
      </body>
    </html>
  );
}
