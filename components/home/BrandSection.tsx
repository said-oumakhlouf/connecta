import { ArrowUpRight } from 'lucide-react';

import Container from '@/components/layout/Container';
import { SITE } from '@/data/site';
import type { CSSProperties } from 'react';

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
      {/* LUMIÈRE */}
      <div className="pointer-events-none absolute -right-50 -top-50 size-150 rounded-full bg-[#235bfa18] blur-3xl" />

      <Container className="relative z-10 py-18 md:py-25 2xl:py-30">
        <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-20 xl:gap-30">
          {/* GAUCHE */}
          <div>
            <div className="flex items-center gap-3 text-[9px] font-bold tracking-[1.7px] text-[#7394ff] md:text-[10px]">
              <span className="h-px w-7 bg-[#235bfa]" />
              L’ESPRIT {SITE.name}
            </div>

            <h2 className="mt-6 max-w-130 text-[40px] font-medium leading-[1.03] tracking-[-2px] md:text-[54px] md:tracking-[-3px] 2xl:text-[64px]">
              Bien connecté.
              <br />
              Bien dans votre vie.
            </h2>
          </div>

          {/* DROITE */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="max-w-140 text-[20px] font-medium leading-[1.45] tracking-[-0.5px] text-white md:text-[24px] 2xl:text-[27px]">
                La tech devrait vous simplifier la vie.
                <br />
                Pas la compliquer.
              </p>

              <p className="mt-6 max-w-135 text-[13px] leading-[1.9] text-[#969da8] md:text-[14px] 2xl:text-[15px]">
                Chez {SITE.name}, on choisit des produits pensés pour le
                quotidien : utiles, simples et accessibles. Parce que la
                technologie n’a pas besoin d’être compliquée pour être pratique.
              </p>
            </div>

            <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
              {PRINCIPLES.map(({ number, title, text }) => (
                <div key={number}>
                  <span className="text-[10px] font-bold tracking-[1.5px] text-[#6f7890]">
                    {number}
                  </span>

                  <strong className="mt-3 block text-[17px] font-semibold md:text-[18px]">
                    {title}
                  </strong>

                  <p className="mt-3 max-w-45 text-[12px] leading-[1.7] text-[#8f96a2] md:text-[13px]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-3 text-[11px] font-bold tracking-[1.4px] text-white">
              KEEP IT CONNECTED.
              <ArrowUpRight size={16} className="text-[#7394ff]" />
            </div>
          </div>
        </div>
      </Container>

      {/* MOT GÉANT EN FOND */}
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
