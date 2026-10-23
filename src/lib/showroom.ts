export const IS_DESIGN_PREVIEW =
  process.env.NEXT_PUBLIC_DESIGN_PREVIEW === 'true' &&
  (process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview');

export interface ShowroomVehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  category: string;
  vehicleType?: string;
  year: number;
  fuel: string;
  transmission: string;
  km: number;
  colour: string;
  price: number;
  offerPrice?: number | null;
  onRoadPrice?: number | null;
  emi?: number | null;
  engineCC?: number | null;
  mileage?: string | null;
  description?: string | null;
  features?: string | null;
  specifications?: string | Record<string, string> | null;
  stockStatus: string;
  featured?: boolean;
  published?: boolean;
  imageUrl?: string | null;
  images?: { url: string; id?: string }[];
  ownerCount?: number | null;
  inspectionStatus?: string | null;
  warrantyDetails?: string | null;
  financeAvailable?: boolean;
  exchangeAvailable?: boolean;
  regYear?: number | null;
  condition?: string | null;
  rcStatus?: string | null;
  documentsStatus?: string | null;
  insuranceValidTill?: string | null;
}

const base = {
  category: 'NEW',
  year: 2026,
  fuel: 'Petrol',
  transmission: 'Manual',
  km: 0,
  colour: 'Red',
  stockStatus: 'IN_STOCK',
  published: true,
  featured: true,
  vehicleType: 'Motorcycle',
};

// Fixtures are used only by the explicitly enabled development preview.
export const SAMPLE_VEHICLES: ShowroomVehicle[] = [
  {
    ...base,
    id: 'draft-raider',
    brand: 'TVS',
    model: 'Raider 125',
    variant: 'Single seat',
    imageUrl: '/images/vehicles/tvs-raider-side.webp',
    price: 86000,
    emi: 2850,
    engineCC: 125,
    description:
      'A bike for daily travel. Ask us about colours, monthly payments and a test ride.',
    features:
      'Digital instrument cluster,LED headlamp,Comfortable riding position',
  },
  {
    ...base,
    id: 'draft-activa',
    brand: 'Honda',
    model: 'Activa',
    variant: 'Standard',
    imageUrl: '/images/vehicles/honda-activa.png',
    vehicleType: 'Scooter',
    transmission: 'Automatic',
    colour: 'Blue',
    price: 79000,
    emi: 2600,
    engineCC: 110,
    description:
      'An automatic scooter for daily travel. Ask us which colours and models are available.',
    features:
      'Automatic transmission,Under-seat storage,Convenient everyday riding',
  },
  {
    ...base,
    id: 'draft-access',
    brand: 'Suzuki',
    model: 'Access 125',
    variant: 'Special edition',
    imageUrl: '/images/vehicles/suzuki-access-cutout.png',
    vehicleType: 'Scooter',
    transmission: 'Automatic',
    colour: 'Green',
    price: 85000,
    emi: 2800,
    engineCC: 125,
    description: 'A scooter with a wide seat and space for daily essentials.',
    features: 'Automatic transmission,Spacious seat,Everyday practicality',
  },
  {
    ...base,
    id: 'draft-pulsar',
    brand: 'Bajaj',
    model: 'Pulsar N160',
    variant: 'Dual-channel ABS',
    imageUrl: '/images/vehicles/bajaj-pulsar-side.webp',
    price: 132000,
    emi: 4350,
    engineCC: 160,
    description: 'A sporty bike for daily rides. Ask us about the model, brakes and monthly payment options.',
    features: 'Disc brakes,Digital instrument cluster,Sporty riding position',
  },
  {
    ...base,
    id: 'draft-splendor',
    brand: 'Hero',
    model: 'Splendor Plus',
    variant: 'Self start',
    imageUrl: '/images/vehicles/hero-splendor.png',
    price: 77000,
    emi: 2550,
    engineCC: 100,
    colour: 'Black',
    description:
      'A simple bike for work and everyday trips. Ask us about price, colours and a test ride.',
    features: 'Alloy wheels,Electric start,Everyday commuter',
  },
  {
    ...base,
    id: 'draft-iqube',
    brand: 'TVS',
    model: 'iQube',
    variant: 'Electric scooter',
    category: 'ELECTRIC',
    vehicleType: 'Electric Scooter',
    fuel: 'Electric',
    transmission: 'Automatic',
    price: 112000,
    emi: 3700,
    colour: 'White',
    description:
      'Make room for electric in your daily routine. Discuss charging, variants and a test ride.',
    features: 'Electric powertrain,Under-seat storage,Digital display',
  },
  {
    ...base,
    id: 'draft-used-activa',
    brand: 'Honda',
    model: 'Activa',
    variant: 'Pre-owned scooter',
    category: 'PRE_OWNED',
    vehicleType: 'Scooter',
    transmission: 'Automatic',
    colour: 'White',
    year: 2022,
    km: 18500,
    price: 48000,
    featured: false,
    ownerCount: 1,
    description:
      'Sample pre-owned listing. Actual condition and documentation require showroom confirmation.',
  },
  {
    ...base,
    id: 'draft-swift',
    brand: 'Suzuki',
    model: 'Swift',
    variant: 'Pre-owned hatchback',
    category: 'USED_CAR',
    vehicleType: 'Car',
    year: 2024,
    km: 24000,
    price: 575000,
    featured: false,
    ownerCount: 1,
    description:
      'Sample used-car listing. Actual stock, condition and terms require showroom confirmation.',
  },
];

export function categoryLabel(vehicle: ShowroomVehicle) {
  if (
    vehicle.category === 'USED_CAR' ||
    /car|hatchback|sedan|suv/i.test(vehicle.vehicleType || '')
  )
    return 'Used car';
  if (vehicle.category === 'PRE_OWNED') return 'Pre-owned';
  if (vehicle.category === 'ELECTRIC' || vehicle.fuel === 'Electric')
    return 'Electric';
  return 'New';
}

export function matchesCategory(vehicle: ShowroomVehicle, category: string) {
  if (category === 'ALL') return true;
  if (category === 'USED_CAR') return categoryLabel(vehicle) === 'Used car';
  if (category === 'ELECTRIC') return categoryLabel(vehicle) === 'Electric';
  if (category === 'SCOOTER')
    return (
      /scooter/i.test(vehicle.vehicleType || '') &&
      vehicle.category !== 'PRE_OWNED'
    );
  return vehicle.category === category && categoryLabel(vehicle) !== 'Used car';
}

export async function getPublicInventory(
  signal?: AbortSignal,
): Promise<ShowroomVehicle[]> {
  if (IS_DESIGN_PREVIEW) return SAMPLE_VEHICLES;
  const response = await fetch('/api/vehicles', { signal });
  if (!response.ok)
    throw new Error('We could not load the vehicle list. Please try again.');
  const data = await response.json();
  if (!data.success || !Array.isArray(data.vehicles))
    throw new Error('We could not load the vehicle list. Please try again.');
  return data.vehicles;
}

export async function getPublicVehicle(
  id: string,
  signal?: AbortSignal,
): Promise<{
  vehicle: ShowroomVehicle;
  similarVehicles: ShowroomVehicle[];
} | null> {
  if (IS_DESIGN_PREVIEW) {
    const vehicle = SAMPLE_VEHICLES.find((item) => item.id === id);
    return vehicle
      ? {
          vehicle,
          similarVehicles: SAMPLE_VEHICLES.filter(
            (item) => item.id !== id && item.category === vehicle.category,
          ).slice(0, 4),
        }
      : null;
  }
  const response = await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
    signal,
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error('We could not load this vehicle. Please try again.');
  const data = await response.json();
  if (!data.success || !data.vehicle)
    throw new Error('We could not load this vehicle. Please try again.');
  return data;
}

export async function submitPublicRequest(
  endpoint: string,
  payload: Record<string, unknown>,
) {
  if (IS_DESIGN_PREVIEW)
    return {
      success: true,
      preview: true,
      bookingNumber: 'DRAFT',
      applicationNumber: 'DRAFT',
      exchangeNumber: 'DRAFT',
    };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Your request could not be sent. Please try again or call the showroom.',
    );
  }
  if (!response.ok || !data.success)
    throw new Error(
      'Your request could not be sent. Please check your details and try again, or call the showroom.',
    );
  return data;
}
