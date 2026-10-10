export type ShippingCountry = 'FR' | 'BE' | 'CA';
export type ShippingAddress = {
  country: ShippingCountry;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  region: string;
};
export type ShippingOptions = {
  currency: 'eur';
  provisional: boolean;
  destinations: Array<{ country: ShippingCountry; label: string; fee: number }>;
};
export type FulfillmentStatus = 'UNFULFILLED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
export type FulfillmentUpdate = {
  status: Exclude<FulfillmentStatus, 'UNFULFILLED'>;
  trackingCarrier?: string;
  trackingNumber?: string;
};
export type ShippingOrder = {
  shippingAddress?: ShippingAddress | null;
  shippingFee?: number;
  fulfillmentStatus?: FulfillmentStatus;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};
export const fulfillmentLabels = {
  UNFULFILLED: 'Paiement confirmé',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
};
export const countryLabels = { FR: 'France métropolitaine', BE: 'Belgique', CA: 'Canada' };
export const provinces = { QC: 'Québec', ON: 'Ontario', BC: 'Colombie-Britannique', AB: 'Alberta', MB: 'Manitoba', NB: 'Nouveau-Brunswick', NL: 'Terre-Neuve-et-Labrador', NS: 'Nouvelle-Écosse', PE: 'Île-du-Prince-Édouard', SK: 'Saskatchewan', NT: 'Territoires du Nord-Ouest', NU: 'Nunavut', YT: 'Yukon' };
export const shortReference = (id: string) => id.replaceAll('-', '').slice(0, 12).toUpperCase();
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const amount = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
export function isShippingOptions(value: unknown): value is ShippingOptions {
  return record(value) && value.currency === 'eur' && typeof value.provisional === 'boolean'
    && Array.isArray(value.destinations) && value.destinations.every((d: unknown) => record(d)
      && ['FR','BE','CA'].includes(String(d.country)) && typeof d.label === 'string' && amount(d.fee));
}
export function isShippingOrder(value: Record<string, unknown>): boolean {
  const a = value.shippingAddress;
  const address = a === undefined || a === null || (record(a)
    && ['FR','BE','CA'].includes(String(a.country))
    && ['line1','line2','city','postalCode','region'].every(k => typeof a[k] === 'string')
    && String(a.line1).length >= 3 && String(a.city).length >= 2);
  const dates = ['shippedAt','deliveredAt'].every(k => value[k] === undefined || value[k] === null
    || (typeof value[k] === 'string' && Number.isFinite(Date.parse(value[k]))));
  const tracking = ['trackingCarrier','trackingNumber'].every(k => value[k] === undefined || value[k] === null || typeof value[k] === 'string');
  return address && dates && tracking
    && (value.shippingFee === undefined || (amount(value.shippingFee) && amount(value.total) && value.shippingFee <= value.total))
    && (value.fulfillmentStatus === undefined || Object.hasOwn(fulfillmentLabels, String(value.fulfillmentStatus)));
}
