'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import {
  PRODUCT_GALLERY,
  galleryImageSrc,
  galleryImageSrcSet,
} from '@/data/product-gallery';

const SIZES = '(min-width: 1024px) 56vw, 100vw';

export default function ProductGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [active, setActive] = useState(0);
  const count = PRODUCT_GALLERY.length;

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (index + count) % count;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: next * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      setActive(next);
    },
    [count],
  );

  function handleScroll() {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      setActive(Math.min(count - 1, Math.round(track.scrollLeft / track.clientWidth)));
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') goTo(active + 1);
    else if (event.key === 'ArrowLeft') goTo(active - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      <div className="group relative overflow-hidden rounded-[26px] bg-[#f5f6f8] shadow-[0_30px_80px_#20293810]">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carrousel"
          aria-label="Photos du Hoco EW75 (flèches gauche et droite pour naviguer)"
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-[#235bfa] focus-visible:ring-inset [&::-webkit-scrollbar]:hidden"
        >
          {PRODUCT_GALLERY.map((image, index) => (
            <figure
              key={image.id}
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${count} : ${image.caption}`}
              aria-hidden={index !== active}
              className="relative m-0 h-full w-full shrink-0 snap-center snap-always"
            >
              {/* Static export: images are pre-optimised WebP variants, so a native srcset is used. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImageSrc(image)}
                srcSet={galleryImageSrcSet(image)}
                sizes={SIZES}
                width={image.width}
                height={image.height}
                alt={image.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                draggable={false}
                style={image.position ? { objectPosition: image.position } : undefined}
                className={`h-full w-full select-none ${image.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
            </figure>
          ))}
        </div>

        <span
          aria-live="polite"
          className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold tracking-[0.6px] text-[#17191d] backdrop-blur-md"
        >
          {active + 1} / {count} · {PRODUCT_GALLERY[active].caption}
        </span>

        {[
          { label: 'Image précédente', delta: -1, Icon: ChevronLeft, side: 'left-4' },
          { label: 'Image suivante', delta: 1, Icon: ChevronRight, side: 'right-4' },
        ].map(({ label, delta, Icon, side }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => goTo(active + delta)}
            className={`absolute top-1/2 ${side} hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#17191d] shadow-[0_10px_30px_#20293818] backdrop-blur-md transition hover:bg-white hover:text-[#235bfa] focus-visible:outline-2 focus-visible:outline-[#235bfa] md:flex md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100`}
          >
            <Icon size={20} aria-hidden />
          </button>
        ))}

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
          {PRODUCT_GALLERY.map((image, index) => (
            <span
              key={image.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === active ? 'w-5 bg-[#17191d]' : 'w-1.5 bg-[#17191d]/25'}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-5 gap-3 sm:grid">
        {PRODUCT_GALLERY.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Afficher : ${image.caption}`}
            aria-current={index === active}
            className={`relative aspect-square overflow-hidden rounded-2xl bg-[#f5f6f8] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235bfa] ${index === active ? 'ring-2 ring-[#235bfa] ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImageSrc(image)}
              alt=""
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              style={image.position ? { objectPosition: image.position } : undefined}
              className={`h-full w-full ${image.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
