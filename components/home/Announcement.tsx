import { ArrowRight } from 'lucide-react';
import { OFFERS} from '@/data/offers';

export default function Announcement() {
  const duoOffer = OFFERS.duo;

  return (
    <div className="bg-[#17191d] px-3 py-2.75 text-center text-[11px] tracking-[0.3px] text-[#cdd0d8]">
      À deux, c’est encore mieux.
      <a
        href="#offres"
        className="ml-2 inline-flex items-center gap-2 font-semibold text-white"
      >
        {duoOffer.quantity} paires pour {duoOffer.price} €
        <ArrowRight size={13} />
      </a>
    </div>
  );
}
