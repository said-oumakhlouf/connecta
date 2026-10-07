export const OFFERS = {
  solo: {
    id: 'solo',
    title: 'Une paire',
    description: 'Votre nouveau compagnon au quotidien.',
    price: 35,
    quantity: 1,
  },
  duo: {
    id: 'duo',
    title: 'Le pack Duo',
    description: 'Une pour vous. Une pour quelqu’un de bien.',
    price: 60,
    quantity: 2,
  },
} as const;

export type OfferId = keyof typeof OFFERS;
export type Offer = Omit<(typeof OFFERS)[OfferId], 'price'> & { price: number };

export type Cart = {
  id: OfferId;
  count: number;
};
