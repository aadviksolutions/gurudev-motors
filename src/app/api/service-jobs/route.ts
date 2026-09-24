import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('service', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const vehicleReg = searchParams.get('reg');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (vehicleReg) where.vehicleRegNumber = { contains: vehicleReg };

    const jobCards = await prisma.serviceJobCard.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        advisor: { select: { id: true, name: true } },
        parts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, jobCards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('service', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const {
      customerName,
      customerMobile,
      vehicleRegNumber,
      vehicleModel,
      vehicleId,
      kmReading = 0,
      complaints,
      inspectionNotes,
      estimateAmount = 0,
      partsTotal = 0,
      labourTotal = 0,
      discount = 0,
      status = 'RECEIVED',
      technicianName,
      parts = [],
    } = body;

    if (!customerName || !customerMobile || !vehicleRegNumber || !vehicleModel) {
      return NextResponse.json({ error: 'Customer name, mobile, registration and vehicle model are required' }, { status: 400 });
    }

    const cleanMobile = customerMobile.replace(/[^0-9]/g, '');

    let customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
    if (!customer) {
      const custCount = await prisma.customer.count();
      const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(3, '0')}`;
      customer = await prisma.customer.create({
        data: {
          customerNo,
          name: customerName.trim(),
          mobile: cleanMobile,
        },
      });
    }

    const jcCount = await prisma.serviceJobCard.count();
    const jobCardNumber = `JC-${new Date().getFullYear()}-${String(jcCount + 314).padStart(4, '0')}`;

    const subTotal = Number(partsTotal) + Number(labourTotal) - Number(discount);
    const tax = Math.round(subTotal * 0.18);
    const finalTotal = subTotal + tax;

    const jobCard = await prisma.serviceJobCard.create({
      data: {
        jobCardNumber,
        customerId: customer.id,
        vehicleId: vehicleId || null,
        vehicleRegNumber: vehicleRegNumber.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        kmReading: Number(kmReading),
        complaints: complaints || null,
        inspectionNotes: inspectionNotes || null,
        estimateAmount: Number(estimateAmount),
        partsTotal: Number(partsTotal),
        labourTotal: Number(labourTotal),
        discount: Number(discount),
        tax,
        finalTotal,
        status,
        advisorId: user.id,
        technicianName: technicianName || null,
        parts: {
          create: parts.map((p: any) => ({
            partName: p.partName,
            partNumber: p.partNumber || null,
            quantity: Number(p.quantity) || 1,
            unitPrice: Number(p.unitPrice) || 0,
            totalPrice: (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0),
          })),
        },
      },
      include: {
        customer: true,
        parts: true,
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'SERVICE',
      recordId: jobCard.jobCardNumber,
      newValue: `Created Job Card for ${jobCard.vehicleModel} (${jobCard.vehicleRegNumber})`,
    });

    return NextResponse.json({ success: true, jobCard });
  } catch (error: any) {
    console.error('Create job card error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('service', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, status, technicianName, inspectionNotes, partsTotal, labourTotal, discount, deliveryDate } = body;

    if (!id) return NextResponse.json({ error: 'Job Card ID is required' }, { status: 400 });

    const existing = await prisma.serviceJobCard.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });

    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (technicianName !== undefined) updatePayload.technicianName = technicianName;
    if (inspectionNotes !== undefined) updatePayload.inspectionNotes = inspectionNotes;
    if (deliveryDate !== undefined) updatePayload.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;

    if (partsTotal !== undefined || labourTotal !== undefined || discount !== undefined) {
      const pTot = partsTotal !== undefined ? Number(partsTotal) : existing.partsTotal;
      const lTot = labourTotal !== undefined ? Number(labourTotal) : existing.labourTotal;
      const disc = discount !== undefined ? Number(discount) : existing.discount;
      const subTotal = pTot + lTot - disc;
      const tax = Math.round(subTotal * 0.18);
      const finalTotal = subTotal + tax;

      updatePayload.partsTotal = pTot;
      updatePayload.labourTotal = lTot;
      updatePayload.discount = disc;
      updatePayload.tax = tax;
      updatePayload.finalTotal = finalTotal;
    }

    const updated = await prisma.serviceJobCard.update({
      where: { id },
      data: updatePayload,
      include: { customer: true, parts: true },
    });

    // If status became READY, notify workshop manager
    if (status === 'READY' && existing.status !== 'READY') {
      await prisma.notification.create({
        data: {
          title: `Vehicle Ready: ${updated.vehicleRegNumber}`,
          message: `${updated.vehicleModel} is ready for delivery. Total: ₹${updated.finalTotal}`,
          type: 'SERVICE',
          link: '/admin/service',
        },
      });
    }

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'SERVICE',
      recordId: existing.jobCardNumber,
      oldValue: `Status: ${existing.status}`,
      newValue: `Status: ${updated.status}`,
    });

    return NextResponse.json({ success: true, jobCard: updated });
  } catch (error: any) {
    console.error('Update job card error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
