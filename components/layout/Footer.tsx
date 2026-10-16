import Container from '@/components/layout/Container';
import Logo from '@/components/layout/Logo';
import BrandName from '@/components/layout/BrandName';
import { SITE } from '@/data/site';

export default function Footer() {
  return (
    <footer className="border-t border-[#e9eaed] bg-white">
      <Container>
        <div className="flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between md:py-9">
          <div>
            <Logo />
            <p className="mt-3 text-xs text-[#72767f]">{SITE.tagline}</p>
          </div>
          <p className="text-[11px] text-[#858b95]">
            © {new Date().getFullYear()} <BrandName />
          </p>
        </div>
      </Container>
    </footer>
  );
}
