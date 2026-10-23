'use client';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Fuel, Gauge, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  categoryLabel,
  IS_DESIGN_PREVIEW,
  ShowroomVehicle,
} from '@/lib/showroom';
import VehicleVisual from './VehicleVisual';
export type VehicleData = ShowroomVehicle;
export default function VehicleCard({
  vehicle,
  onEnquire,
  onTestDrive,
}: {
  vehicle: VehicleData;
  onEnquire?: (vehicleName: string) => void;
  onTestDrive?: (vehicle: VehicleData) => void;
}) {
  const category = categoryLabel(vehicle);
  const isUsed = category === 'Pre-owned' || category === 'Used car';
  const electric = category === 'Electric';
  const price = vehicle.offerPrice || vehicle.price;
  const available = vehicle.stockStatus === 'IN_STOCK';
  return (
    <article className="vehicle-card">
      <Link
        href={'/vehicles/' + vehicle.id}
        className="vehicle-media"
        aria-label={'View ' + vehicle.brand + ' ' + vehicle.model}
      >
        <VehicleVisual vehicle={vehicle} />
        <span className={'vehicle-badge ' + (electric ? 'badge-electric' : '')}>
          {category}
        </span>
      </Link>
      <div className="vehicle-card-body">
        <span className="vehicle-brand">{vehicle.brand}</span>
        <div className="vehicle-card-title">
          <Link href={'/vehicles/' + vehicle.id}>
            <h3>{vehicle.model}</h3>
          </Link>
          <div className="vehicle-specs">
          {isUsed ? (
            <>
              <span>
                <CalendarDays size={13} />
                {vehicle.year}
              </span>
              <span>
                <Gauge size={13} />
                {vehicle.km.toLocaleString('en-IN')} km
              </span>
            </>
          ) : (
            <>
              <span>
                {electric ? <Zap size={13} /> : <Fuel size={13} />}
                {vehicle.engineCC ? vehicle.engineCC + ' cc' : vehicle.fuel}
              </span>
              <span>{vehicle.transmission}</span>
            </>
          )}
          </div>
        </div>
        <p className="vehicle-variant">
          {vehicle.variant || vehicle.vehicleType || 'View vehicle details'}
        </p>
        <div className="vehicle-price">
          <strong>
            {price > 0 ? formatCurrency(price) : 'Price on request'}
          </strong>
          <span>
            {IS_DESIGN_PREVIEW
              ? 'Sample price'
              : isUsed
                ? 'Asking price'
                : 'Ex-showroom'}
          </span>
        </div>
        <div className={'vehicle-stock' + (IS_DESIGN_PREVIEW ? ' sample-stock' : '')}>
          <span className={available && !IS_DESIGN_PREVIEW ? 'stock-dot' : 'stock-dot stock-muted'} />
          {IS_DESIGN_PREVIEW
            ? 'Sample listing'
            : available
              ? 'Available to enquire'
              : vehicle.stockStatus.toLowerCase().replaceAll('_', ' ')}
        </div>
        {onEnquire ? (
          <button
            className="button card-enquiry"
            onClick={() => onEnquire(vehicle.brand + ' ' + vehicle.model)}
          >
            {available
              ? 'Ask for price'
              : 'Ask about availability'}
            <ArrowUpRight size={16} />
          </button>
        ) : (
          <Link
            className="button card-enquiry"
            href={'/vehicles/' + vehicle.id}
          >
            View details <ArrowUpRight size={16} />
          </Link>
        )}
        {onTestDrive && (
          <button
            className="card-test-drive"
            onClick={() => onTestDrive(vehicle)}
            disabled={!available}
          >
            Book a test ride
          </button>
        )}
      </div>
    </article>
  );
}
