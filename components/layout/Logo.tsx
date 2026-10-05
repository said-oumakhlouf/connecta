import LogoMark from '@/components/layout/LogoMark';
import { SITE } from '@/data/site';

type LogoProps = {
  href?: string;
};

export default function Logo({ href = '/' }: LogoProps) {
  return (
    <a
      href={href}
      aria-label={`${SITE.name}, accueil`}
      className="inline-flex items-center gap-1 text-[22px] font-black tracking-[-1.2px] md:text-[25px]"
    >
      {SITE.name}

      <LogoMark />
    </a>
  );
}
