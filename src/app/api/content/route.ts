import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionKey = searchParams.get('key');

    if (sectionKey) {
      const section = await prisma.websiteContent.findUnique({
        where: { sectionKey },
      });
      return NextResponse.json({ success: true, section });
    }

    const sections = await prisma.websiteContent.findMany();
    return NextResponse.json({ success: true, sections });
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
    const { sectionKey, title, subtitle, content, metadata } = body;

    if (!sectionKey || !title || !content) {
      return NextResponse.json({ error: 'Section key, title, and content are required' }, { status: 400 });
    }

    const updated = await prisma.websiteContent.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle: subtitle || null,
        content,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
      create: {
        sectionKey,
        title,
        subtitle: subtitle || null,
        content,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'CONTENT',
      recordId: sectionKey,
      newValue: `Updated CMS section "${sectionKey}"`,
    });

    return NextResponse.json({ success: true, section: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
