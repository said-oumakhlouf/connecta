'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import CartDialog from '@/components/shop/CartDialog';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileOrder from '@/components/shop/MobileOrder';
import ShopProvider from '@/components/shop/ShopProvider';

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (
    pathname === '/admin' ||
    pathname?.startsWith('/admin/') ||
    pathname === '/paiement'
  )
    return <>{children}</>;
  return (
    <ShopProvider>
      <Header />
      {children}
      <Footer />
      <MobileOrder />
      <CartDialog />
    </ShopProvider>
  );
}
