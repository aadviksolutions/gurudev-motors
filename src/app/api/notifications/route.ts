import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [{ userId: user.id }, { userId: null }],
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
