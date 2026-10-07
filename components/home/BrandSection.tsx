import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import Container from "@/components/layout/Container";
import { SITE } from "@/data/site";

import styles from "./BrandSection.module.css";

const PRINCIPLES = [
  {
    number: "01",
    title: "Simple",
    text: "Des produits faciles à comprendre et à utiliser.",
  },
  {
    number: "02",
    title: "Utile",
    text: "Ce qui améliore vraiment le quotidien.",
  },
  {
    number: "03",
    title: "Accessible",
    text: "Un bon produit, au bon prix.",
  },
] as const;

export default function BrandSection() {
  return (
    <section
      id="brand"
      className="relative overflow-hidden bg-[#171a21] text-white"
    >
      <div className="pointer-events-none absolute -right-50 -top-50 size-150 rounded-full bg-[#235bfa18] blur-3xl" />

      <Container className="relative z-10 pt-14 pb-28 sm:pt-16 sm:pb-32 md:pt-20 md:pb-44 xl:pb-48">
        <div className="grid gap-10 md:grid-cols-[1fr_0.9fr] md:gap-16 xl:grid-cols-[1.05fr_0.85fr] xl:gap-24">
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

          <div className="flex flex-col justify-between md:-mt-2 md:w-full md:max-w-100 md:justify-self-center xl:-mt-3 xl:max-w-110">
            <div>
              <p className="max-w-120 text-[18px] font-medium leading-[1.4] tracking-[-0.35px] text-white sm:text-[20px] md:text-[20px] 2xl:text-[22px]">
                La tech devrait vous simplifier la vie.
                <br className="hidden sm:block" />
                Pas la compliquer.
              </p>

              <p className="mt-4 max-w-115 text-[12px] leading-[1.75] text-[#a1a7b1] sm:text-[13px] md:mt-5 md:text-[13px] md:leading-[1.8] 2xl:text-[14px]">
                Chez {SITE.name}, on choisit des produits pensés pour le
                quotidien : utiles, simples et accessibles. Parce que la
                technologie n’a pas besoin d’être compliquée pour être pratique.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-7 sm:grid-cols-3 md:mt-10 md:gap-4 md:pt-7">
              {PRINCIPLES.map(({ number, title, text }) => (
                <div key={number}>
                  <span className="text-[9px] font-bold tracking-[1.4px] text-[#778198] md:text-[9px] md:tracking-[1.4px]">
                    {number}
                  </span>

                  <strong className="mt-2 block text-[16px] font-semibold md:mt-2.5 md:text-[16px]">
                    {title}
                  </strong>

                  <p className="mt-2 max-w-55 text-[11px] leading-[1.65] text-[#9aa1ad] md:max-w-40 md:text-[12px] md:leading-[1.65]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold tracking-[1.3px] text-white md:mt-10 md:text-[10px] md:tracking-[1.3px]">
              KEEP IT CONNECTED.
              <ArrowUpRight size={15} className="text-[#7394ff]" />
            </div>
          </div>
        </div>
      </Container>

      <div aria-hidden="true" className={styles.brandWord}>
        <Image
          src="/connecta-logo-white.svg"
          alt=""
          width={704}
          height={72}
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
