import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('bookings', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const salespersonId = searchParams.get('salespersonId');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    // Role scoping: Sales Executive only sees bookings where they are the salesperson
    if (scope.isSalesExecutive) {
      where.salespersonId = user.id;
    } else if (salespersonId && salespersonId !== 'ALL') {
      where.salespersonId = salespersonId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
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

    const scope = getRoleScope(user);
    const body = await req.json();
    const { customerId, vehicleId, bookingAmount, paymentMode, notes, salespersonId } = body;

    if (!customerId || !vehicleId || !bookingAmount) {
      return NextResponse.json({ error: 'Customer, vehicle, and booking amount are required' }, { status: 400 });
    }

    const count = await prisma.booking.count();
    const bookingNumber = `BK-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    // Sales Executive is auto-assigned; Manager/Admin can choose salesperson
    let assignedSalesperson = user.id;
    if ((scope.isGlobalAdmin || scope.isSalesManager) && salespersonId) {
      assignedSalesperson = salespersonId;
    }

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        vehicleId,
        bookingAmount: Number(bookingAmount),
        paymentMode: paymentMode || 'UPI',
        status: 'CONFIRMED',
        notes: notes || null,
        salespersonId: assignedSalesperson,
      },
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
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

    const scope = getRoleScope(user);
    const body = await req.json();
    const { id, status, notes, salespersonId } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (scope.isSalesExecutive && existing.salespersonId !== user.id) {
      return NextResponse.json({ error: 'Permission denied: Booking not assigned to you' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (salespersonId && (scope.isGlobalAdmin || scope.isSalesManager)) {
      updateData.salespersonId = salespersonId;
    }

    // If cancelled, restore vehicle to IN_STOCK
    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { stockStatus: 'IN_STOCK' },
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'BOOKINGS',
      recordId: existing.bookingNumber || id,
      oldValue: `Status: ${existing.status}`,
      newValue: `Status: ${updated.status}`,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
