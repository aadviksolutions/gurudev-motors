export interface ServiceCatalogItem {
  code: string;
  name: string;
  type: 'SERVICE' | 'PARTS';
  defaultLabour?: number;
  defaultParts?: number;
}

export const PREDEFINED_SERVICES: ServiceCatalogItem[] = [
  { code: 'SRV-01', name: 'General Service', type: 'SERVICE', defaultLabour: 350 },
  { code: 'SRV-02', name: 'Water Washing & Polishing', type: 'SERVICE', defaultLabour: 150 },
  { code: 'SRV-03', name: 'Engine Oil', type: 'PARTS', defaultParts: 380 },
  { code: 'SRV-04', name: 'Air Filter Cleaning / Replacement', type: 'SERVICE', defaultLabour: 50 },
  { code: 'SRV-05', name: 'Chain Cleaning, Lube & Adjustment', type: 'SERVICE', defaultLabour: 120 },
  { code: 'SRV-06', name: 'Brake Cleaning & Adjustment', type: 'SERVICE', defaultLabour: 100 },
  { code: 'SRV-07', name: 'Clutch & Throttle Cable Adjustment', type: 'SERVICE', defaultLabour: 80 },
  { code: 'SRV-08', name: 'Spark Plug Cleaning & Gap Setting', type: 'SERVICE', defaultLabour: 60 },
  { code: 'SRV-09', name: 'Carburetor / Throttle Body Cleaning', type: 'SERVICE', defaultLabour: 200 },
  { code: 'SRV-10', name: 'Battery & Electrical Check-up', type: 'SERVICE', defaultLabour: 80 },
  { code: 'SRV-11', name: 'Nut-Bolt Tightening & Greasing', type: 'SERVICE', defaultLabour: 100 },
  { code: 'SRV-12', name: 'Front Fork Oil & Seal Replacement', type: 'SERVICE', defaultLabour: 350 },
  { code: 'SRV-13', name: 'Clutch Plate Replacement', type: 'SERVICE', defaultLabour: 300 },
  { code: 'SRV-14', name: 'Cone Set (Steering) Greasing / Replacement', type: 'SERVICE', defaultLabour: 250 },
  { code: 'SRV-15', name: 'Wheel Alignment & Bearing Check', type: 'SERVICE', defaultLabour: 150 },
  { code: 'SRV-16', name: 'Labour Charges', type: 'SERVICE', defaultLabour: 200 },
];

/**
 * Filter service catalog items by code, name or keyword
 */
export function filterServiceCatalog(query: string): ServiceCatalogItem[] {
  if (!query || !query.trim()) return PREDEFINED_SERVICES;
  const q = query.trim().toLowerCase();
  return PREDEFINED_SERVICES.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      q.split(' ').every((part) => item.name.toLowerCase().includes(part) || item.code.toLowerCase().includes(part))
  );
}
