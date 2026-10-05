import Container from '@/components/layout/Container';

const BENEFITS = [
  {
    number: '01',
    title: 'Votre moment à vous.',
    text: 'Un podcast le matin. Votre playlist préférée le soir. Emportez votre univers sonore avec vous.',
  },
  {
    number: '02',
    title: 'Connectés à votre quotidien.',
    text: 'Une connexion simple à votre téléphone pour écouter librement, où que vous soyez.',
  },
  {
    number: '03',
    title: 'Toujours dans la poche.',
    text: 'Un format compact qui vous accompagne sans prendre de place.',
  },
] as const;

export default function BenefitsSection() {
  return (
    <section className="bg-white py-20 md:py-28 2xl:py-36">
      <Container>
        <div className="grid gap-14 md:grid-cols-[0.8fr_1.2fr] md:gap-24 xl:gap-32">
          {/* INTRO */}
          <div>
            <span className="text-[9px] font-bold tracking-[1.7px] text-[#747983] md:text-[10px]">
              MOINS DE FILS. PLUS DE LIBERTÉ.
            </span>

            <h2 className="mt-5 max-w-130 text-[42px] font-medium leading-[1.02] tracking-[-2.4px] md:text-[56px] md:tracking-[-3.2px] 2xl:text-[66px]">
              Petits écouteurs.
              <br />
              Grandes habitudes.
            </h2>

            <p className="mt-7 max-w-85 text-[11px] leading-[1.9] text-[#7a7f88] md:text-[13px]">
              Pensés pour se faire oublier.
              <br />
              Et rester avec vous toute la journée.
            </p>
          </div>

          {/* BENEFITS */}
          <div className="border-t border-[#dfe2e7]">
            {BENEFITS.map(({ number, title, text }) => (
              <article
                key={number}
                className="group grid gap-5 border-b border-[#dfe2e7] py-7 transition md:grid-cols-[70px_1fr] md:gap-7 md:py-9"
              >
                <span className="text-[9px] font-bold tracking-[1.4px] text-[#a0a5ad] transition-colors group-hover:text-[#235bfa]">
                  {number}
                </span>

                <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr] md:gap-10">
                  <h3 className="text-[18px] font-medium tracking-[-0.6px] transition-colors group-hover:text-[#235bfa] md:text-[21px]">
                    {title}
                  </h3>

                  <p className="max-w-100 text-[11px] leading-[1.8] text-[#747982] md:text-[12px]">
                    {text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
