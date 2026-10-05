export const PRODUCTS = {
  ew75: {
    id: 'ew75',
    brand: 'Hoco',
    model: 'EW75',
    name: 'Hoco EW75',

    color: 'Blanc',

    bluetoothVersion: '5.4',
    frequency: '2.4 GHz',
    musicTime: '4 h',
    callTime: '4 h',
    range: '10 m',

    description:
      'Des écouteurs compacts pensés pour vous accompagner au quotidien.',
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type Product = (typeof PRODUCTS)[ProductId];
