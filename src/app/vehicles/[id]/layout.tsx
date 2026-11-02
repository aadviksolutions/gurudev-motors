import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const v = await prisma.vehicle.findUnique({
      where: { id },
      select: {
        brand: true,
        model: true,
        year: true,
        price: true,
        category: true,
        colour: true,
        fuel: true,
        description: true,
        imageUrl: true,
      },
    });

    if (!v) {
      return {
        title: 'Vehicle Details | Gurudev Motors Raipur',
        description: 'Explore two-wheeler specifications, pricing, and finance options at Gurudev Motors Raipur.',
      };
    }

    const title = `${v.year ? `${v.year} ` : ''}${v.brand} ${v.model} in Raipur`;
    const description =
      v.description ||
      `Explore ${v.brand} ${v.model} (${v.category}) at Gurudev Motors Raipur. Get best on-road price, low down payment EMI finance, and instant vehicle exchange bonus.`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://gurudevmotors.com/vehicles/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://gurudevmotors.com/vehicles/${id}`,
        images: v.imageUrl ? [{ url: v.imageUrl, alt: `${v.brand} ${v.model}` }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: v.imageUrl ? [v.imageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: 'Vehicle Details | Gurudev Motors Raipur',
      description: 'Explore two-wheeler specifications and pricing at Gurudev Motors Raipur.',
    };
  }
}

export default function VehicleDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
