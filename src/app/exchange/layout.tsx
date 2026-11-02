import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Two-Wheeler Exchange Offer in Raipur | Gurudev Motors',
  description:
    'Exchange your old motorcycle or scooter for a new or certified pre-owned ride at Gurudev Motors Raipur. Best exchange valuation, instant spot evaluation, and hassle-free paperwork.',
  keywords: [
    'Old bike exchange Raipur',
    'Scooty exchange offer Raipur',
    'Two wheeler exchange bonus',
    'Sell old bike in Raipur',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/exchange',
  },
  openGraph: {
    title: 'Two-Wheeler Exchange Offer in Raipur | Gurudev Motors',
    description: 'Exchange your current two-wheeler with best valuation and instant upgrade bonus.',
    url: 'https://gurudevmotors.com/exchange',
  },
};

export default function ExchangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

