import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, hashPassword, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('employees', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const roleCode = searchParams.get('role');
    const status = searchParams.get('status');

    const where: any = {};
    if (roleCode && roleCode !== 'ALL') {
      where.role = { code: roleCode };
    }
    if (status && status !== 'ALL') {
      where.active = status === 'ACTIVE';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      include: {
        role: true,
        department: true,
        _count: {
          select: {
            assignedLeads: true,
            sales: true,
            serviceJobCards: true,
            testDrives: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const safeEmployees = employees.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json({ success: true, employees: safeEmployees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('employees', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied: Requires Admin privileges' }, { status: 403 });

    const body = await req.json();
    const { name, email, password, phone, roleId, departmentId, active = true, customPermissions } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Name, email, password and role are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone?.trim() || null,
        roleId,
        departmentId: departmentId || null,
        active: Boolean(active),
        customPermissions: customPermissions ? (typeof customPermissions === 'string' ? customPermissions : JSON.stringify(customPermissions)) : null,
      },
      include: { role: true, department: true },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'USERS',
      recordId: employee.id,
      newValue: `Created user ${employee.name} (${employee.email}) with role ${employee.role.name}`,
    });

    const { passwordHash: _, ...safeEmployee } = employee;
    return NextResponse.json({ success: true, employee: safeEmployee });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('employees', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied: Requires Admin privileges' }, { status: 403 });

    const body = await req.json();
    const { id, name, phone, roleId, departmentId, active, password, customPermissions } = body;

    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Safety: prevent deactivating own account
    if (id === user.id && active === false) {
      return NextResponse.json({ error: 'You cannot deactivate your own active account' }, { status: 400 });
    }

    let auditNote = `Updated details for ${targetUser.name}`;
    const updatePayload: any = {};
    if (name) updatePayload.name = name.trim();
    if (phone !== undefined) updatePayload.phone = phone?.trim() || null;
    if (roleId) updatePayload.roleId = roleId;
    if (departmentId !== undefined) updatePayload.departmentId = departmentId || null;
    if (active !== undefined) updatePayload.active = Boolean(active);
    if (customPermissions !== undefined) {
      updatePayload.customPermissions = customPermissions ? (typeof customPermissions === 'string' ? customPermissions : JSON.stringify(customPermissions)) : null;
      auditNote += ' (Individual rights updated)';
    }
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      updatePayload.passwordHash = await hashPassword(password);
      auditNote += ' (Password was reset)';
    }
    if (active !== undefined && active !== targetUser.active) {
      auditNote += ` (Status changed to ${active ? 'ACTIVE' : 'INACTIVE'})`;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updatePayload,
      include: { role: true, department: true },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'USERS',
      recordId: updated.id,
      newValue: auditNote,
    });

    const { passwordHash: _, ...safeEmployee } = updated;
    return NextResponse.json({ success: true, employee: safeEmployee });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
