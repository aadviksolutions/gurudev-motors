import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('all') !== 'true';

    const offers = await prisma.offer.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, offers });
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
    const { title, badge, discountText, description, imageUrl, validTill, terms, active = true } = body;

    if (!title || !discountText || !description) {
      return NextResponse.json({ error: 'Title, discount text, and description are required' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        badge: badge || 'SPECIAL DEAL',
        discountText,
        description,
        imageUrl: imageUrl || null,
        validTill: validTill ? new Date(validTill) : null,
        terms: terms || null,
        active: Boolean(active),
      },
    });

    await logAudit({
      user,
      action: 'CREATE',
      module: 'CONTENT',
      recordId: offer.id,
      newValue: `Created offer "${offer.title}" (${offer.discountText})`,
    });

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('content', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { id, active, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        ...(active !== undefined ? { active: Boolean(active) } : {}),
        ...rest,
      },
    });

    return NextResponse.json({ success: true, offer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
