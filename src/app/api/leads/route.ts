import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
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

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (source && source !== 'ALL') where.source = source;

    // Strict role-based scoping: Sales Executives can ONLY see assigned leads
    if (scope.isSalesExecutive) {
      where.assignedToId = user.id;
    } else if (assignedToId && assignedToId !== 'ALL') {
      where.assignedToId = assignedToId;
    }

    // Date range filter
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
        { customerName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { vehicleModel: { contains: search, mode: 'insensitive' } },
        { leadNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true, phone: true } },
        customer: true,
        followUps: { orderBy: { scheduledDate: 'desc' }, take: 5 },
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
    const user = await getSessionUser();
    const body = await req.json();
    const { customerName, mobile, email, vehicleModel, budget, source, notes, followUpDate, assignedToId } = body;

    if (!customerName || !mobile || !vehicleModel) {
      return NextResponse.json({ error: 'Customer name, mobile and vehicle model are required' }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

    // Check or create customer
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

    // Assignment logic:
    // 1. If assignedToId specified and creator has assign permission, use that
    // 2. If logged in user is Sales Executive, assign to themselves
    // 3. Otherwise round-robin among active sales executives
    let assignedUserId: string | null = null;
    if (user) {
      const scope = getRoleScope(user);
      if (scope.isSalesExecutive) {
        assignedUserId = user.id;
      } else if (assignedToId && (scope.isGlobalAdmin || scope.isSalesManager)) {
        assignedUserId = assignedToId;
      }
    }

    if (!assignedUserId) {
      const salesExecs = await prisma.user.findMany({
        where: {
          active: true,
          role: { code: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
        },
      });
      assignedUserId = salesExecs.length > 0 ? salesExecs[leadCount % salesExecs.length].id : null;
    }

    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email?.trim() || null,
        vehicleModel: vehicleModel.trim(),
        budget: budget?.trim() || null,
        source: source || (user ? 'WALK_IN' : 'WEBSITE'),
        status: 'NEW',
        priority: 'MEDIUM',
        notes: notes?.trim() || null,
        customerId: customer.id,
        assignedToId: assignedUserId,
        followUpDate: followUpDate ? new Date(followUpDate) : new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // Create initial FollowUp record
    if (lead.followUpDate) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          customerId: customer.id,
          scheduledDate: lead.followUpDate,
          notes: notes ? `Initial: ${notes}` : 'Initial follow-up',
          userId: assignedUserId,
          status: 'PENDING',
        },
      });
    }

    // In-app Notification for assigned staff
    if (assignedUserId) {
      await prisma.notification.create({
        data: {
          title: `New Lead: ${customerName}`,
          message: `Enquired for ${vehicleModel}. Mobile: ${cleanMobile}`,
          type: 'LEAD',
          link: '/admin/leads',
          userId: assignedUserId,
        },
      });
    }

    if (user) {
      await logAudit({
        user,
        action: 'CREATE',
        module: 'LEADS',
        recordId: lead.leadNumber,
        newValue: `Created lead for ${lead.customerName} (${lead.vehicleModel})`,
      });
    }

    return NextResponse.json({
      success: true,
      lead,
      message: 'Enquiry submitted successfully. Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Create lead error:', error);
    return NextResponse.json({ success: false, message: 'Unable to submit your enquiry right now.' }, { status: 500 });
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

    const scope = getRoleScope(user);
    const body = await req.json();
    const { id, status, priority, assignedToId, followUpDate, notes, followUpNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Sales Executive can only edit leads assigned to them
    if (scope.isSalesExecutive && existingLead.assignedToId !== user.id) {
      return NextResponse.json({ error: 'Permission denied: Lead is not assigned to you' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    // Only Admin or Sales Manager can reassign leads
    if (assignedToId !== undefined) {
      if (scope.isGlobalAdmin || scope.isSalesManager) {
        updateData.assignedToId = assignedToId || null;
      }
    }

    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    if (notes !== undefined) updateData.notes = notes;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: true,
      },
    });

    // Record follow-up entry if followUpDate was set or followUpNotes provided
    if (followUpDate || followUpNotes) {
      await prisma.followUp.create({
        data: {
          leadId: existingLead.id,
          customerId: existingLead.customerId,
          scheduledDate: followUpDate ? new Date(followUpDate) : new Date(),
          notes: followUpNotes || notes || `Follow-up updated to status: ${status || existingLead.status}`,
          userId: user.id,
          status: 'PENDING',
        },
      });
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canDelete = await hasPermission('leads', 'delete', user);
    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied: Delete requires admin privilege' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Clean up associated followups first
    await prisma.followUp.deleteMany({ where: { leadId: id } });
    await prisma.lead.delete({ where: { id } });

    await logAudit({
      user,
      action: 'DELETE',
      module: 'LEADS',
      recordId: existingLead.leadNumber,
      oldValue: `${existingLead.customerName} - ${existingLead.vehicleModel}`,
      newValue: 'Deleted lead record',
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
