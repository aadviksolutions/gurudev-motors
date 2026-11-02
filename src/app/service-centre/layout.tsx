import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Two-Wheeler Service Online | Gurudev Motors Raipur',
  description:
    'Schedule your motorcycle or scooter service appointment at Gurudev Motors workshop, Raipura Raipur. General maintenance, oil change, electrical check, and genuine parts.',
  keywords: [
    'Book bike service Raipur',
    'Online scooter servicing appointment',
    'Two wheeler workshop Raipura',
    'Gurudev Motors service centre',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/service-centre',
  },
  openGraph: {
    title: 'Book Two-Wheeler Service Online | Gurudev Motors Raipur',
    description: 'Book your service slot online with Gurudev Motors workshop in Raipura, Raipur.',
    url: 'https://gurudevmotors.com/service-centre',
  },
};

export default function ServiceCentreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

