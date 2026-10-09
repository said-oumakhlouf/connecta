'use client';

import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState } from 'react';

import Container from '@/components/layout/Container';
import Logo from '@/components/layout/Logo';
import BrandName from '@/components/layout/BrandName';
import { useShop } from '@/components/shop/ShopProvider';

const NAVIGATION = [
  {
    label: 'Le produit',
    href: '/#produit',
  },
  {
    label: <>Pourquoi <BrandName /> ?</>,
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
      <Container className="flex h-15 items-center sm:h-17 md:h-18 lg:h-21.5">
        <Logo />

        <nav
          className="mx-auto hidden items-center gap-9 text-xs text-[#656a72] lg:flex"
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

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3 lg:ml-0 lg:gap-5">
          <a href="/compte" aria-label="Mon compte et mes commandes" className="grid size-9 place-items-center rounded-full transition hover:bg-[#f5f6f8]">
            <UserRound size={19} strokeWidth={1.7} />
          </a>
          <button
            type="button"
            onClick={openCart}
            className="relative grid size-9 place-items-center rounded-full bg-transparent transition hover:bg-[#f5f6f8]"
            aria-label={`Ouvrir le panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}
          >
            <ShoppingBag size={19} strokeWidth={1.7} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#235bfa] px-1 text-[8px] font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-9 place-items-center rounded-full bg-transparent transition hover:bg-[#f5f6f8] lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="flex flex-col border-t border-[#e9eaed] bg-white px-4 pb-3 sm:px-5.5 lg:hidden"
          aria-label="Navigation mobile"
        >
          {NAVIGATION.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#f0f1f3] py-4 text-[13px] text-[#565c65] last:border-b-0"
            >
              {label === 'Questions fréquentes' ? 'FAQ' : label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
