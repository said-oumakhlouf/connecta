import Image from 'next/image';
import { SITE } from '@/data/site';

type LogoProps = {
  href?: string;
};

export default function Logo({ href = '/' }: LogoProps) {
  return (
    <a
      href={href}
      aria-label={`${SITE.name}, accueil`}
      className="inline-flex shrink-0 items-center text-[#17191d] transition-opacity hover:opacity-70"
    >
      <Image
        src="/connecta-logo.svg"
        alt=""
        aria-hidden="true"
        width={704}
        height={72}
        className="h-auto w-[158px] sm:w-[180px] md:w-[205px]"
        priority
      />
    </a>
  );
}
