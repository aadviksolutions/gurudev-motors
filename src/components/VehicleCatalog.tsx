'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { VEHICLE_BRANDS } from '@/lib/constants';
import {
  getPublicInventory,
  matchesCategory,
  ShowroomVehicle,
} from '@/lib/showroom';
import { useModal } from '@/context/ModalContext';
import VehicleCard from './VehicleCard';
import TestDriveModal from './TestDriveModal';
import InventoryState from './InventoryState';
import Dialog from './Dialog';

const categories = [
  { value: 'ALL', label: 'All vehicles' },
  { value: 'NEW', label: 'New' },
  { value: 'SCOOTER', label: 'Scooters' },
  { value: 'PRE_OWNED', label: 'Pre-owned' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'USED_CAR', label: 'Used cars' },
];
export default function VehicleCatalog({
  category: initialCategory = 'ALL',
}: {
  category?: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<ShowroomVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [testVehicle, setTestVehicle] = useState<ShowroomVehicle | null>(null);
  const query = params.get('q') || '';
  const brand = params.get('brand') || 'ALL';
  const category = params.get('category') || initialCategory;
  const budget = params.get('budget') || 'ALL';
  const sort = params.get('sort') || 'featured';
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'ALL' && value !== 'featured') next.set(key, value);
    else next.delete(key);
    router.replace(pathname + (next.size ? '?' + next.toString() : ''), {
      scroll: false,
    });
  };
  const reset = () => router.replace(pathname, { scroll: false });
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError('');
    getPublicInventory(abort.signal)
      .then(setVehicles)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [retry]);
  const results = useMemo(
    () =>
      vehicles
        .filter((vehicle) => {
          const text = [
            vehicle.brand,
            vehicle.model,
            vehicle.variant,
            vehicle.vehicleType,
          ]
            .join(' ')
            .toLowerCase();
          const price = vehicle.offerPrice || vehicle.price;
          return (
            matchesCategory(vehicle, category) &&
            (brand === 'ALL' || vehicle.brand === brand) &&
            text.includes(query.toLowerCase().trim()) &&
            (budget === 'ALL' || (price > 0 && price <= Number(budget)))
          );
        })
        .sort((a, b) =>
          sort === 'price-asc'
            ? (a.offerPrice || a.price) - (b.offerPrice || b.price)
            : sort === 'price-desc'
              ? (b.offerPrice || b.price) - (a.offerPrice || a.price)
              : sort === 'year'
                ? b.year - a.year
                : Number(!!b.featured) - Number(!!a.featured),
        ),
    [vehicles, query, brand, category, budget, sort],
  );
  const title =
    initialCategory === 'ALL'
      ? 'Find your next ride.'
      : initialCategory === 'NEW'
        ? 'New bikes & scooters.'
        : initialCategory === 'PRE_OWNED'
          ? 'A fresh start. Pre-owned.'
          : initialCategory === 'ELECTRIC'
            ? 'Your next ride, electric.'
            : 'Find your next used car.';
  const filterCount = Number(brand !== 'ALL') + Number(budget !== 'ALL');
  const Filters = (
    <div className="catalog-filters">
      <label>
        Brand
        <select value={brand} onChange={(e) => update('brand', e.target.value)}>
          <option value="ALL">All brands</option>
          {VEHICLE_BRANDS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Budget
        <select
          value={budget}
          onChange={(e) => update('budget', e.target.value)}
        >
          <option value="ALL">Any budget</option>
          <option value="75000">Under Rs. 75,000</option>
          <option value="100000">Under Rs. 1 lakh</option>
          <option value="150000">Under Rs. 1.5 lakh</option>
          <option value="600000">Under Rs. 6 lakh</option>
        </select>
      </label>
      <button onClick={reset}>Reset filters</button>
    </div>
  );
  return (
    <>
      <section className="catalog-heading">
        <div className="site-container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span>Explore vehicles</span>
          </div>
          <span className="eyebrow">YOUR RIDE. YOUR WAY.</span>
          <h1>{title}</h1>
          <p>
            Compare your options. Ask about prices. Take the next step with our
            Raipur team.
          </p>
        </div>
      </section>
      <section className="site-container catalog-body">
        <nav className="segment-control" aria-label="Vehicle categories">
          {categories.map((item) => (
            <Link
              className={
                'catalog-category ' + (category === item.value ? 'active' : '')
              }
              href={
                '/vehicles' +
                (item.value === 'ALL' ? '' : '?category=' + item.value)
              }
              aria-current={category === item.value ? 'page' : undefined}
              key={item.value}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} />
            <span className="sr-only">Search by brand or model</span>
            <input
              value={query}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Search brand or model"
              aria-label="Search by brand or model"
            />
            {query && (
              <button
                className="icon-button"
                onClick={() => update('q', '')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>
          <button
            className="button button-secondary mobile-filter-button"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={15} />
            Filters{filterCount > 0 ? ' (' + filterCount + ')' : ''}
          </button>
          <label>
            <span className="sr-only">Sort vehicles</span>
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="year">Newest year first</option>
            </select>
          </label>
        </div>
        {Filters}
        <p className="result-count" role="status">
          {loading
            ? 'Loading vehicles...'
            : results.length +
              (results.length === 1 ? ' vehicle' : ' vehicles')}
          {query ? ' matching "' + query + '"' : ''}
        </p>
        {loading ? (
          <div className="vehicle-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="vehicle-skeleton" />
            ))}
          </div>
        ) : error || !results.length ? (
          <InventoryState
            error={error}
            filtered={!!vehicles.length}
            onRetry={() => {
              if (error) setRetry(retry + 1);
              else reset();
            }}
          />
        ) : (
          <div className="vehicle-grid">
            {results.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEnquire={openEnquiry}
                onTestDrive={setTestVehicle}
              />
            ))}
          </div>
        )}
      </section>
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="vehicle filters"
        className="filter-dialog"
      >
        <span className="eyebrow">NARROW IT DOWN</span>
        <h2>Your preferences.</h2>
        {Filters}
        <button
          className="button button-primary button-wide"
          onClick={() => setFilterOpen(false)}
        >
          Show {results.length} vehicles
        </button>
      </Dialog>
      <TestDriveModal
        isOpen={!!testVehicle}
        onClose={() => setTestVehicle(null)}
        vehicle={testVehicle}
      />
    </>
  );
}
