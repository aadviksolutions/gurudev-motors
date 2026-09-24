import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('roles', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('roles', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { name, code, description, permissions = [] } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Role name and unique code are required' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().replace(/\s+/g, '_');

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        description: description || null,
        isSystem: false,
      },
    });

    // Create permissions
    for (const p of permissions) {
      await prisma.permission.create({
        data: {
          roleId: role.id,
          module: p.module,
          view: Boolean(p.view),
          create: Boolean(p.create),
          edit: Boolean(p.edit),
          delete: Boolean(p.delete),
          assign: Boolean(p.assign),
          approve: Boolean(p.approve),
          export: Boolean(p.export),
        },
      });
    }

    await logAudit({
      user,
      action: 'CREATE',
      module: 'ROLES',
      recordId: role.id,
      newValue: `Created custom role ${role.name} (${role.code})`,
    });

    const fullRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: true },
    });

    return NextResponse.json({ success: true, role: fullRole });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('roles', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { roleId, permissions = [] } = body;

    if (!roleId) return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    // Update each module's permissions
    for (const p of permissions) {
      await prisma.permission.upsert({
        where: {
          roleId_module: {
            roleId,
            module: p.module,
          },
        },
        update: {
          view: Boolean(p.view),
          create: Boolean(p.create),
          edit: Boolean(p.edit),
          delete: Boolean(p.delete),
          assign: Boolean(p.assign),
          approve: Boolean(p.approve),
          export: Boolean(p.export),
        },
        create: {
          roleId,
          module: p.module,
          view: Boolean(p.view),
          create: Boolean(p.create),
          edit: Boolean(p.edit),
          delete: Boolean(p.delete),
          assign: Boolean(p.assign),
          approve: Boolean(p.approve),
          export: Boolean(p.export),
        },
      });
    }

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'ROLES',
      recordId: role.code,
      newValue: `Updated permissions matrix for role ${role.name}`,
    });

    const updated = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    return NextResponse.json({ success: true, role: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
