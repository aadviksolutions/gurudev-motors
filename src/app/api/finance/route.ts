import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('finance', 'view', user) || await hasPermission('leads', 'view', user);
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
        { applicationNumber: { contains: search } },
      ];
    }

    const applications = await prisma.financeApplication.findMany({
      where,
      include: {
        customer: true,
        assignedStaff: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Fetch finance applications error:', error);
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
      loanAmount,
      employmentType = 'Salaried',
      monthlyIncome,
      preferredTenure = 24,
      downPayment = 0,
      message,
    } = body;

    if (!customerName || !mobile || !vehicleModel || !loanAmount) {
      return NextResponse.json(
        { error: 'Customer name, mobile, vehicle model and loan amount are required' },
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

    // 2. Generate Finance Application ID
    const count = await prisma.financeApplication.count();
    const applicationNumber = `GM-FN-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    // 3. Assign Sales/Finance Staff
    const staffMembers = await prisma.user.findMany({
      where: {
        active: true,
        role: { code: { in: ['ACCOUNTS', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'MAIN_ADMIN', 'SUPER_ADMIN'] } },
      },
    });
    const assignedStaff = staffMembers.length > 0 ? staffMembers[count % staffMembers.length] : null;

    // Calculate approximate standard EMI (e.g. 9.5% p.a.)
    const principal = Number(loanAmount);
    const tenure = Number(preferredTenure) || 24;
    const r = 9.5 / 12 / 100;
    const estEmi = Math.round((principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));

    // 4. Create Finance Record
    const application = await prisma.financeApplication.create({
      data: {
        applicationNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        loanAmount: principal,
        employmentType: employmentType || 'Salaried',
        monthlyIncome: monthlyIncome ? String(monthlyIncome) : null,
        preferredTenure: tenure,
        downPayment: Number(downPayment) || 0,
        message: message?.trim() || null,
        status: 'NEW',
        interestRate: 9.5,
        emi: estEmi,
        customerId: customer.id,
        assignedStaffId: assignedStaff?.id || null,
      },
    });

    // 5. Ingest into Central CRM Leads
    const leadCount = await prisma.lead.count();
    const leadNumber = `LD-${new Date().getFullYear()}-${String(leadCount + 101).padStart(3, '0')}`;
    const finNotes = `Finance Enquiry (${applicationNumber}): Loan ₹${principal.toLocaleString('en-IN')}, Tenure ${tenure} mos, Down pmt ₹${downPayment || 0}, Employment: ${employmentType}. ${message || ''}`;

    await prisma.lead.create({
      data: {
        leadNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        budget: `Loan ₹${principal.toLocaleString('en-IN')}`,
        source: 'FINANCE_ENQUIRY',
        status: 'NEW',
        priority: 'HIGH',
        notes: finNotes,
        customerId: customer.id,
        assignedToId: assignedStaff?.id || null,
        followUpDate: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // 6. Create Staff Notification
    await prisma.notification.create({
      data: {
        title: `New Finance Application: ${applicationNumber}`,
        message: `${customerName} applied for ₹${principal.toLocaleString('en-IN')} loan on ${vehicleModel}. Mobile: ${cleanMobile}`,
        type: 'FINANCE',
        link: '/admin/finance',
        userId: assignedStaff?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      application,
      applicationNumber,
      message: `Finance application ${applicationNumber} submitted successfully! Our loan desk will contact you with bank tie-up options.`,
    });
  } catch (error: any) {
    console.error('Create finance application error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('finance', 'edit', user) || await hasPermission('leads', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const {
      id,
      status,
      bankPartner,
      interestRate,
      emi,
      notes,
      assignedStaffId,
    } = body;

    if (!id) return NextResponse.json({ error: 'Finance Application ID is required' }, { status: 400 });

    const existing = await prisma.financeApplication.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Finance application not found' }, { status: 404 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (bankPartner !== undefined) updateData.bankPartner = bankPartner;
    if (interestRate !== undefined) updateData.interestRate = interestRate ? Number(interestRate) : null;
    if (emi !== undefined) updateData.emi = emi ? Number(emi) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId || null;

    const updated = await prisma.financeApplication.update({
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
      module: 'FINANCE',
      recordId: existing.applicationNumber,
      oldValue: `Status: ${existing.status}, Bank: ${existing.bankPartner}`,
      newValue: `Status: ${updated.status}, Bank: ${updated.bankPartner}`,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error('Update finance application error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission('finance', 'delete', user) || await hasPermission('leads', 'delete', user);
    if (!canDelete) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Finance Application ID is required' }, { status: 400 });

    const existing = await prisma.financeApplication.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Finance application not found' }, { status: 404 });

    await prisma.financeApplication.delete({ where: { id } });

    await logAudit({
      user,
      action: 'DELETE',
      module: 'FINANCE',
      recordId: existing.applicationNumber,
      oldValue: `${existing.customerName} - ₹${existing.loanAmount}`,
      newValue: 'Deleted finance application record',
    });

    return NextResponse.json({ success: true, message: 'Finance application deleted' });
  } catch (error: any) {
    console.error('Delete finance application error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
