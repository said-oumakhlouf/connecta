import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope } from 'next/font/google';

import SiteShell from '@/components/layout/SiteShell';
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
