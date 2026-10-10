import { countryLabels, fulfillmentLabels, type ShippingOrder } from '@/lib/shipping';
import { formatPrice } from '@/lib/shop-pricing';

export default function DeliveryDetails({ order }: {
  order: ShippingOrder & { id: string; customerName: string; total: number; paymentStatus?: string };
}) {
  const address = order.shippingAddress;
  return <div className="mt-4 space-y-3 border-t border-[#e9eaed] pt-4 text-sm">
    <div className="flex justify-between gap-3"><span>Articles</span><strong>{formatPrice(order.total - (order.shippingFee ?? 0))}</strong></div>
    <div className="flex justify-between gap-3"><span>Livraison</span><strong>{formatPrice(order.shippingFee ?? 0)}</strong></div>
    <div className="flex justify-between gap-3"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
    {address ? <div className="rounded-xl bg-[#f7f8fa] p-4">
      <p className="font-semibold">Adresse de livraison</p>
      <address className="mt-2 break-words not-italic leading-6">
        {order.customerName}<br />{address.line1}<br />
        {address.line2 && <>{address.line2}<br /></>}
        {address.postalCode} {address.city}{address.region ? ` · ${address.region}` : ''}<br />
        {countryLabels[address.country]}
      </address>
    </div> : <p className="text-xs text-[#72767f]">Adresse non enregistrée pour cette ancienne commande.</p>}
    {order.paymentStatus === 'PAID' && address && <div className="rounded-xl border border-[#dce5ff] p-4">
      <p className="font-semibold text-[#235bfa]">{fulfillmentLabels[order.fulfillmentStatus ?? 'UNFULFILLED']}</p>
      {order.trackingCarrier && order.trackingNumber && <p className="mt-2 break-words">{order.trackingCarrier} · Suivi n° <strong>{order.trackingNumber}</strong></p>}
      {order.shippedAt && <p className="mt-2 text-xs text-[#72767f]">Expédiée le {new Date(order.shippedAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}</p>}
      {order.deliveredAt && <p className="mt-2 text-xs text-[#72767f]">Livrée le {new Date(order.deliveredAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}</p>}
    </div>}
  </div>;
}
