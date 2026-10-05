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

      <Container className="relative z-10 py-14 pb-24 md:py-25 2xl:py-30">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-20 xl:gap-30">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-bold tracking-[1.6px] text-[#7394ff] md:text-[10px] md:tracking-[1.7px]">
              <span className="h-px w-7 bg-[#235bfa]" />
              L’ESPRIT {SITE.name}
            </div>

            <h2 className="mt-5 max-w-130 text-[36px] font-medium leading-[1.04] tracking-[-1.8px] sm:text-[40px] md:mt-6 md:text-[54px] md:tracking-[-3px] 2xl:text-[64px]">
              Bien connecté.
              <br />
              Bien dans votre vie.
            </h2>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="max-w-140 text-[18px] font-medium leading-[1.45] tracking-[-0.4px] text-white md:text-[24px] md:tracking-[-0.5px] 2xl:text-[27px]">
                La tech devrait vous simplifier la vie.
                <br />
                Pas la compliquer.
              </p>

              <p className="mt-5 max-w-135 text-[12px] leading-[1.8] text-[#969da8] md:mt-6 md:text-[14px] md:leading-[1.9] 2xl:text-[15px]">
                Chez {SITE.name}, on choisit des produits pensés pour le
                quotidien : utiles, simples et accessibles. Parce que la
                technologie n’a pas besoin d’être compliquée pour être pratique.
              </p>
            </div>

            <div className="mt-9 grid gap-0 border-t border-white/10 md:mt-12 md:grid-cols-3 md:gap-8 md:pt-8">
              {PRINCIPLES.map(({ number, title, text }) => (
                <div
                  key={number}
                  className="border-b border-white/10 py-5 last:border-b-0 md:border-b-0 md:py-0"
                >
                  <span className="text-[10px] font-bold tracking-[1.5px] text-[#6f7890]">
                    {number}
                  </span>

                  <strong className="mt-2 block text-[18px] font-semibold md:mt-3">
                    {title}
                  </strong>

                  <p className="mt-2 max-w-70 text-[13px] leading-[1.65] text-[#9aa1ad] md:mt-3 md:max-w-45">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[11px] font-bold tracking-[1.4px] text-white md:mt-12">
              KEEP IT CONNECTED.
              <ArrowUpRight size={16} className="text-[#7394ff]" />
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
