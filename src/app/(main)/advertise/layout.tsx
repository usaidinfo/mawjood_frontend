import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertise Your Business | Mawjood',
  description: 'Grow your business with Mawjood advertising. Reach thousands of customers, increase revenue, and get more walk-in customers.',
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

