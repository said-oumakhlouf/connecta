import { ArrowUpRight } from 'lucide-react';

import Container from '@/components/layout/Container';
import Logo from '@/components/layout/Logo';
import BrandName from '@/components/layout/BrandName';
import { PRODUCTS } from '@/data/products';
import { SITE } from '@/data/site';

const product = PRODUCTS.ew75;

export default function Footer() {
  return (
    <footer className="border-t border-[#e9eaed] bg-[#fafbfc]">
      <Container>
        <div className="flex items-start justify-between gap-7.5 py-7.5 md:items-center md:py-10">
          <div>
            <Logo />

            <p className="mt-2 text-[11px] text-[#72767f] 2xl:text-xs">
              {SITE.tagline}
            </p>
          </div>

          <a
            href="/#produit"
            className="font-heading inline-flex items-center gap-2 text-[10px] font-semibold text-[#17191d] transition hover:opacity-60 md:text-xs"
          >
            Découvrir les {product.name}
            <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="flex flex-wrap justify-between gap-3.75 border-t border-[#e9eaed] py-5.75 pb-25 text-[8px] text-[#9196a0] md:flex-nowrap md:pb-5.75 md:text-[9px] 2xl:text-[10px]">
          <span>
            © {new Date().getFullYear()} <BrandName />
          </span>
          <a href="/admin" className="transition hover:text-[#17191d]">
            Administration
          </a>
        </div>
      </Container>
    </footer>
  );
}
