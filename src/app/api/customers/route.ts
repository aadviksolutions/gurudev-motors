import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('customers', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');

    if (id) {
      // 360-degree customer profile view
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          leads: { orderBy: { createdAt: 'desc' } },
          testDrives: { include: { vehicle: true }, orderBy: { preferredDate: 'desc' } },
          bookings: { include: { vehicle: true }, orderBy: { createdAt: 'desc' } },
          sales: { include: { vehicle: true }, orderBy: { createdAt: 'desc' } },
          invoices: { include: { payments: true }, orderBy: { createdAt: 'desc' } },
          payments: { orderBy: { createdAt: 'desc' } },
          jobCards: { include: { parts: true }, orderBy: { createdAt: 'desc' } },
        },
      });

      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      return NextResponse.json({ success: true, customer });
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { customerNo: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: {
            leads: true,
            sales: true,
            jobCards: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('customers', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { name, mobile, email, address, city, state, pincode, aadharNo, panNo, notes } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    const existing = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
    if (existing) {
      return NextResponse.json({ error: 'Customer with this mobile already exists', customer: existing }, { status: 409 });
    }

    const custCount = await prisma.customer.count();
    const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(3, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        customerNo,
        name: name.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city || 'Raipur',
        state: state || 'Chhattisgarh',
        pincode: pincode?.trim() || null,
        aadharNo: aadharNo?.trim() || null,
        panNo: panNo?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'CUSTOMERS',
      recordId: customer.customerNo,
      newValue: `Created customer ${customer.name} (${customer.mobile})`,
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('Create customer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('customers', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'CUSTOMERS',
      recordId: existing.customerNo,
      oldValue: `Updated details for ${existing.name}`,
      newValue: `Updated details for ${updated.name}`,
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error('Update customer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
