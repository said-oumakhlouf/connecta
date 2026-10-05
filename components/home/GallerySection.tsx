import ProductVisual from '@/components/product/ProductVisual';

const GALLERY_ITEMS = [
  {
    number: '01',
    title: 'Tout tient dans un boîtier.',
    variant: 'case',
    background: 'bg-[#f2f3f5]',
    featured: true,
  },
  {
    number: '02',
    title: 'La liberté, en paire.',
    variant: 'buds',
    background: 'bg-[#edf2ff]',
    featured: false,
  },
  {
    number: '03',
    title: 'Encore mieux à deux.',
    variant: 'duo',
    background: 'bg-[#f2f3f5]',
    featured: false,
  },
] as const;

export default function GallerySection() {
  return (
    <section className="mx-auto w-full max-w-310 px-5.5 pb-13.75 md:px-12 md:pb-22.5 xl:max-w-335 2xl:max-w-375 2xl:px-16">
      {/* HEADING */}
      <div className="mb-6.25 block md:mb-8.75 md:flex md:items-end md:justify-between md:gap-6.25">
        <div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[#747983] md:text-[10px] md:tracking-[1.6px] 2xl:text-[11px]">
            SOUS TOUS LES ANGLES
          </span>

          <h2 className="mt-3.75 text-[30px] font-medium leading-[1.17] tracking-[-1.2px] md:text-[38px] md:tracking-[-1.7px] 2xl:text-[46px]">
            Simple. Jusque dans le détail.
          </h2>
        </div>

        <span className="mt-3.75 block text-[10px] text-[#72767f] md:mt-0 2xl:text-[11px]">
          Photos produit à venir
        </span>
      </div>

      {/* GALLERY */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4.5">
        {GALLERY_ITEMS.map((item) => (
          <article
            key={item.number}
            className={`
              relative overflow-hidden rounded-lg
              ${item.background}
              ${
                item.featured
                  ? 'col-span-2 h-71.25 md:col-span-1 md:h-81.25 2xl:h-95'
                  : 'h-61.25 md:h-81.25 2xl:h-95'
              }
            `}
          >
            <div
              className={
                item.featured
                  ? 'h-60 md:h-65 2xl:h-76.25'
                  : 'h-50 md:h-65 2xl:h-76.25'
              }
            >
              <ProductVisual variant={item.variant} compact />
            </div>

            <div className="absolute bottom-5 left-4 right-3 flex items-start gap-2 md:bottom-6 md:left-6.25 md:right-6.25 md:items-center md:gap-3.25">
              <span className="text-[9px] text-[#9b9ea6]">{item.number}</span>

              <h3 className="m-0 text-[11px] font-medium leading-normal md:text-xs 2xl:text-sm">
                {item.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
