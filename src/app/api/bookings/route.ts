import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('bookings', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('bookings', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { customerId, vehicleId, bookingAmount, paymentMode, notes } = body;

    if (!customerId || !vehicleId || !bookingAmount) {
      return NextResponse.json({ error: 'Customer, vehicle, and booking amount are required' }, { status: 400 });
    }

    const count = await prisma.booking.count();
    const bookingNumber = `BK-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        vehicleId,
        bookingAmount: Number(bookingAmount),
        paymentMode: paymentMode || 'UPI',
        status: 'CONFIRMED',
        notes: notes || null,
        salespersonId: user.id,
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    // Mark vehicle as booked
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { stockStatus: 'BOOKED' },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'BOOKINGS',
      recordId: booking.bookingNumber,
      newValue: `Booked ${booking.vehicle.brand} ${booking.vehicle.model} for ${booking.customer.name} (Adv ₹${booking.bookingAmount})`,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('bookings', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'BOOKINGS',
      recordId: id,
      newValue: `Updated status to ${status}`,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
