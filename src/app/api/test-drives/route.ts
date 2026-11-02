import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('test_drives', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    // Role scoping: Sales Executive only sees test drives assigned to them
    if (scope.isSalesExecutive) {
      where.assignedToId = user.id;
    } else if (assignedToId && assignedToId !== 'ALL') {
      where.assignedToId = assignedToId;
    }

    if (fromDate || toDate) {
      where.preferredDate = {};
      if (fromDate) where.preferredDate.gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.preferredDate.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const testDrives = await prisma.testDrive.findMany({
      where,
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
    const user = await getSessionUser();
    const body = await req.json();
    const { customerName, mobile, email, vehicleId, preferredDate, preferredTime, notes, assignedToId } = body;

    if (!customerName || !mobile || !vehicleId || !preferredDate) {
      return NextResponse.json({ error: 'Customer name, mobile, vehicle and date are required' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

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

    let assignedStaffId = assignedToId || null;
    if (!assignedStaffId && user) {
      const scope = getRoleScope(user);
      if (scope.isSalesExecutive) assignedStaffId = user.id;
    }

    if (!assignedStaffId) {
      const salesUser = await prisma.user.findFirst({
        where: { active: true, role: { code: 'SALES_EXECUTIVE' } },
      });
      assignedStaffId = salesUser?.id || null;
    }

    const tdCount = await prisma.testDrive.count();
    const requestNumber = `TD-${new Date().getFullYear()}-${String(tdCount + 101).padStart(3, '0')}`;

    const testDrive = await prisma.testDrive.create({
      data: {
        requestNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleId,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || 'Morning (10 AM - 1 PM)',
        status: 'REQUESTED',
        notes: notes?.trim() || null,
        customerId: customer.id,
        assignedToId: assignedStaffId,
      },
      include: {
        vehicle: true,
        assignedTo: { select: { id: true, name: true, phone: true } },
      },
    });

    if (assignedStaffId) {
      await prisma.notification.create({
        data: {
          title: `Test Drive: ${testDrive.vehicle.brand} ${testDrive.vehicle.model}`,
          message: `${customerName} scheduled a test drive on ${new Date(preferredDate).toLocaleDateString()}`,
          type: 'TEST_DRIVE',
          link: '/admin/bookings',
          userId: assignedStaffId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      testDrive,
      message: 'Test drive scheduled! Our executive will call to confirm slot and location.',
    });
  } catch (error: any) {
    console.error('Create test drive error:', error);
    return NextResponse.json({ success: false, message: 'Unable to submit your test drive request right now.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('test_drives', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const body = await req.json();
    const { id, status, assignedToId, notes, preferredDate, preferredTime } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const existing = await prisma.testDrive.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Test drive not found' }, { status: 404 });

    if (scope.isSalesExecutive && existing.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Permission denied: Test drive is not assigned to you' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (preferredDate !== undefined) updateData.preferredDate = new Date(preferredDate);
    if (preferredTime !== undefined) updateData.preferredTime = preferredTime;

    if (assignedToId !== undefined && (scope.isGlobalAdmin || scope.isSalesManager)) {
      updateData.assignedToId = assignedToId || null;
    }

    const updated = await prisma.testDrive.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: true,
        assignedTo: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'TEST_DRIVES',
      recordId: existing.requestNumber || id,
      newValue: `Status changed to ${status}`,
    });

    return NextResponse.json({ success: true, testDrive: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
