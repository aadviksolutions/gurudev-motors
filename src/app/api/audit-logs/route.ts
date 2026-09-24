import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('audit_logs', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const module = searchParams.get('module');

    const where: any = {};
    if (module && module !== 'ALL') where.module = module;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
