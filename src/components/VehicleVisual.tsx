'use client';
import Image from 'next/image';
import { Bike, CarFront, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  ShowroomVehicle,
  categoryLabel,
} from '@/lib/showroom';

export default function VehicleVisual({
  vehicle,
  imageUrl,
  priority = false,
}: {
  vehicle: ShowroomVehicle;
  imageUrl?: string;
  priority?: boolean;
}) {
  const isCar = categoryLabel(vehicle) === 'Used car';
  const isElectric = categoryLabel(vehicle) === 'Electric';
  const Icon = isCar ? CarFront : isElectric ? Zap : Bike;
  const [failedSource, setFailedSource] = useState('');
  const source = imageUrl || vehicle.imageUrl;
  if (source && failedSource !== source)
    return (
      <Image
        src={source}
        alt={vehicle.brand + ' ' + vehicle.model}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        className={'vehicle-photo' + (source.startsWith('/images/vehicles/') ? ' vehicle-cutout' : '')}
        priority={priority}
        onError={() => setFailedSource(source)}
      />
    );
  return (
    <div
      className={
        'vehicle-placeholder ' +
        (isElectric ? 'electric-placeholder' : isCar ? 'car-placeholder' : '')
      }
      aria-label={vehicle.brand + ' ' + vehicle.model + ' image placeholder'}
    >
      <span className="placeholder-brand">{vehicle.brand}</span>
      <Icon strokeWidth={1.15} aria-hidden="true" />
      <span className="placeholder-type">
        {vehicle.vehicleType || 'Two-wheeler'}
      </span>
    </div>
  );
}
