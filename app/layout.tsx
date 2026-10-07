import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Montserrat } from 'next/font/google';

import SiteShell from '@/components/layout/SiteShell';
import { SITE } from '@/data/site';

import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="fr" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
