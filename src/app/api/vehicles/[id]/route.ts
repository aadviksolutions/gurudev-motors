import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id, published: true },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Also fetch similar vehicles in the same category
    const similarVehicles = await prisma.vehicle.findMany({
      where: {
        category: vehicle.category,
        id: { not: vehicle.id },
        published: true,
      },
      take: 4,
      orderBy: { featured: 'desc' },
    });

    return NextResponse.json({
      success: true,
      vehicle,
      similarVehicles,
    });
  } catch (error: any) {
    console.error('Fetch vehicle by ID error:', error);
    return NextResponse.json(
      { success: false, message: 'Vehicle details are temporarily unavailable.' },
      { status: 503 }
    );
  }
}
