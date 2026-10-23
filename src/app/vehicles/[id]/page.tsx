'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Phone,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import {
  getPublicVehicle,
  ShowroomVehicle,
  categoryLabel,
  IS_DESIGN_PREVIEW,
} from '@/lib/showroom';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';
import { useModal } from '@/context/ModalContext';
import VehicleVisual from '@/components/VehicleVisual';
import VehicleCard from '@/components/VehicleCard';
import InventoryState from '@/components/InventoryState';
import TestDriveModal from '@/components/TestDriveModal';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { openEnquiry } = useModal();
  const [vehicle, setVehicle] = useState<ShowroomVehicle | null>(null);
  const [similar, setSimilar] = useState<ShowroomVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [testVehicle, setTestVehicle] = useState<ShowroomVehicle | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError('');
    setVehicle(null);
    getPublicVehicle(id, abort.signal)
      .then((data) => {
        setVehicle(data?.vehicle || null);
        setSimilar(data?.similarVehicles || []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [id, retry]);
  if (loading)
    return (
      <div className="site-container section-space" role="status">
        <div className="vehicle-skeleton" />
        Loading vehicle...
      </div>
    );
  if (error)
    return (
      <div className="site-container section-space">
        <InventoryState error={error} onRetry={() => setRetry(retry + 1)} />
      </div>
    );
  if (!vehicle)
    return (
      <div className="site-container section-space">
        <h1>Vehicle not found.</h1>
        <p className="result-count">This listing may no longer be available.</p>
        <Link href="/vehicles" className="button button-primary">
          Explore vehicles <ArrowRight size={17} />
        </Link>
      </div>
    );
  const name = vehicle.brand + ' ' + vehicle.model;
  const category = categoryLabel(vehicle);
  const isUsed = category === 'Pre-owned' || category === 'Used car';
  const available = vehicle.stockStatus === 'IN_STOCK';
  const price = vehicle.offerPrice || vehicle.price;
  const enquire = () => openEnquiry(name, 'VEHICLE_DETAILS');
  let features: string[] = [];
  try {
    const parsed = JSON.parse(vehicle.features || '[]');
    if (Array.isArray(parsed))
      features = parsed.filter((item) => typeof item === 'string');
  } catch {
    features = (vehicle.features || '').split(',').filter(Boolean);
  }
  let specifications: Record<string, unknown> = {};
  try {
    const parsed =
      typeof vehicle.specifications === 'string'
        ? JSON.parse(vehicle.specifications)
        : vehicle.specifications;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      specifications = parsed;
  } catch {
    /* Legacy listings may not have structured specifications. */
  }
  const specificationRows = Object.entries({
    Fuel: vehicle.fuel,
    Transmission: vehicle.transmission,
    'Model year': vehicle.year,
    ...(vehicle.mileage ? { Mileage: vehicle.mileage } : {}),
    ...(isUsed && vehicle.ownerCount ? { Owners: vehicle.ownerCount } : {}),
    ...(isUsed && vehicle.regYear
      ? { 'Registration year': vehicle.regYear }
      : {}),
    ...(isUsed && vehicle.condition ? { Condition: vehicle.condition } : {}),
    ...(isUsed && vehicle.rcStatus
      ? { 'Registration certificate': vehicle.rcStatus.replaceAll('_', ' ') }
      : {}),
    ...(isUsed && vehicle.documentsStatus
      ? { Documents: vehicle.documentsStatus.replaceAll('_', ' ') }
      : {}),
    ...(isUsed && vehicle.inspectionStatus
      ? { Inspection: vehicle.inspectionStatus.replaceAll('_', ' ') }
      : {}),
    ...(isUsed && vehicle.warrantyDetails
      ? { Warranty: vehicle.warrantyDetails }
      : {}),
    ...specifications,
  }).filter(
    ([, value]) => typeof value === 'string' || typeof value === 'number',
  );
  return (
    <>
      <div className="site-container detail-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/vehicles">Vehicles</Link>
          <ChevronRight size={12} />
          <span>{name}</span>
        </nav>
        <div className="detail-grid">
          <div className="detail-visual">
            <VehicleVisual vehicle={vehicle} priority />
            <span className="vehicle-badge">{category}</span>
          </div>
          <div className="detail-summary">
            <span className="eyebrow">
              {vehicle.brand.toUpperCase()} / {category.toUpperCase()}
            </span>
            <h1>{vehicle.model}</h1>
            <p>{vehicle.variant || vehicle.vehicleType}</p>
            <div className="detail-price">
              <strong>
                {price > 0 ? formatCurrency(price) : 'Price on request'}
              </strong>
              <span>
                {IS_DESIGN_PREVIEW
                  ? 'Illustrative price. Sample vehicle, not confirmed stock.'
                  : isUsed
                    ? 'Asking price. Confirm final pricing with our team.'
                    : 'Ex-showroom. Registration, insurance and other charges extra.'}
              </span>
            </div>
            <div className="vehicle-stock">
              <span
                className={available ? 'stock-dot' : 'stock-dot stock-muted'}
              />
              {IS_DESIGN_PREVIEW
                ? 'Sample listing'
                : available
                  ? 'Available to enquire'
                  : vehicle.stockStatus.replaceAll('_', ' ').toLowerCase()}
            </div>
            <div className="detail-key-specs">
              <div>
                <span>{isUsed ? 'Year' : 'Engine / fuel'}</span>
                {isUsed
                  ? vehicle.year
                  : vehicle.engineCC
                    ? vehicle.engineCC + ' cc'
                    : vehicle.fuel}
              </div>
              <div>
                <span>{isUsed ? 'Distance' : 'Transmission'}</span>
                {isUsed
                  ? vehicle.km.toLocaleString('en-IN') + ' km'
                  : vehicle.transmission}
              </div>
              <div>
                <span>Colour</span>
                {vehicle.colour || 'Ask our team'}
              </div>
            </div>
            <div className="detail-actions">
              <button className="button button-primary" onClick={enquire}>
                {available ? 'Get a price quote' : 'Ask about availability'}
                <ArrowUpRight size={17} />
              </button>
              <button
                className="button button-secondary"
                disabled={!available}
                onClick={() => setTestVehicle(vehicle)}
              >
                Request a test ride
              </button>
            </div>
            <p className="form-note">
              Our team will confirm the variant, availability and final price
              with you.
            </p>
            <div className="detail-links">
              {vehicle.financeAvailable !== false && (
                <Link
                  className="text-link"
                  href={
                    '/finance?model=' +
                    encodeURIComponent(name) +
                    '&amount=' +
                    price
                  }
                >
                  <Wallet size={16} />
                  Explore EMI
                </Link>
              )}
              {vehicle.exchangeAvailable !== false && (
                <Link
                  className="text-link"
                  href={'/exchange?upgrade=' + encodeURIComponent(name)}
                >
                  <RefreshCw size={16} />
                  Exchange your ride
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="detail-description">
          <div>
            <h2>A closer look.</h2>
            <p>
              {vehicle.description ||
                'Speak with our showroom team about specifications, available colours and the right variant for you.'}
            </p>
          </div>
          <div>
            <h2>Vehicle highlights</h2>
            {features.length ? (
              <ul className="feature-list">
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Detailed features and condition information are available from
                our showroom team.
              </p>
            )}
          </div>
        </div>
        <section className="detail-specifications">
          <h2>Specifications & details</h2>
          <dl>
            {specificationRows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
          {!!vehicle.onRoadPrice && (
            <p className="form-note">
              Listed on-road price: {formatCurrency(vehicle.onRoadPrice)}.
              Confirm inclusions with the showroom.
            </p>
          )}
        </section>
        {!!similar.length && (
          <section className="section-space">
            <div className="section-heading">
              <h2>Worth a look, too.</h2>
              <Link href="/vehicles" className="text-link">
                View all <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="vehicle-grid">
              {similar.map((item) => (
                <VehicleCard
                  key={item.id}
                  vehicle={item}
                  onEnquire={openEnquiry}
                  onTestDrive={setTestVehicle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="detail-mobile-actions">
        <a
          className="button button-secondary"
          href={'tel:' + CONTACT_INFO.phoneRaw}
        >
          <Phone size={17} />
          Call showroom
        </a>
        <button className="button button-primary" onClick={enquire}>
          Enquire now <ArrowUpRight size={17} />
        </button>
      </div>
      <TestDriveModal
        isOpen={!!testVehicle}
        onClose={() => setTestVehicle(null)}
        vehicle={testVehicle}
      />
    </>
  );
}
