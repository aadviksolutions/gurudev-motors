import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('customers', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
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
          exchangeRequests: { orderBy: { createdAt: 'desc' } },
          financeApplications: { orderBy: { createdAt: 'desc' } },
          serviceBookings: { orderBy: { preferredDate: 'desc' } },
          followUps: { orderBy: { scheduledDate: 'desc' } },
        },
      });

      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

      // Verify record-level permission for detailed profile
      if (scope.isSalesExecutive) {
        const hasAssigned = customer.leads.some(l => l.assignedToId === user.id) ||
                            customer.testDrives.some(t => t.assignedToId === user.id) ||
                            customer.bookings.some(b => b.salespersonId === user.id) ||
                            customer.sales.some(s => s.salespersonId === user.id);
        if (!hasAssigned) {
          return NextResponse.json({ error: 'Permission denied: Customer is not in your assigned portfolio' }, { status: 403 });
        }
      } else if (scope.isServiceExecutive) {
        const hasAssigned = customer.jobCards.some(j => j.advisorId === user.id) ||
                            customer.serviceBookings.some(sb => sb.advisorId === user.id);
        if (!hasAssigned) {
          return NextResponse.json({ error: 'Permission denied: Customer is not in your assigned portfolio' }, { status: 403 });
        }
      }

      return NextResponse.json({ success: true, customer });
    }

    const where: any = {};

    // Role scoping
    if (scope.isSalesExecutive) {
      where.OR = [
        { leads: { some: { assignedToId: user.id } } },
        { testDrives: { some: { assignedToId: user.id } } },
        { bookings: { some: { salespersonId: user.id } } },
        { sales: { some: { salespersonId: user.id } } },
      ];
    } else if (scope.isServiceExecutive) {
      where.OR = [
        { jobCards: { some: { advisorId: user.id } } },
        { serviceBookings: { some: { advisorId: user.id } } },
      ];
    }

    if (search) {
      const searchCondition = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerNo: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition },
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
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

    // Helper to clean and format mobile number
    const sanitizeMobile = (raw: string | number) => {
      let digits = String(raw || '').replace(/[^0-9]/g, '');
      if (digits.length > 10 && digits.startsWith('91')) {
        digits = digits.slice(2);
      }
      return digits.slice(-10);
    };

    // Support Bulk Upload of Customers
    if (body.bulk === true || Array.isArray(body.customers)) {
      const customerList: any[] = Array.isArray(body.customers) ? body.customers : [];
      if (customerList.length === 0) {
        return NextResponse.json({ error: 'No customers provided for bulk upload' }, { status: 400 });
      }

      const created: any[] = [];
      const skipped: { name: string; mobile: string; reason: string }[] = [];
      const seenMobilesInBatch = new Set<string>();

      const totalCount = await prisma.customer.count();
      let seq = totalCount + 1;

      for (const item of customerList) {
        const name = item.name ? String(item.name).trim() : '';
        const mobile = sanitizeMobile(item.mobile);

        if (!name) {
          skipped.push({ name: item.name || 'Unnamed', mobile: item.mobile || '', reason: 'Customer name is missing' });
          continue;
        }

        if (!mobile || mobile.length < 10) {
          skipped.push({ name, mobile: item.mobile || '', reason: 'Invalid mobile number (requires 10 digits)' });
          continue;
        }

        if (seenMobilesInBatch.has(mobile)) {
          skipped.push({ name, mobile, reason: 'Duplicate mobile number in upload batch' });
          continue;
        }
        seenMobilesInBatch.add(mobile);

        // Check database for existing mobile
        const existing = await prisma.customer.findUnique({ where: { mobile } });
        if (existing) {
          skipped.push({ name, mobile, reason: `Mobile already registered for ${existing.name} (${existing.customerNo})` });
          continue;
        }

        const customerNo = `CUST-${new Date().getFullYear()}-${String(seq++).padStart(4, '0')}`;
        const newCust = await prisma.customer.create({
          data: {
            customerNo,
            name,
            mobile,
            email: item.email ? String(item.email).trim() : null,
            address: item.address ? String(item.address).trim() : null,
            city: item.city ? String(item.city).trim() : 'Raipur',
            state: item.state ? String(item.state).trim() : 'Chhattisgarh',
            pincode: item.pincode ? String(item.pincode).trim() : null,
            notes: item.notes ? String(item.notes).trim() : 'Bulk uploaded customer',
          },
        });

        created.push(newCust);
      }

      await logAudit({
        user,
        action: 'CREATE',
        module: 'CUSTOMERS',
        recordId: 'BULK_IMPORT',
        newValue: `Bulk imported ${created.length} customer(s). Skipped ${skipped.length}.`,
      });

      return NextResponse.json({
        success: true,
        bulk: true,
        total: customerList.length,
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
      });
    }

    // Single Customer Creation (Direct without lead)
    const { name, mobile, email, address, city, state, pincode, aadharNo, panNo, notes } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required' }, { status: 400 });
    }

    const cleanMobile = sanitizeMobile(mobile);
    if (!cleanMobile || cleanMobile.length < 10) {
      return NextResponse.json({ error: 'A valid 10-digit mobile number is required' }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
    if (existing) {
      return NextResponse.json(
        { error: `Customer with mobile ${cleanMobile} already exists (${existing.name} - ${existing.customerNo})`, customer: existing },
        { status: 409 }
      );
    }

    const custCount = await prisma.customer.count();
    const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(4, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        customerNo,
        name: name.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || 'Raipur',
        state: state?.trim() || 'Chhattisgarh',
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
    const { id, name, email, address, city, state, pincode, aadharNo, panNo, notes } = body;

    if (!id) return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode?.trim() || null;
    if (aadharNo !== undefined) updateData.aadharNo = aadharNo?.trim() || null;
    if (panNo !== undefined) updateData.panNo = panNo?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData,
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
