import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('all') !== 'true';

    const where: any = {};
    if (activeOnly) {
      where.active = true;
      where.OR = [
        { validTill: null },
        { validTill: { gte: new Date() } },
      ];
    }

    const offers = await prisma.offer.findMany({
      where,
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
    const {
      title,
      badge,
      discountText,
      exchangeBonus,
      financeOffer,
      vehicleModel,
      description,
      imageUrl,
      startDate,
      validTill,
      terms,
      active = true,
    } = body;

    if (!title || !discountText || !description) {
      return NextResponse.json({ error: 'Title, discount text, and description are required' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title: title.trim(),
        badge: badge?.trim() || 'SPECIAL DEAL',
        discountText: discountText.trim(),
        exchangeBonus: exchangeBonus ? Number(exchangeBonus) : 0,
        financeOffer: financeOffer?.trim() || null,
        vehicleModel: vehicleModel?.trim() || null,
        description: description.trim(),
        imageUrl: imageUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        validTill: validTill ? new Date(validTill) : null,
        terms: terms?.trim() || null,
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
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.discountText !== undefined) updateData.discountText = data.discountText;
    if (data.exchangeBonus !== undefined) updateData.exchangeBonus = data.exchangeBonus ? Number(data.exchangeBonus) : 0;
    if (data.financeOffer !== undefined) updateData.financeOffer = data.financeOffer;
    if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.validTill !== undefined) updateData.validTill = data.validTill ? new Date(data.validTill) : null;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    const updated = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, offer: updated });
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

    await prisma.offer.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Offer deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
