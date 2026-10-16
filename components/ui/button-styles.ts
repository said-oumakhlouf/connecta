/** Shared storefront button styles: one primary action colour (brand blue), one quiet secondary. */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed';

export const primaryButton = `${base} bg-brand text-white hover:bg-brand-dark disabled:bg-[#b5bdca]`;

export const secondaryButton = `${base} border border-line bg-white text-ink hover:border-[#c9d1de] hover:bg-panel`;

export const buttonSize = {
  md: 'min-h-11 px-5 text-[13px]',
  lg: 'min-h-12 px-6 text-sm',
} as const;
