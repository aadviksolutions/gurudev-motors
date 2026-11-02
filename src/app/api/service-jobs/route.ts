import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('service', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const advisorId = searchParams.get('advisorId');
    const vehicleReg = searchParams.get('reg');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (vehicleReg) where.vehicleRegNumber = { contains: vehicleReg, mode: 'insensitive' };

    // Strict role scoping: Service Executive only sees their assigned job cards
    if (scope.isServiceExecutive) {
      where.advisorId = user.id;
    } else if (advisorId && advisorId !== 'ALL') {
      where.advisorId = advisorId;
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
        { jobCardNumber: { contains: search, mode: 'insensitive' } },
        { vehicleRegNumber: { contains: search, mode: 'insensitive' } },
        { vehicleModel: { contains: search, mode: 'insensitive' } },
        { frameNumber: { contains: search, mode: 'insensitive' } },
        { engineNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
      ];
    }

    const jobCards = await prisma.serviceJobCard.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        advisor: { select: { id: true, name: true, phone: true } },
        parts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, jobCards, count: jobCards.length });
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

    const scope = getRoleScope(user);
    const body = await req.json();

    const {
      customerName,
      customerMobile,
      customerAddress,
      customerEmail,
      vehicleRegNumber,
      vehicleModel,
      vehicleTypeKickSelf = 'Self',
      frameNumber,
      engineNumber,
      colour,
      dateOfSale,
      kmReading = 0,
      keyNumber,
      freeCouponNumber,
      sellingDealer,
      serviceTypes = [],
      serviceTypeNumbers = {},
      physicalCondition,
      repairRequests = [],
      workItems = [],
      supervisorName,
      serviceAdvisorName,
      technicianName,
      expectedDeliveryTime,
      deliveryDate,
      paymentDetails = 'Cash',
      invoiceNumber,
      gatePassNumber,
      testRideOpening = false,
      testRideOpeningSign,
      testRideSupervisor = false,
      testRideSupervisorSign,
      customerSignature,
      branchName = 'Raipura Main Branch',
      complaints,
      inspectionNotes,
      status = 'RECEIVED',
      advisorId,
      customJobCardNumber,
      vehicleId,
    } = body;

    if (!customerName || !customerMobile || !vehicleRegNumber || !vehicleModel) {
      return NextResponse.json(
        { error: 'Customer name, mobile number, vehicle registration number, and vehicle model are required.' },
        { status: 400 }
      );
    }

    const cleanMobile = customerMobile.replace(/[^0-9]/g, '');

    // Prevent duplicate active job card for the same vehicle
    const activeExisting = await prisma.serviceJobCard.findFirst({
      where: {
        vehicleRegNumber: vehicleRegNumber.toUpperCase().trim(),
        status: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
    });

    if (activeExisting) {
      return NextResponse.json(
        {
          error: `Vehicle ${vehicleRegNumber.toUpperCase()} already has an active Job Card (${activeExisting.jobCardNumber}) in status "${activeExisting.status}".`,
        },
        { status: 409 }
      );
    }

    // Lookup or create customer
    let customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
    if (!customer) {
      const custCount = await prisma.customer.count();
      const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(3, '0')}`;
      customer = await prisma.customer.create({
        data: {
          customerNo,
          name: customerName.trim(),
          mobile: cleanMobile,
          email: customerEmail?.trim() || null,
          address: customerAddress?.trim() || null,
        },
      });
    } else if (customerAddress || customerEmail) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName.trim(),
          address: customerAddress?.trim() || customer.address,
          email: customerEmail?.trim() || customer.email,
        },
      });
    }

    // Unique Job Card Number generation (sequential 4-digit matching physical pad)
    let jobCardNumber = '';
    if (customJobCardNumber && customJobCardNumber.trim()) {
      const trimmed = customJobCardNumber.trim().toUpperCase();
      const exists = await prisma.serviceJobCard.findUnique({ where: { jobCardNumber: trimmed } });
      if (!exists) {
        jobCardNumber = trimmed;
      }
    }

    if (!jobCardNumber) {
      const count = await prisma.serviceJobCard.count();
      const seq = 816 + count;
      jobCardNumber = String(seq).padStart(4, '0');

      // Check collision
      const checkColl = await prisma.serviceJobCard.findUnique({ where: { jobCardNumber } });
      if (checkColl) {
        jobCardNumber = `JC-${Date.now().toString().slice(-4)}`;
      }
    }

    // Calculate estimates from workItems or body
    let computedLabour = 0;
    let computedParts = 0;
    if (Array.isArray(workItems) && workItems.length > 0) {
      for (const item of workItems) {
        computedLabour += Number(item.labourCharges || 0);
        computedParts += Number(item.partsCharges || 0) * (Number(item.quantity || 1));
      }
    } else {
      computedLabour = Number(body.labourTotal || 0);
      computedParts = Number(body.partsTotal || 0);
    }

    const discountAmount = Number(body.discount || 0);
    const subTotal = Math.max(0, computedLabour + computedParts - discountAmount);
    const taxAmount = Math.round(subTotal * 0.18);
    const finalTotal = subTotal + taxAmount;
    const estimateAmount = Number(body.estimateAmount) || finalTotal;

    // Assigned advisor
    let assignedAdvisorId = user.id;
    if ((scope.isGlobalAdmin || scope.isServiceManager) && advisorId) {
      assignedAdvisorId = advisorId;
    }

    const initialHistory = [
      {
        status: status || 'CREATED',
        user: user.name,
        role: user.roleName,
        timestamp: new Date().toISOString(),
        note: 'Job Card created',
      },
    ];

    const jobCard = await prisma.serviceJobCard.create({
      data: {
        jobCardNumber,
        customerId: customer.id,
        vehicleId: vehicleId || null,
        vehicleRegNumber: vehicleRegNumber.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleTypeKickSelf,
        frameNumber: frameNumber?.trim() || null,
        engineNumber: engineNumber?.trim() || null,
        colour: colour?.trim() || null,
        dateOfSale: dateOfSale ? new Date(dateOfSale) : null,
        kmReading: Number(kmReading) || 0,
        keyNumber: keyNumber?.trim() || null,
        freeCouponNumber: freeCouponNumber?.trim() || null,
        sellingDealer: sellingDealer?.trim() || null,
        serviceTypes: Array.isArray(serviceTypes) ? JSON.stringify(serviceTypes) : (serviceTypes || '[]'),
        serviceTypeNumbers: typeof serviceTypeNumbers === 'object' ? JSON.stringify(serviceTypeNumbers) : (serviceTypeNumbers || '{}'),
        physicalCondition: physicalCondition?.trim() || null,
        repairRequests: typeof repairRequests === 'object' ? JSON.stringify(repairRequests) : (repairRequests || '[]'),
        workItems: typeof workItems === 'object' ? JSON.stringify(workItems) : (workItems || '[]'),
        supervisorName: supervisorName?.trim() || null,
        serviceAdvisorName: serviceAdvisorName?.trim() || user.name,
        technicianName: technicianName?.trim() || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        expectedDeliveryTime: expectedDeliveryTime?.trim() || null,
        branchName: branchName || 'Raipura Main Branch',
        complaints: complaints || null,
        inspectionNotes: inspectionNotes || null,
        estimateAmount,
        partsTotal: computedParts,
        labourTotal: computedLabour,
        discount: discountAmount,
        tax: taxAmount,
        finalTotal,
        status: status || 'RECEIVED',
        advisorId: assignedAdvisorId,
        paymentDetails: paymentDetails || 'Cash',
        invoiceNumber: invoiceNumber?.trim() || null,
        gatePassNumber: gatePassNumber?.trim() || `GP-${jobCardNumber}`,
        testRideOpening: Boolean(testRideOpening),
        testRideOpeningSign: testRideOpeningSign?.trim() || null,
        testRideSupervisor: Boolean(testRideSupervisor),
        testRideSupervisorSign: testRideSupervisorSign?.trim() || null,
        customerSignature: customerSignature?.trim() || null,
        statusHistory: JSON.stringify(initialHistory),
      },
      include: {
        customer: true,
        advisor: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'SERVICE',
      recordId: jobCard.jobCardNumber,
      newValue: `Created Job Card #${jobCard.jobCardNumber} for ${jobCard.vehicleModel} (${jobCard.vehicleRegNumber}), Est: ₹${jobCard.finalTotal}`,
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

    const scope = getRoleScope(user);
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Job Card ID is required' }, { status: 400 });

    const existing = await prisma.serviceJobCard.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!existing) return NextResponse.json({ error: 'Job Card not found' }, { status: 404 });

    // Service Executive can only update job cards assigned to them
    if (scope.isServiceExecutive && existing.advisorId !== user.id) {
      return NextResponse.json({ error: 'Permission denied: Job Card is not assigned to you' }, { status: 403 });
    }

    const updatePayload: any = {};
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.technicianName !== undefined) updatePayload.technicianName = data.technicianName;
    if (data.supervisorName !== undefined) updatePayload.supervisorName = data.supervisorName;
    if (data.serviceAdvisorName !== undefined) updatePayload.serviceAdvisorName = data.serviceAdvisorName;
    if (data.inspectionNotes !== undefined) updatePayload.inspectionNotes = data.inspectionNotes;
    if (data.complaints !== undefined) updatePayload.complaints = data.complaints;
    if (data.kmReading !== undefined) updatePayload.kmReading = Number(data.kmReading);
    if (data.deliveryDate !== undefined) updatePayload.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
    if (data.expectedDeliveryTime !== undefined) updatePayload.expectedDeliveryTime = data.expectedDeliveryTime;
    if (data.physicalCondition !== undefined) updatePayload.physicalCondition = data.physicalCondition;
    if (data.serviceTypes !== undefined) {
      updatePayload.serviceTypes = Array.isArray(data.serviceTypes) ? JSON.stringify(data.serviceTypes) : data.serviceTypes;
    }
    if (data.repairRequests !== undefined) {
      updatePayload.repairRequests = typeof data.repairRequests === 'object' ? JSON.stringify(data.repairRequests) : data.repairRequests;
    }
    if (data.workItems !== undefined) {
      updatePayload.workItems = typeof data.workItems === 'object' ? JSON.stringify(data.workItems) : data.workItems;
    }
    if (data.paymentDetails !== undefined) updatePayload.paymentDetails = data.paymentDetails;
    if (data.invoiceNumber !== undefined) updatePayload.invoiceNumber = data.invoiceNumber;
    if (data.gatePassNumber !== undefined) updatePayload.gatePassNumber = data.gatePassNumber;
    if (data.testRideOpening !== undefined) updatePayload.testRideOpening = Boolean(data.testRideOpening);
    if (data.testRideOpeningSign !== undefined) updatePayload.testRideOpeningSign = data.testRideOpeningSign;
    if (data.testRideSupervisor !== undefined) updatePayload.testRideSupervisor = Boolean(data.testRideSupervisor);
    if (data.testRideSupervisorSign !== undefined) updatePayload.testRideSupervisorSign = data.testRideSupervisorSign;

    // Reassign advisor by manager/admin
    if (data.advisorId !== undefined && (scope.isGlobalAdmin || scope.isServiceManager)) {
      updatePayload.advisorId = data.advisorId || null;
    }

    // Recalculate totals if provided
    if (data.workItems && Array.isArray(data.workItems)) {
      let lTot = 0;
      let pTot = 0;
      for (const item of data.workItems) {
        lTot += Number(item.labourCharges || 0);
        pTot += Number(item.partsCharges || 0) * (Number(item.quantity || 1));
      }
      const disc = data.discount !== undefined ? Number(data.discount) : existing.discount;
      const subTotal = Math.max(0, lTot + pTot - disc);
      const tax = Math.round(subTotal * 0.18);
      const finalTot = subTotal + tax;

      updatePayload.labourTotal = lTot;
      updatePayload.partsTotal = pTot;
      updatePayload.discount = disc;
      updatePayload.tax = tax;
      updatePayload.finalTotal = finalTot;
      updatePayload.estimateAmount = finalTot;
    } else if (data.partsTotal !== undefined || data.labourTotal !== undefined || data.discount !== undefined) {
      const pTot = data.partsTotal !== undefined ? Number(data.partsTotal) : existing.partsTotal;
      const lTot = data.labourTotal !== undefined ? Number(data.labourTotal) : existing.labourTotal;
      const disc = data.discount !== undefined ? Number(data.discount) : existing.discount;
      const subTotal = Math.max(0, pTot + lTot - disc);
      const tax = Math.round(subTotal * 0.18);
      const finalTot = subTotal + tax;

      updatePayload.partsTotal = pTot;
      updatePayload.labourTotal = lTot;
      updatePayload.discount = disc;
      updatePayload.tax = tax;
      updatePayload.finalTotal = finalTot;
      updatePayload.estimateAmount = finalTot;
    }

    // Append to status history
    let history: any[] = [];
    try {
      history = existing.statusHistory ? JSON.parse(existing.statusHistory) : [];
    } catch {
      history = [];
    }
    if (data.status && data.status !== existing.status) {
      history.push({
        status: data.status,
        user: user.name,
        role: user.roleName,
        timestamp: new Date().toISOString(),
        note: data.statusNote || `Status changed from ${existing.status} to ${data.status}`,
      });
      updatePayload.statusHistory = JSON.stringify(history);
    }

    const updated = await prisma.serviceJobCard.update({
      where: { id },
      data: updatePayload,
      include: {
        customer: true,
        advisor: { select: { id: true, name: true, phone: true } },
      },
    });

    if (data.status === 'READY' && existing.status !== 'READY') {
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
      oldValue: `Status: ${existing.status}, Total: ₹${existing.finalTotal}`,
      newValue: `Status: ${updated.status}, Total: ₹${updated.finalTotal}`,
    });

    return NextResponse.json({ success: true, jobCard: updated });
  } catch (error: any) {
    console.error('Update job card error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
