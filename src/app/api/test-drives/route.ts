import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('test_drives', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const testDrives = await prisma.testDrive.findMany({
      include: {
        vehicle: true,
        assignedTo: { select: { id: true, name: true, phone: true } },
        customer: true,
      },
      orderBy: { preferredDate: 'desc' },
    });

    return NextResponse.json({ success: true, testDrives });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, mobile, email, vehicleId, preferredDate, preferredTime, notes } = body;

    if (!customerName || !mobile || !vehicleId || !preferredDate) {
      return NextResponse.json({ error: 'Customer name, mobile, vehicle and date are required' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    let customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
    if (!customer) {
      const custCount = await prisma.customer.count();
      const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(3, '0')}`;
      customer = await prisma.customer.create({
        data: {
          customerNo,
          name: customerName.trim(),
          mobile: cleanMobile,
          email: email?.trim() || null,
        },
      });
    }

    // Find salesperson
    const salesUser = await prisma.user.findFirst({
      where: { active: true, role: { code: 'SALES_EXECUTIVE' } },
    });

    const testDrive = await prisma.testDrive.create({
      data: {
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleId,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || 'Morning (10 AM - 1 PM)',
        status: 'REQUESTED',
        notes: notes?.trim() || null,
        customerId: customer.id,
        assignedToId: salesUser?.id || null,
      },
      include: {
        vehicle: true,
      },
    });

    // Notify staff
    await prisma.notification.create({
      data: {
        title: `Test Drive Request: ${testDrive.vehicle.brand} ${testDrive.vehicle.model}`,
        message: `${customerName} requested a test drive on ${new Date(preferredDate).toLocaleDateString()}`,
        type: 'TEST_DRIVE',
        link: '/admin/bookings',
      },
    });

    return NextResponse.json({
      success: true,
      testDrive,
      message: 'Test drive scheduled! Our executive will call to confirm slot and location.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('test_drives', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, status, assignedToId, notes } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updated = await prisma.testDrive.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { vehicle: true },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'TEST_DRIVES',
      recordId: id,
      newValue: `Status changed to ${status}`,
    });

    return NextResponse.json({ success: true, testDrive: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
