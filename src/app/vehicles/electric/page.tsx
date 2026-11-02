import type { Metadata } from 'next';
import { Suspense } from 'react';
import VehicleCatalog from '@/components/VehicleCatalog';

export const metadata: Metadata = {
  title: 'Electric Scooters & EV Mobility in Raipur | Gurudev Motors',
  description:
    'Discover smart electric scooters and EV two-wheelers at Gurudev Motors Raipur. High range, low running cost, battery warranty, and government subsidy benefits.',
  keywords: [
    'Electric scooter Raipur',
    'EV two wheeler showroom Raipur',
    'Best electric bike Raipur',
    'Electric scooter price Raipur',
    'Green mobility Raipur',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/vehicles/electric',
  },
  openGraph: {
    title: 'Electric Scooters & EV Mobility in Raipur | Gurudev Motors',
    description: 'Switch to green mobility with high-range electric scooters in Raipur.',
    url: 'https://gurudevmotors.com/vehicles/electric',
  },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="site-container section-space" role="status">
          Loading vehicles...
        </div>
      }
    >
      <VehicleCatalog category="ELECTRIC" />
    </Suspense>
  );
}
