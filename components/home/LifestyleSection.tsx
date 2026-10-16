import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Container from '@/components/layout/Container';

/** Mood photos for the lead product. Pre-optimised WebP variants: the static export serves images as-is. */
const MOMENTS = [
  {
    title: 'Au bureau',
    text: 'Un format discret pour les appels et la concentration.',
    image: '/images/hoco_work-1600.webp',
    width: 1600,
    height: 1067,
    imageClassName: 'object-[68%_center] md:object-center',
    featured: true,
  },
  {
    title: 'Au quotidien',
    text: 'Le boîtier se glisse dans une poche ou un sac.',
    image: '/images/hoco_style-800.webp',
    width: 800,
    height: 534,
    imageClassName: 'object-[52%_center] md:object-center',
    featured: false,
  },
  {
    title: 'En mouvement',
    text: 'Sans fil, pour la marche ou la séance de sport.',
    image: '/images/hoco_sport-800.webp',
    width: 800,
    height: 1200,
    imageClassName: 'object-[55%_22%]',
    featured: false,
  },
] as const;

export default function LifestyleSection() {
  return (
    <section aria-labelledby="usages-title" className="bg-white pb-16 md:pb-24">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-10 md:mb-8 md:pt-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">Hoco EW75 au quotidien</p>
            <h2 id="usages-title" className="mt-2 text-[28px] font-semibold tracking-[-1.2px] text-ink md:text-[36px]">
              Du bureau à la séance de sport.
            </h2>
          </div>
          <Link
            href="/produit/hoco-ew75"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Voir la fiche produit <ArrowRight size={15} aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.35fr_0.85fr] md:grid-rows-[repeat(2,280px)] 2xl:grid-rows-[repeat(2,330px)]">
          {MOMENTS.map((moment) => (
            <figure
              key={moment.title}
              className={`relative m-0 overflow-hidden rounded-3xl bg-[#111] ${
                moment.featured ? 'h-80 sm:h-96 md:row-span-2 md:h-auto' : 'h-60 sm:h-68 md:h-auto'
              }`}
            >
              <Image
                src={moment.image}
                alt=""
                width={moment.width}
                height={moment.height}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover ${moment.imageClassName}`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,#000000b3_100%)]" />
              <figcaption className="absolute inset-x-5 bottom-5 text-white md:inset-x-7 md:bottom-7">
                <strong className="block text-xl font-semibold tracking-[-0.6px] md:text-2xl">{moment.title}</strong>
                <span className="mt-1 block max-w-85 text-[13px] leading-5 text-white/85">{moment.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Photos d’ambiance, non contractuelles.</p>
      </Container>
    </section>
  );
}
