import type { Metadata } from 'next';
import MemberPanel from '@/components/member/MemberPanel';

export const metadata: Metadata = {
  title: 'Mon compte | CONNECTA',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function MemberPage() {
  return <MemberPanel />;
}
