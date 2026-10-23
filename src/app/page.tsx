'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  CarFront,
  ChevronRight,
  CircleHelp,
  Clock3,
  MapPin,
  Phone,
  Search,
  Wrench,
  Zap,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CONTACT_INFO, VEHICLE_BRANDS } from '@/lib/constants';
import {
  getPublicInventory,
  IS_DESIGN_PREVIEW,
  matchesCategory,
  ShowroomVehicle,
} from '@/lib/showroom';
import { useModal } from '@/context/ModalContext';
import VehicleCard from '@/components/VehicleCard';
import InventoryState from '@/components/InventoryState';
import TestDriveModal from '@/components/TestDriveModal';
import RotatingHero from '@/components/RotatingHero';
import RoadHero from '@/components/RoadHero';
import ShowroomPhotos from '@/components/ShowroomPhotos';

const brandLogos: Record<string, { src: string; width: number; height: number }> = {
  TVS: { src: '/images/brands/tvs.svg', width: 148, height: 27 },
  Honda: { src: '/images/brands/honda.svg', width: 2000, height: 1605 },
  Suzuki: { src: '/images/brands/suzuki.svg', width: 453, height: 87 },
  Hero: { src: '/images/brands/hero.svg', width: 122, height: 41 },
  Bajaj: { src: '/images/brands/bajaj.svg', width: 1024, height: 218 },
};

const categories = [
  { label: 'New bikes', value: 'NEW', icon: Bike, href: '/vehicles/new' },
  {
    label: 'Scooters',
    value: 'SCOOTER',
    icon: Bike,
    href: '/vehicles?category=SCOOTER',
  },
  {
    label: 'Used bikes',
    value: 'PRE_OWNED',
    icon: RefreshCw,
    href: '/vehicles/pre-owned',
  },
  {
    label: 'Electric',
    value: 'ELECTRIC',
    icon: Zap,
    href: '/vehicles/electric',
  },
  {
    label: 'Used cars',
    value: 'USED_CAR',
    icon: CarFront,
    href: '/vehicles/used-cars',
  },
];
export default function HomePage() {
  const router = useRouter();
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<ShowroomVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [brand, setBrand] = useState('ALL');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [testVehicle, setTestVehicle] = useState<ShowroomVehicle | null>(null);
  const [classicHero, setClassicHero] = useState(false);
  const [ovalHero, setOvalHero] = useState(false);
  const showHeroTrial = IS_DESIGN_PREVIEW && !classicHero;
  useEffect(() => {
    setClassicHero(new URLSearchParams(window.location.search).get('hero') === 'classic');
    setOvalHero(new URLSearchParams(window.location.search).get('hero') === 'oval');
  }, []);
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
  const featured = useMemo(
    () =>
      vehicles
        .filter(
          (vehicle) =>
            (brand === 'ALL' || vehicle.brand === brand) &&
            matchesCategory(vehicle, category),
        )
        .slice(0, 4),
    [vehicles, brand, category],
  );
  const browse = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/vehicles?q=' + encodeURIComponent(search));
  };
  return (
    <>
      {showHeroTrial && (ovalHero ? <RotatingHero vehicles={vehicles} /> : <RoadHero vehicles={vehicles} />)}
      <section className={'showroom-intro' + (showHeroTrial ? ' hero-browse-tools' : '')}>
        <div className="site-container">
          {!showHeroTrial && <div className="intro-top">
            <div>
              <span className="eyebrow">
                <span className="red-tick" /> YOUR MULTI-BRAND SHOWROOM IN
                RAIPUR
              </span>
              <h1>
                Gurudev Motors<span className="red-period">.</span>
              </h1>
              <p>Find your ride. We’ll take care of the rest.</p>
            </div>
            <div className="showroom-location">
              <MapPin size={19} />
              <div>
                <strong>Raipura, Raipur</strong>
                <Link href="/contact">
                  Visit the showroom <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>}
          <form onSubmit={browse} className="home-search">
            <Search size={21} />
            <label className="sr-only" htmlFor="home-search">
              Search vehicles
            </label>
            <input
              id="home-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by brand or model"
            />
            <button
              className="button button-primary"
              type="submit"
              aria-label="Find my ride"
              title="Find my ride"
            >
              <span>Find my ride</span>
              <ArrowRight size={19} />
            </button>
          </form>
          <div className="category-shortcuts">
            {categories.map((item) => (
              <Link key={item.value} href={item.href}>
                <span
                  className={
                    'category-icon category-' + item.value.toLowerCase()
                  }
                >
                  <item.icon size={24} strokeWidth={1.6} />
                </span>
                <span>{item.label}</span>
                <ChevronRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="brand-band">
        <div className="site-container">
          <span>FIVE BRANDS. MORE CHOICE.</span>
          <div className="manufacturer-logos">
            {VEHICLE_BRANDS.map((item) => (
              <Link
                key={item}
                href={'/vehicles?brand=' + item}
                className={'manufacturer-link manufacturer-' + item.toLowerCase()}
                aria-label={'Browse ' + item + ' vehicles'}
                title={'Browse ' + item + ' vehicles'}
              >
                <Image
                  {...brandLogos[item]}
                  alt={item}
                  className="manufacturer-logo"
                  unoptimized
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space site-container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR VEHICLES</span>
            <h2>Find your next vehicle.</h2>
          </div>
          <Link href="/vehicles" className="text-link">
            Explore all vehicles <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="home-inventory-toolbar">
          <div className="segment-control" aria-label="Vehicle category">
            {[
              { label: 'All vehicles', value: 'ALL' },
              { label: 'New', value: 'NEW' },
              { label: 'Used bikes', value: 'PRE_OWNED' },
              { label: 'Electric', value: 'ELECTRIC' },
              { label: 'Used cars', value: 'USED_CAR' },
            ].map((item) => (
              <button
                key={item.value}
                className={category === item.value ? 'active' : ''}
                aria-pressed={category === item.value}
                onClick={() => setCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="brand-select">
            <span className="sr-only">Filter by brand</span>
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="ALL">All brands</option>
              {VEHICLE_BRANDS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        {loading ? (
          <div className="vehicle-grid" aria-label="Loading vehicles">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="vehicle-skeleton" />
            ))}
          </div>
        ) : error || !featured.length ? (
          <InventoryState
            error={error}
            filtered={!!vehicles.length}
            onRetry={() => {
              setRetry(retry + 1);
              setCategory('ALL');
              setBrand('ALL');
            }}
          />
        ) : (
          <div className="vehicle-grid">
            {featured.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEnquire={openEnquiry}
                onTestDrive={setTestVehicle}
              />
            ))}
          </div>
        )}
        <div className="help-line">
          <CircleHelp size={18} />
          <span>Not sure where to start?</span>
          <button onClick={() => openEnquiry('Help me choose a vehicle')}>
            Help me choose <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <section className="ownership-band" aria-label="Payments, exchange and service">
        <div className="site-container ownership-grid">
          <Link href="/finance" className="ownership-item">
            <span className="ownership-icon finance-icon">
              <Wallet aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">PAYMENT OPTIONS</span>
              <h3>Pay in monthly instalments.</h3>
              <p>Check an EMI amount that fits your budget.</p>
              <span className="text-link">
                Calculate your EMI <ArrowRight size={16} />
              </span>
            </div>
          </Link>
          <div className="ownership-item">
            <span className="ownership-icon exchange-icon">
              <RefreshCw aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">USED BIKES &amp; EXCHANGE</span>
              <h3>Buy used. Or exchange yours.</h3>
              <p>Ask about used bikes and scooters, or the value of your old vehicle.</p>
              <div className="ownership-links">
                <Link className="text-link" href="/vehicles/pre-owned">See used bikes <ArrowRight size={16} /></Link>
                <Link className="text-link" href="/exchange">Exchange my vehicle <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
          <Link href="/service-centre" className="ownership-item">
            <span className="ownership-icon ownership-service-icon">
              <Wrench aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">WORKSHOP CARE</span>
              <h3>Bike service and repairs.</h3>
              <p>Keep your bike or scooter ready for daily travel.</p>
              <span className="text-link">
                Book a service <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <ShowroomPhotos />
      <section className="visit-band">
        <div className="site-container visit-grid">
          <div>
            <span className="eyebrow">ABOUT GURUDEV MOTORS</span>
            <h2>Your showroom in Raipur.</h2>
            <p>
              Compare TVS, Honda, Suzuki, Hero and Bajaj at one showroom.
              Our team can help you choose a vehicle, discuss monthly payments
              and exchange your old bike.
            </p>
            <Link className="text-link" href="/about">
              About us <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="visit-details">
            <div>
              <MapPin size={20} />
              <div>
                <h3>Find us in Raipura</h3>
                <p>{CONTACT_INFO.showroomAddress}</p>
                <a
                  className="text-link"
                  href={CONTACT_INFO.mapLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div>
              <Clock3 size={20} />
              <div>
                <h3>Opening hours</h3>
                <p>{CONTACT_INFO.timings}</p>
              </div>
            </div>
            <div>
              <Phone size={20} />
              <div>
                <h3>Call us</h3>
                <a href={'tel:' + CONTACT_INFO.phoneRaw}>
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TestDriveModal
        isOpen={!!testVehicle}
        onClose={() => setTestVehicle(null)}
        vehicle={testVehicle}
      />
    </>
  );
}
