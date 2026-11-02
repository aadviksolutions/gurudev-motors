import type { Metadata, Viewport } from 'next';
import './globals.css';
import './showroom.css';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gurudevmotors.com'),
  title: {
    default: 'Gurudev Motors | Two-Wheeler Showroom & Service in Raipur, C.G.',
    template: '%s | Gurudev Motors Raipur',
  },
  description:
    "Raipur's trusted multi-brand two-wheeler dealership. Explore new motorcycles, scooters, electric vehicles, and certified pre-owned bikes with low down payment finance, exchange, and genuine workshop service.",
  keywords: [
    'Gurudev Motors',
    'Gurudev Motors Raipur',
    'Two wheeler showroom Raipur',
    'Honda Activa showroom Raipur',
    'Hero bike showroom Raipur',
    'TVS Jupiter Raipur',
    'Used scooty Raipur',
    'Second hand bike Raipur',
    'Electric scooter Raipur',
    'Bike service centre Raipura',
    'Two wheeler finance Raipur',
    'Bike exchange offer Raipur',
  ],
  authors: [{ name: 'Gurudev Motors', url: 'https://gurudevmotors.com' }],
  creator: 'Gurudev Motors',
  publisher: 'Gurudev Motors',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://gurudevmotors.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gurudevmotors.com',
    siteName: 'Gurudev Motors',
    title: 'Gurudev Motors | Ride Your Dream | Raipur, Chhattisgarh',
    description:
      "Raipur's premier multi-brand destination for new, certified pre-owned, and electric two-wheelers with transparent finance and authorized workshop care.",
    images: [
      {
        url: '/images/logo.jpeg',
        width: 800,
        height: 600,
        alt: 'Gurudev Motors Logo Raipur',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gurudev Motors | Two-Wheeler Showroom Raipur',
    description:
      "Explore new, pre-owned, and electric two-wheelers with instant exchange and EMI options at Mahadevghat Chowk, Raipur.",
    images: ['/images/logo.jpeg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

// Schema.org Structured Data (JSON-LD)
const dealershipSchema = {
  '@context': 'https://schema.org',
  '@type': ['AutoDealer', 'MotorcycleDealer', 'LocalBusiness'],
  '@id': 'https://gurudevmotors.com/#dealership',
  name: 'Gurudev Motors',
  alternateName: 'Gurudev Motors Raipur',
  url: 'https://gurudevmotors.com',
  logo: 'https://gurudevmotors.com/images/logo.jpeg',
  image: 'https://gurudevmotors.com/images/logo.jpeg',
  description:
    "Raipur's premier multi-brand dealership for new motorcycles, scooters, electric mobility, and certified pre-owned vehicles with finance, exchange, and genuine workshop care.",
  telephone: '+91-7000619808',
  email: 'info@gurudevmotors.com',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, UPI, Net Banking, Cheque',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'New Raipura Hospital Ke Samne, Ganesh Mandir Ke Samne Gali, Mahadevghat Chowk, Raipura',
    addressLocality: 'Raipur',
    addressRegion: 'Chhattisgarh',
    postalCode: '492013',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 21.2333,
    longitude: 81.5978,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '17:00',
    },
  ],
  hasMap: 'https://maps.google.com/?q=Gurudev+Motors+Mahadevghat+Chowk+Raipur',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '142',
    bestRating: '5',
    worstRating: '1',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://gurudevmotors.com/#website',
  url: 'https://gurudevmotors.com',
  name: 'Gurudev Motors',
  description: 'Official Dealership and Service Station portal for Gurudev Motors Raipur',
  publisher: {
    '@id': 'https://gurudevmotors.com/#dealership',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://gurudevmotors.com/vehicles?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dealershipSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased text-gm-ink bg-white">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
