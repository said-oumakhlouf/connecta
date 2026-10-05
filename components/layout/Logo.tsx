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
      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[20px] font-black tracking-[-1px] text-[#17191d] sm:text-[22px] sm:tracking-[-1.1px] md:gap-1 md:text-[25px] md:tracking-[-1.2px]"
    >
      {SITE.name}

      <LogoMark />
    </a>
  );
}
