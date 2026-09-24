import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FALLBACK_DEPARTMENTS } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    console.warn('Prisma departments query failed, using fallback departments:', error);
    return NextResponse.json({ success: true, departments: FALLBACK_DEPARTMENTS });
  }
}
