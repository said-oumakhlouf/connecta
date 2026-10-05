'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const MOMENTS = [
  {
    time: '10:15',
    title: 'Quand il faut se concentrer.',
    text: 'Un format discret qui reste avec vous au bureau.',
    image: '/images/hoco_work.jpg',
    featured: true,
    mobilePosition: 'object-[68%_center]',
    desktopPosition: 'md:object-center',
    delay: '0.05s',
  },
  {
    time: 'Toute la journée',
    title: 'Toujours à portée de main.',
    text: 'Sur votre bureau, dans votre poche, toujours prêts.',
    image: '/images/hoco_style.jpg',
    featured: false,
    mobilePosition: 'object-center',
    desktopPosition: 'md:object-center',
    delay: '0.22s',
  },
  {
    time: '18:30',
    title: 'Pendant la séance.',
    text: 'Vos morceaux préférés vous accompagnent jusqu’au dernier effort.',
    image: '/images/hoco_sport.jpg',
    featured: false,
    mobilePosition: 'object-[55%_center]',
    desktopPosition: 'md:object-center',
    delay: '0.39s',
  },
] as const;

export default function LifestyleSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="pb-16 pt-2 md:pb-25 md:pt-7.5">
      <div className="mx-auto w-full max-w-310 px-5.5 md:px-12 xl:max-w-335 2xl:max-w-375 2xl:px-16">
        {/* HEADING */}
        <div className="mb-7 md:mb-8.75 md:flex md:items-end md:justify-between md:gap-6.25">
          <div>
            <span className="text-[9px] font-bold tracking-[1.2px] text-[#747983] md:text-[10px] md:tracking-[1.6px] 2xl:text-[11px]">
              DANS VOTRE QUOTIDIEN
            </span>

            <h2 className="mt-3.5 text-[32px] font-medium leading-[1.08] tracking-[-1.4px] md:text-[38px] md:tracking-[-1.7px] 2xl:text-[46px]">
              Du matin au soir.
              <br />
              Toujours avec vous.
            </h2>
          </div>

          <p className="mt-4 text-[12px] leading-[1.75] text-[#72767f] md:mb-0.75 md:mt-0 md:text-xs 2xl:text-sm">
            Les écouteurs qu&apos;on oublie.
            <br />
            Jusqu&apos;au moment où on en a besoin.
          </p>
        </div>

        {/* IMAGES */}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.35fr_0.85fr] md:grid-rows-[repeat(2,300px)] md:gap-4.5 2xl:grid-rows-[repeat(2,350px)]">
          {MOMENTS.map((moment) => (
            <article
              key={moment.time}
              style={{
                transitionDelay: isVisible ? moment.delay : '0s',
              }}
              className={`
                group relative overflow-hidden rounded-[18px] bg-[#111]
                transition-[opacity,transform] duration-750
                ease-[cubic-bezier(0.22,1,0.36,1)]
                motion-reduce:translate-y-0
                motion-reduce:opacity-100
                motion-reduce:transition-none

                ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-7.5 opacity-0'
                }

                ${
                  moment.featured
                    ? 'h-100 sm:h-110 md:row-span-2 md:h-auto'
                    : 'h-66 sm:h-72 md:h-auto'
                }
              `}
            >
              <Image
                src={moment.image}
                alt={moment.title}
                fill
                sizes={
                  moment.featured
                    ? '(max-width: 767px) 100vw, 65vw'
                    : '(max-width: 767px) 100vw, 35vw'
                }
                className={`object-cover ${moment.mobilePosition} ${moment.desktopPosition} transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none`}
              />

              <div className="absolute inset-0 z-1 bg-[linear-gradient(180deg,#00000008_15%,#00000008_42%,#000000c2_100%)]" />

              <div className="absolute left-5 top-5 z-2 rounded-full border border-white/20 bg-black/15 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.8px] text-white backdrop-blur-xl md:left-7.5 md:top-7 2xl:left-9.5 2xl:top-9">
                {moment.time}
              </div>

              <div className="absolute bottom-5 left-5 right-5 z-2 text-white md:bottom-7.5 md:left-7.5 md:right-7.5 2xl:bottom-9.5 2xl:left-9.5 2xl:right-9.5">
                <h3
                  className={
                    moment.featured
                      ? 'mb-2 max-w-125 text-[25px] font-medium leading-[1.05] tracking-[-1px] md:text-[38px] md:tracking-[-1.8px] 2xl:text-[46px]'
                      : 'mb-2 text-[22px] font-medium leading-[1.08] tracking-[-0.8px] md:text-[25px] 2xl:text-[30px]'
                  }
                >
                  {moment.title}
                </h3>

                <p className="m-0 max-w-85 text-[11px] leading-[1.65] text-white/80 md:text-xs 2xl:text-sm">
                  {moment.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
