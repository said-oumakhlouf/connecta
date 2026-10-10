import type { ShippingAddress, ShippingOptions } from '@/lib/shipping';
import { provinces } from '@/lib/shipping';

const input = 'w-full rounded-xl border border-[#e0e3e8] bg-white px-4 py-3 text-base outline-none focus:border-[#235bfa] focus:ring-2 focus:ring-[#235bfa20]';
export default function ShippingFields({ address, options, onChange, disabled }: {
  address: ShippingAddress; options: ShippingOptions | null;
  onChange: (value: ShippingAddress) => void; disabled: boolean;
}) {
  return <fieldset disabled={disabled} className="mt-6 min-w-0 space-y-4 border-0 p-0">
    <legend className="mb-4 text-sm font-semibold">Votre adresse de livraison</legend>
    <label className="block text-xs font-medium" htmlFor="shipping-country">Pays
      <select id="shipping-country" autoComplete="shipping country" className={`${input} mt-2`}
        value={address.country} onChange={e => onChange({ ...address, country: e.target.value as ShippingAddress['country'], postalCode: '', region: e.target.value === 'CA' ? 'QC' : '' })}>
        {(options?.destinations ?? []).map(d => <option key={d.country} value={d.country}>{d.label}</option>)}
      </select>
    </label>
    {([
      ['line1', 'Numéro et rue', 'shipping address-line1', 160, 3],
      ['line2', 'Complément d’adresse (facultatif)', 'shipping address-line2', 160, 0],
      ['city', 'Ville', 'shipping address-level2', 100, 2],
      ['postalCode', 'Code postal', 'shipping postal-code', 12, 3],
    ] as const).map(([field, label, autocomplete, max, min]) =>
      <label key={field} className="block text-xs font-medium" htmlFor={`shipping-${field}`}>{label}
        <input id={`shipping-${field}`} name={`shipping-${field}`} autoComplete={autocomplete}
          required={field !== 'line2'} minLength={min} maxLength={max} className={`${input} mt-2`}
          value={address[field]} onChange={e => onChange({ ...address, [field]: e.target.value })}
          pattern={field === 'postalCode' ? address.country === 'FR' ? '(0[1-9]|[1-8][0-9]|9[0-5])[0-9]{3}' : address.country === 'BE' ? '[1-9][0-9]{3}' : '[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]' : undefined}
          placeholder={field === 'postalCode' ? address.country === 'CA' ? 'H2X 1Y4' : address.country === 'BE' ? '1000' : '75001' : undefined}
        />
      </label>)}
    {address.country === 'CA' && <label className="block text-xs font-medium" htmlFor="shipping-province">Province ou territoire
      <select required id="shipping-province" autoComplete="shipping address-level1" className={`${input} mt-2`} value={address.region}
        onChange={e => onChange({ ...address, region: e.target.value })}>
        {Object.entries(provinces).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
    </label>}
    <p className="text-xs leading-5 text-[#72767f]">Le colis sera adressé au nom complet indiqué ci-dessus. Vérifiez l’adresse avant de payer.</p>
  </fieldset>;
}
