import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('service', 'view', user) || await hasPermission('leads', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { mobile: { contains: search } },
        { vehicleModel: { contains: search } },
        { regNumber: { contains: search } },
        { bookingNumber: { contains: search } },
      ];
    }

    const bookings = await prisma.serviceBooking.findMany({
      where,
      include: {
        customer: true,
        advisor: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { preferredDate: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Fetch service bookings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      mobile,
      email,
      vehicleModel,
      registrationNumber,
      serviceType = 'GENERAL_SERVICE',
      preferredDate,
      preferredTime = '10:00 AM',
      additionalRequirement,
    } = body;

    if (!customerName || !mobile || !vehicleModel || !preferredDate) {
      return NextResponse.json(
        { error: 'Customer name, mobile, vehicle model, and preferred date are required' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    // 1. Link or Create Customer
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

    // 2. Generate Service Booking ID
    const count = await prisma.serviceBooking.count();
    const bookingNumber = `GM-SB-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    // 3. Assign Workshop Advisor
    const advisors = await prisma.user.findMany({
      where: {
        active: true,
        role: { code: { in: ['SERVICE_EXECUTIVE', 'SERVICE_MANAGER', 'MAIN_ADMIN', 'SUPER_ADMIN'] } },
      },
    });
    const assignedAdvisor = advisors.length > 0 ? advisors[count % advisors.length] : null;

    // 4. Create Service Booking Record
    const booking = await prisma.serviceBooking.create({
      data: {
        bookingNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        regNumber: registrationNumber ? registrationNumber.trim().toUpperCase() : null,
        serviceType: serviceType || 'GENERAL_SERVICE',
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || 'Morning Slot (10 AM - 1 PM)',
        additionalRequirement: additionalRequirement?.trim() || null,
        status: 'NEW',
        customerId: customer.id,
        advisorId: assignedAdvisor?.id || null,
        notes: `Booked via website for ${preferredTime}`,
      },
    });

    // 5. Ingest into Central CRM Leads
    const leadCount = await prisma.lead.count();
    const leadNumber = `LD-${new Date().getFullYear()}-${String(leadCount + 101).padStart(3, '0')}`;
    const sNotes = `Service Appointment (${bookingNumber}): ${serviceType} for ${vehicleModel} (${registrationNumber || 'No Plate'}). Slot: ${preferredDate} at ${preferredTime}. ${additionalRequirement || ''}`;

    await prisma.lead.create({
      data: {
        leadNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        budget: serviceType,
        source: 'SERVICE_BOOKING',
        status: 'NEW',
        priority: 'MEDIUM',
        notes: sNotes,
        customerId: customer.id,
        assignedToId: assignedAdvisor?.id || null,
        followUpDate: new Date(preferredDate),
      },
    });

    // 6. Create Staff Notification
    await prisma.notification.create({
      data: {
        title: `Service Booking: ${bookingNumber}`,
        message: `${customerName} booked ${serviceType} for ${vehicleModel} on ${new Date(preferredDate).toLocaleDateString()}. Mobile: ${cleanMobile}`,
        type: 'SERVICE',
        link: '/admin/service',
        userId: assignedAdvisor?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      bookingNumber,
      message: `Service appointment ${bookingNumber} booked successfully! Our workshop manager will confirm your slot.`,
    });
  } catch (error: any) {
    console.error('Create service booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('service', 'edit', user) || await hasPermission('leads', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const {
      id,
      status,
      advisorId,
      preferredDate,
      preferredTime,
      notes,
    } = body;

    if (!id) return NextResponse.json({ error: 'Service Booking ID is required' }, { status: 400 });

    const existing = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (advisorId !== undefined) updateData.advisorId = advisorId || null;
    if (preferredDate !== undefined) updateData.preferredDate = new Date(preferredDate);
    if (preferredTime !== undefined) updateData.preferredTime = preferredTime;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.serviceBooking.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        advisor: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'SERVICE',
      recordId: existing.bookingNumber,
      oldValue: `Status: ${existing.status}, Advisor: ${existing.advisorId}`,
      newValue: `Status: ${updated.status}, Advisor: ${updated.advisorId}`,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Update service booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission('service', 'delete', user) || await hasPermission('leads', 'delete', user);
    if (!canDelete) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Service Booking ID is required' }, { status: 400 });

    const existing = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Service booking not found' }, { status: 404 });

    await prisma.serviceBooking.delete({ where: { id } });

    await logAudit({
      user,
      action: 'DELETE',
      module: 'SERVICE',
      recordId: existing.bookingNumber,
      oldValue: `${existing.customerName} - ${existing.vehicleModel}`,
      newValue: 'Deleted service booking record',
    });

    return NextResponse.json({ success: true, message: 'Service booking deleted' });
  } catch (error: any) {
    console.error('Delete service booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
