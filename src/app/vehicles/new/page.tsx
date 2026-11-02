import type { Metadata } from 'next';
import { Suspense } from 'react';
import VehicleCatalog from '@/components/VehicleCatalog';

export const metadata: Metadata = {
  title: 'New Two-Wheelers in Raipur | Motorcycles & Scooters',
  description:
    'Browse brand new motorcycles and scooters at Gurudev Motors Raipur. Best on-road prices, festive discount offers, low down payment finance, and instant spot delivery.',
  keywords: [
    'New bikes Raipur',
    'New scooters Raipur',
    'Honda Activa showroom Raipur',
    'Hero Splendor Raipur',
    'TVS Jupiter Raipur',
    'Two wheeler showroom Mahadevghat',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/vehicles/new',
  },
  openGraph: {
    title: 'New Two-Wheelers in Raipur | Gurudev Motors',
    description: 'Explore the latest motorcycles and scooters with spot delivery in Raipur.',
    url: 'https://gurudevmotors.com/vehicles/new',
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
      <VehicleCatalog category="NEW" />
    </Suspense>
  );
}
