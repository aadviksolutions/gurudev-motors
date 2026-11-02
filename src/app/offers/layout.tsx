import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Deals & Festival Offers | Gurudev Motors Raipur',
  description:
    'Save big with exclusive seasonal discounts, exchange bonuses, zero down payment finance schemes, and free service packages at Gurudev Motors Raipur.',
  keywords: [
    'Bike offers Raipur',
    'Two wheeler festival discount Raipur',
    'Activa offer Raipur',
    'Gurudev Motors offers',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/offers',
  },
  openGraph: {
    title: 'Special Deals & Festival Offers | Gurudev Motors Raipur',
    description: 'Explore active discounts, exchange bonuses, and low-interest EMI offers in Raipur.',
    url: 'https://gurudevmotors.com/offers',
  },
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

