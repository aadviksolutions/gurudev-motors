import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canView = await hasPermission('leads', 'view', user);
    if (!canView) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    // If user is sales executive without manage rights, only see their assigned leads
    if (user.roleCode === 'SALES_EXECUTIVE') {
      where.assignedToId = user.id;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { mobile: { contains: search } },
        { vehicleModel: { contains: search } },
        { leadNumber: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, mobile, email, vehicleModel, budget, source, notes } = body;

    if (!customerName || !mobile || !vehicleModel) {
      return NextResponse.json({ error: 'Customer name, mobile and vehicle model are required' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    // Check if customer already exists or create new
    let customer = await prisma.customer.findUnique({
      where: { mobile: cleanMobile },
    });

    if (!customer) {
      const custCount = await prisma.customer.count();
      const customerNo = `CUST-${new Date().getFullYear()}-${String(custCount + 1).padStart(3, '0')}`;
      customer = await prisma.customer.create({
        data: {
          customerNo,
          name: customerName.trim(),
          mobile: cleanMobile,
          email: email?.trim() || null,
          notes: notes?.trim() || null,
        },
      });
    }

    const leadCount = await prisma.lead.count();
    const leadNumber = `LD-${new Date().getFullYear()}-${String(leadCount + 101).padStart(3, '0')}`;

    // Auto-assign to an active sales executive round-robin
    const salesExecs = await prisma.user.findMany({
      where: {
        active: true,
        role: { code: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
      },
    });

    const assignedUser = salesExecs.length > 0 ? salesExecs[leadCount % salesExecs.length] : null;

    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        budget: budget?.trim() || null,
        source: source || 'WEBSITE',
        status: 'NEW',
        priority: 'MEDIUM',
        notes: notes?.trim() || null,
        customerId: customer.id,
        assignedToId: assignedUser?.id || null,
        followUpDate: new Date(Date.now() + 24 * 3600 * 1000), // Default 24h
      },
    });

    // Create Notification for the sales team
    await prisma.notification.create({
      data: {
        title: `New Lead: ${customerName}`,
        message: `Enquired for ${vehicleModel}. Mobile: ${cleanMobile}`,
        type: 'LEAD',
        link: '/admin/leads',
        userId: assignedUser?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      message: 'Enquiry submitted successfully. Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canEdit = await hasPermission('leads', 'edit', user);
    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, priority, assignedToId, followUpDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    await logAudit({
      user,
      action: 'UPDATE',
      module: 'LEADS',
      recordId: existingLead.leadNumber,
      oldValue: `Status: ${existingLead.status}, Assigned: ${existingLead.assignedToId}`,
      newValue: `Status: ${updatedLead.status}, Assigned: ${updatedLead.assignedToId}`,
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Update lead error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
