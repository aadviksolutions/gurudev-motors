import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom & Workshop Gallery | Gurudev Motors Raipur',
  description:
    'Take a photo tour of Gurudev Motors showroom floor, customer deliveries, workshop facility, and two-wheeler lineup in Raipura, Raipur (Chhattisgarh).',
  keywords: [
    'Gurudev Motors photos',
    'Showroom photos Raipur',
    'Bike delivery photos Raipur',
    'Two wheeler workshop photos',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/gallery',
  },
  openGraph: {
    title: 'Showroom & Workshop Gallery | Gurudev Motors Raipur',
    description: 'Explore photos of Gurudev Motors showroom and workshop facilities in Raipur.',
    url: 'https://gurudevmotors.com/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

