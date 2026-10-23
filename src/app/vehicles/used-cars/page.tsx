import { Suspense } from 'react';
import VehicleCatalog from '@/components/VehicleCatalog';
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="site-container section-space" role="status">
          Loading vehicles...
        </div>
      }
    >
      <VehicleCatalog category="USED_CAR" />
    </Suspense>
  );
}
