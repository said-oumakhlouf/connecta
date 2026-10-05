'use client';

import type { ReactNode } from 'react';

import { useShop } from '@/components/shop/ShopProvider';
import type { OfferId } from '@/data/offers';

type OrderButtonProps = {
  offerId: OfferId;
  children: ReactNode;
  className?: string;
};

export default function OrderButton({
  offerId,
  children,
  className = '',
}: OrderButtonProps) {
  const { order } = useShop();

  return (
    <button type="button" onClick={() => order(offerId)} className={className}>
      {children}
    </button>
  );
}
