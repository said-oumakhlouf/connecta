'use client';

import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

import { useShop } from '@/components/shop/ShopProvider';
import Container from '@/components/layout/Container';
import Logo from '@/components/layout/Logo';
import { SITE } from '@/data/site';

const NAVIGATION = [
  {
    label: 'Le produit',
    href: '/#produit',
  },
  {
    label: `Pourquoi ${SITE.name} ?`,
    href: '/#brand',
  },
  {
    label: 'Questions fréquentes',
    href: '/#faq',
  },
] as const;

export default function Header() {
  const { cartCount, openCart } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9eaed] bg-white/95 backdrop-blur-xl">
      <Container className="flex h-17 items-center md:h-21.5">
        <Logo />

        <nav
          className="mx-auto hidden items-center gap-9 text-xs text-[#656a72] md:flex"
          aria-label="Navigation principale"
        >
          {NAVIGATION.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="transition-colors hover:text-[#17191d]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 border-0 bg-transparent"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag size={20} strokeWidth={1.7} />

            <span className="grid size-5 place-items-center rounded-full bg-[#f1f3f6] text-[10px]">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid place-items-center border-0 bg-transparent md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="flex flex-col border-t border-[#e9eaed] bg-white px-5.5 pb-4 md:hidden"
          aria-label="Navigation mobile"
        >
          {NAVIGATION.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#f0f1f3] py-4 text-xs text-[#656a72] last:border-b-0"
            >
              {label === 'Questions fréquentes' ? 'FAQ' : label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
