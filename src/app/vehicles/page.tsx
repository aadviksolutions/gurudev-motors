import type { Metadata } from 'next';
import { Suspense } from 'react';
import VehicleCatalog from '@/components/VehicleCatalog';

export const metadata: Metadata = {
  title: 'Two-Wheeler Inventory in Raipur | New & Pre-Owned Bikes & Scooters',
  description:
    'Explore the complete two-wheeler collection at Gurudev Motors Raipur. Filter by brand, budget, category, fuel type, and transmission. Transparent on-road pricing with instant finance.',
  keywords: [
    'Two wheeler catalogue Raipur',
    'Bikes for sale Raipur',
    'Scooters for sale Raipur',
    'Buy two wheeler Raipur',
    'Gurudev Motors inventory',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/vehicles',
  },
  openGraph: {
    title: 'Two-Wheeler Inventory in Raipur | Gurudev Motors',
    description: 'Explore the complete two-wheeler fleet ready for spot delivery in Raipur.',
    url: 'https://gurudevmotors.com/vehicles',
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
      <VehicleCatalog category="ALL" />
    </Suspense>
  );
}
