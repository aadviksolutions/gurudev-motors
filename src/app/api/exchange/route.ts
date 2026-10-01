import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('exchange', 'view', user) || await hasPermission('leads', 'view', user);
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
        { currentModel: { contains: search } },
        { upgradingVehicle: { contains: search } },
        { exchangeNumber: { contains: search } },
      ];
    }

    const requests = await prisma.exchangeRequest.findMany({
      where,
      include: {
        customer: true,
        assignedStaff: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch exchange requests error:', error);
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
      currentBrand,
      currentModel,
      registrationYear,
      kmDriven,
      condition = 'GOOD',
      existingVehicleDetails,
      vehiclePhotos,
      upgradingVehicle,
      message,
      estimatedValuation,
    } = body;

    if (!customerName || !mobile || !currentBrand || !currentModel || !upgradingVehicle) {
      return NextResponse.json(
        { error: 'Customer name, mobile, old brand, old model, and upgrading vehicle are required' },
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

    // 2. Generate Exchange ID
    const count = await prisma.exchangeRequest.count();
    const exchangeNumber = `GM-EX-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    // 3. Assign Sales Staff round-robin
    const salesExecs = await prisma.user.findMany({
      where: {
        active: true,
        role: { code: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'MAIN_ADMIN', 'SUPER_ADMIN'] } },
      },
    });
    const assignedUser = salesExecs.length > 0 ? salesExecs[count % salesExecs.length] : null;

    // 4. Create Exchange Record
    const exchange = await prisma.exchangeRequest.create({
      data: {
        exchangeNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        currentBrand: currentBrand.trim(),
        currentModel: currentModel.trim(),
        registrationYear: String(registrationYear || new Date().getFullYear() - 3),
        kmDriven: String(kmDriven || '0'),
        condition: condition || 'GOOD',
        existingVehicleDetails: existingVehicleDetails || null,
        vehiclePhotos: vehiclePhotos || null,
        upgradingVehicle: upgradingVehicle.trim(),
        message: message?.trim() || null,
        estimatedValuation: estimatedValuation ? Number(estimatedValuation) : null,
        status: 'NEW',
        customerId: customer.id,
        assignedStaffId: assignedUser?.id || null,
        followUpDate: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // 5. Ingest into Central CRM Leads
    const leadCount = await prisma.lead.count();
    const leadNumber = `LD-${new Date().getFullYear()}-${String(leadCount + 101).padStart(3, '0')}`;
    const exchangeNotes = `Exchange Request (${exchangeNumber}): Old ${registrationYear || ''} ${currentBrand} ${currentModel} (${kmDriven || '0'} km, ${condition} condition). Upgrading to: ${upgradingVehicle}. Est Valuation: ₹${estimatedValuation || 'N/A'}`;

    await prisma.lead.create({
      data: {
        leadNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: upgradingVehicle.trim(),
        budget: `Exchange Old ${currentBrand} ${currentModel}`,
        source: 'EXCHANGE_ENQUIRY',
        status: 'NEW',
        priority: 'HIGH',
        notes: exchangeNotes,
        customerId: customer.id,
        assignedToId: assignedUser?.id || null,
        followUpDate: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // 6. Create Staff Notification
    await prisma.notification.create({
      data: {
        title: `New Exchange Request: ${exchangeNumber}`,
        message: `${customerName} wants to exchange ${currentBrand} ${currentModel} for ${upgradingVehicle}. Mobile: ${cleanMobile}`,
        type: 'EXCHANGE',
        link: '/admin/exchange',
        userId: assignedUser?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      exchange,
      exchangeNumber,
      message: `Exchange request ${exchangeNumber} created successfully! Our evaluation team will contact you.`,
    });
  } catch (error: any) {
    console.error('Create exchange request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('exchange', 'edit', user) || await hasPermission('leads', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const {
      id,
      status,
      estimatedValuation,
      finalValuation,
      notes,
      inspectionDate,
      assignedStaffId,
      followUpDate,
    } = body;

    if (!id) return NextResponse.json({ error: 'Exchange Request ID is required' }, { status: 400 });

    const existing = await prisma.exchangeRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Exchange request not found' }, { status: 404 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (estimatedValuation !== undefined) updateData.estimatedValuation = estimatedValuation ? Number(estimatedValuation) : null;
    if (finalValuation !== undefined) updateData.finalValuation = finalValuation ? Number(finalValuation) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (inspectionDate !== undefined) updateData.inspectionDate = inspectionDate ? new Date(inspectionDate) : null;
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId || null;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;

    const updated = await prisma.exchangeRequest.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        assignedStaff: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'EXCHANGE',
      recordId: existing.exchangeNumber,
      oldValue: `Status: ${existing.status}, Valuation: ${existing.finalValuation}`,
      newValue: `Status: ${updated.status}, Valuation: ${updated.finalValuation}`,
    });

    return NextResponse.json({ success: true, exchange: updated });
  } catch (error: any) {
    console.error('Update exchange request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission('exchange', 'delete', user) || await hasPermission('leads', 'delete', user);
    if (!canDelete) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Exchange Request ID is required' }, { status: 400 });

    const existing = await prisma.exchangeRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Exchange request not found' }, { status: 404 });

    await prisma.exchangeRequest.delete({ where: { id } });

    await logAudit({
      user,
      action: 'DELETE',
      module: 'EXCHANGE',
      recordId: existing.exchangeNumber,
      oldValue: `${existing.customerName} - ${existing.currentBrand} ${existing.currentModel}`,
      newValue: 'Deleted exchange request record',
    });

    return NextResponse.json({ success: true, message: 'Exchange request deleted' });
  } catch (error: any) {
    console.error('Delete exchange request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
