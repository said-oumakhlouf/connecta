import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';

import Container from '@/components/layout/Container';
import { SITE } from '@/data/site';

import styles from './BrandSection.module.css';

const PRINCIPLES = [
  {
    number: '01',
    title: 'Simple',
    text: 'Des produits faciles à comprendre et à utiliser.',
  },
  {
    number: '02',
    title: 'Utile',
    text: 'Ce qui améliore vraiment le quotidien.',
  },
  {
    number: '03',
    title: 'Accessible',
    text: 'Un bon produit, au bon prix.',
  },
] as const;

export default function BrandSection() {
  return (
    <section
      id="brand"
      className="relative overflow-hidden bg-[#171a21] text-white"
    >
      <div className="pointer-events-none absolute -right-50 -top-50 size-150 rounded-full bg-[#235bfa18] blur-3xl" />

      <Container className="relative z-10 pt-14 pb-28 sm:pt-16 sm:pb-32 md:pt-22 md:pb-46 xl:pt-24 xl:pb-52 2xl:pt-28 2xl:pb-56">
        <div className="grid gap-10 md:grid-cols-[1fr_0.86fr] md:gap-14 xl:grid-cols-[1.05fr_0.82fr] xl:gap-20">
          <div>
            <div className="flex items-center gap-2.5 text-[9px] font-bold tracking-[1.5px] text-[#7394ff] md:gap-3 md:text-[10px] md:tracking-[1.7px]">
              <span className="h-px w-5 bg-[#235bfa] md:w-7" />
              L’ESPRIT {SITE.name}
            </div>

            <h2 className="mt-5 max-w-130 text-[34px] font-medium leading-[1.04] tracking-[-1.7px] sm:text-[38px] md:mt-6 md:text-[54px] md:tracking-[-3px] 2xl:text-[64px]">
              Bien connecté.
              <br />
              Bien dans votre vie.
            </h2>
          </div>

          <div className="flex flex-col justify-between md:mt-5 md:w-full md:max-w-115 md:justify-self-start xl:mt-7 xl:max-w-120">
            <div>
              <p className="max-w-110 text-[18px] font-medium leading-[1.4] tracking-[-0.35px] text-white sm:text-[20px] md:text-[20px] 2xl:text-[22px]">
                La tech devrait vous simplifier la vie.
                <br className="hidden sm:block" />
                Pas la compliquer.
              </p>

              <p className="mt-4 max-w-110 text-[12px] leading-[1.75] text-[#a1a7b1] sm:text-[13px] md:mt-5 md:text-[13px] md:leading-[1.8] 2xl:text-[14px]">
                Chez {SITE.name}, on choisit des produits pensés pour le
                quotidien : utiles, simples et accessibles. Parce que la
                technologie n’a pas besoin d’être compliquée pour être pratique.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-7 sm:grid-cols-3 md:mt-10 md:gap-6 md:pt-7">
              {PRINCIPLES.map(({ number, title, text }) => (
                <div key={number}>
                  <span className="text-[9px] font-bold tracking-[1.4px] text-[#778198]">
                    {number}
                  </span>

                  <strong className="mt-2 block text-[16px] font-semibold md:mt-2.5">
                    {title}
                  </strong>

                  <p className="mt-2 max-w-55 text-[11px] leading-[1.65] text-[#9aa1ad] md:max-w-40 md:text-[12px]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold tracking-[1.3px] text-white md:mt-10">
              KEEP IT CONNECTED.
              <ArrowUpRight size={15} className="text-[#7394ff]" />
            </div>
          </div>
        </div>
      </Container>

      <div aria-hidden="true" className={styles.brandWord}>
        {SITE.name.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            style={
              {
                '--letter-index': index,
              } as CSSProperties
            }
          >
            {letter}
          </span>
        ))}
      </div>
    </section>
  );
}
