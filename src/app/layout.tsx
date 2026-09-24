import type { Metadata, Viewport } from 'next';
import './globals.css';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';

export const metadata: Metadata = {
  title: 'Gurudev Motors | Ride Your Dream | Raipur, Chhattisgarh',
  description:
    "Raipur's premier multi-brand dealership for new motorcycles, scooters, electric mobility, and certified pre-owned vehicles with finance, exchange, and workshop care.",
  keywords: [
    'Gurudev Motors',
    'Raipur two wheeler showroom',
    'Hero showroom Raipur',
    'Honda Activa Raipur',
    'Used bikes Raipur',
    'Kinetic Green EV Raipur',
    'Bike exchange Raipur',
    'Two wheeler service Raipura',
  ],
  authors: [{ name: 'Gurudev Motors' }],
  openGraph: {
    title: 'Gurudev Motors | Ride Your Dream',
    description: "Raipur's multi-brand mobility destination. Explore new, used, and electric two-wheelers.",
    url: 'https://gurudevmotors.com',
    siteName: 'Gurudev Motors',
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#071B49',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gm-ink bg-white">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
