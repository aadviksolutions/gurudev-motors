import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getNextJobCardSerial } from '@/lib/service-serial';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const nextSerial = await getNextJobCardSerial();

    const config = await prisma.websiteContent.findUnique({
      where: { sectionKey: 'service_job_card_config' },
    });

    let configuredStart: number | null = null;
    if (config?.metadata) {
      try {
        const parsed = JSON.parse(config.metadata);
        configuredStart = parsed.startSerial || null;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      nextSerialNumber: nextSerial,
      configuredStart,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('service', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const startNumber = Number(body.startNumber);
    if (isNaN(startNumber) || startNumber < 1) {
      return NextResponse.json({ error: 'Valid starting serial number is required (positive integer)' }, { status: 400 });
    }

    const padded = String(startNumber).padStart(4, '0');

    await prisma.websiteContent.upsert({
      where: { sectionKey: 'service_job_card_config' },
      create: {
        sectionKey: 'service_job_card_config',
        title: 'Service Job Card Sequence',
        content: padded,
        metadata: JSON.stringify({
          startSerial: startNumber,
          setBy: user.name,
          updatedAt: new Date().toISOString(),
        }),
      },
      update: {
        content: padded,
        metadata: JSON.stringify({
          startSerial: startNumber,
          setBy: user.name,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'SERVICE',
      recordId: 'JOB_CARD_CONFIG',
      newValue: `Admin set Job Card starting serial number to ${padded}`,
    });

    const nextSerial = await getNextJobCardSerial();

    return NextResponse.json({
      success: true,
      nextSerialNumber: nextSerial,
      configuredStart: startNumber,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
