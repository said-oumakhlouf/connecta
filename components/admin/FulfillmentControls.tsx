import { useState, type FormEvent } from 'react';
import type { AdminOrder } from '@/lib/admin-api';
import type { FulfillmentUpdate } from '@/lib/shipping';

const button = 'rounded-xl bg-[#235bfa] px-4 py-3 text-sm font-medium text-white disabled:opacity-40';
export default function FulfillmentControls({ order, disabled, onUpdate }: {
  order: AdminOrder; disabled: boolean; onUpdate: (id: string, update: FulfillmentUpdate) => Promise<boolean>;
}) {
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [confirmDelivered, setConfirmDelivered] = useState(false);
  if (order.paymentStatus !== 'PAID' || !order.shippingAddress) return null;
  const status = order.fulfillmentStatus ?? 'UNFULFILLED';
  const ship = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onUpdate(order.id, { status: 'SHIPPED', trackingCarrier: carrier.trim(), trackingNumber: tracking.trim() });
  };
  return <div className="mt-4 border-t border-[#e9eaed] pt-4">
    {status === 'UNFULFILLED' && <button type="button" disabled={disabled} className={button}
      onClick={() => void onUpdate(order.id, { status: 'PREPARING' })}>Mettre en préparation</button>}
    {status === 'PREPARING' && <form onSubmit={ship} className="space-y-3">
      <label className="block text-sm" htmlFor={`carrier-${order.id}`}>Transporteur
        <input id={`carrier-${order.id}`} required minLength={2} maxLength={60} disabled={disabled} value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="Ex. Colissimo"
          className="mt-1 block w-full rounded-xl border border-[#e0e3e8] px-3 py-2" />
      </label>
      <label className="block text-sm" htmlFor={`tracking-${order.id}`}>Numéro de suivi
        <input id={`tracking-${order.id}`} required minLength={3} maxLength={80} pattern="[a-zA-Z0-9][a-zA-Z0-9 \-]{2,79}" disabled={disabled} value={tracking} onChange={e => setTracking(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-[#e0e3e8] px-3 py-2" />
      </label>
      <p className="text-xs text-[#72767f]">Vérifiez le suivi et confirmez après avoir remis le colis au transporteur. Ces informations seront visibles par le client.</p>
      <button type="submit" disabled={disabled} className={button}>Confirmer l’expédition</button>
    </form>}
    {status === 'SHIPPED' && (confirmDelivered ? <div className="space-y-3">
      <p className="text-sm">Le transporteur ou le client a-t-il confirmé la réception du colis ?</p>
      <button type="button" disabled={disabled} className={button} onClick={() => void onUpdate(order.id, { status: 'DELIVERED' })}>Oui, confirmer la livraison</button>
      <button type="button" disabled={disabled} className="ml-3 text-sm underline" onClick={() => setConfirmDelivered(false)}>Retour</button>
    </div> : <button type="button" disabled={disabled} className={button} onClick={() => setConfirmDelivered(true)}>Marquer comme livrée</button>)}
  </div>;
}
