import type { Metadata } from 'next';
import { Suspense } from 'react';
import VehicleCatalog from '@/components/VehicleCatalog';

export const metadata: Metadata = {
  title: 'Certified Pre-Owned Two-Wheelers in Raipur | Used Bikes & Scooters',
  description:
    'Buy inspected and certified used bikes and scooters at Gurudev Motors Raipur. Verified documentation, multi-point workshop quality check, and easy EMI financing.',
  keywords: [
    'Used bikes Raipur',
    'Second hand scooty Raipur',
    'Certified pre-owned two wheeler Raipur',
    'Used Activa Raipur',
    'Buy used motorcycle Raipur',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/vehicles/pre-owned',
  },
  openGraph: {
    title: 'Certified Pre-Owned Two-Wheelers in Raipur | Gurudev Motors',
    description: 'Inspected and certified pre-owned bikes and scooters with guaranteed papers in Raipur.',
    url: 'https://gurudevmotors.com/vehicles/pre-owned',
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
      <VehicleCatalog category="PRE_OWNED" />
    </Suspense>
  );
}
