import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('dashboard', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Live KPI metrics
    const [
      todaysLeadsCount,
      pendingFollowupsCount,
      vehiclesInStockCount,
      todaysSalesList,
      todaysPaymentsList,
      activeServiceJobsCount,
      invoicesList,
      paymentsList,
    ] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count({ where: { followUpDate: { lte: new Date() }, status: { notIn: ['DELIVERED', 'LOST'] } } }),
      prisma.vehicle.count({ where: { stockStatus: 'IN_STOCK', published: true } }),
      prisma.sale.findMany({ where: { createdAt: { gte: today } } }),
      prisma.payment.findMany({ where: { paymentDate: { gte: today } } }),
      prisma.serviceJobCard.count({ where: { status: { notIn: ['DELIVERED'] } } }),
      prisma.invoice.findMany(),
      prisma.payment.findMany(),
    ]);

    const todaysSalesTotal = todaysSalesList.reduce((sum, s) => sum + s.totalAmount, 0);
    const todaysCollectionsTotal = todaysPaymentsList.reduce((sum, p) => sum + p.amount, 0);
    const totalInvoiced = invoicesList.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = paymentsList.reduce((sum, p) => sum + p.amount, 0);
    const outstandingPayments = Math.max(0, totalInvoiced - totalCollected);

    // 2. Lead Pipeline distribution
    const allLeads = await prisma.lead.findMany({
      select: { status: true, source: true },
    });
    const pipelineCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      TEST_DRIVE: 0,
      NEGOTIATION: 0,
      BOOKED: 0,
      DELIVERED: 0,
      LOST: 0,
    };
    allLeads.forEach((l) => {
      pipelineCounts[l.status] = (pipelineCounts[l.status] || 0) + 1;
    });

    // 3. Category vehicle counts
    const categoryCounts = await prisma.vehicle.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    // 4. Recent records for Dashboard tables
    const recentLeads = await prisma.lead.findMany({
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const recentBookings = await prisma.booking.findMany({
      include: { customer: true, vehicle: true, salesperson: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSales = await prisma.sale.findMany({
      include: { customer: true, vehicle: true, salesperson: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['UNPAID', 'PARTIAL'] } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentServiceJobs = await prisma.serviceJobCard.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      kpis: {
        todaysLeads: todaysLeadsCount,
        pendingFollowups: pendingFollowupsCount,
        vehiclesInStock: vehiclesInStockCount,
        todaysSales: todaysSalesTotal,
        todaysCollections: todaysCollectionsTotal,
        activeServiceJobs: activeServiceJobsCount,
        outstandingPayments,
      },
      pipeline: pipelineCounts,
      vehicleCategories: categoryCounts.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      recentLeads,
      recentBookings,
      recentSales,
      pendingInvoices,
      recentServiceJobs,
    });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
