import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.gallery.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('content', 'create', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { title, category, imageUrl, description, order } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
    }

    const item = await prisma.gallery.create({
      data: {
        title,
        category: category || 'SHOWROOM',
        imageUrl,
        description: description || null,
        order: Number(order) || 0,
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'CONTENT',
      recordId: item.id,
      newValue: `Added gallery item "${item.title}"`,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canDelete = await hasPermission('content', 'delete', user);
    if (!canDelete) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.gallery.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
