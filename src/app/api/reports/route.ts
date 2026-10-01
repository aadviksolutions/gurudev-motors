import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { FALLBACK_DASHBOARD } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('dashboard', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const [
        todaysLeadsCount,
        pendingFollowupsCount,
        vehiclesInStockCount,
        totalVehiclesCount,
        newVehiclesCount,
        preOwnedVehiclesCount,
        evVehiclesCount,
        activeOffersCount,
        exchangeRequestsCount,
        serviceBookingsCount,
        financeApplicationsCount,
        testRidesCount,
        todaysSalesList,
        todaysPaymentsList,
        activeServiceJobsCount,
        invoiceTotals,
        paymentTotals,
        allLeads,
        vehicleCategories,
        recentLeads,
        recentBookings,
        recentSales,
        recentPayments,
        pendingInvoices,
        recentExchanges,
        recentFinances,
        recentServiceBookings,
        recentServiceJobs,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: today } } }),
        prisma.lead.count({
          where: {
            followUpDate: { lte: now },
            status: { notIn: ['DELIVERED', 'LOST', 'CLOSED'] },
          },
        }),
        prisma.vehicle.count({ where: { stockStatus: 'IN_STOCK', published: true } }),
        prisma.vehicle.count(),
        prisma.vehicle.count({ where: { category: 'NEW' } }),
        prisma.vehicle.count({ where: { category: 'PRE_OWNED' } }),
        prisma.vehicle.count({ where: { category: 'ELECTRIC' } }),
        prisma.offer.count({
          where: {
            active: true,
            OR: [{ startDate: null }, { startDate: { lte: now } }],
            AND: [{ validTill: null }, { validTill: { gte: now } }],
          },
        }),
        prisma.exchangeRequest.count({ where: { status: { notIn: ['CLOSED', 'REJECTED'] } } }),
        prisma.serviceBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
        prisma.financeApplication.count({ where: { status: { notIn: ['DISBURSED', 'REJECTED', 'CLOSED'] } } }),
        prisma.testDrive.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
        prisma.sale.findMany({ where: { createdAt: { gte: today } } }),
        prisma.payment.findMany({ where: { paymentDate: { gte: today } } }),
        prisma.serviceJobCard.count({ where: { status: { notIn: ['DELIVERED'] } } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
        prisma.payment.aggregate({ _sum: { amount: true } }),
        prisma.lead.findMany({ select: { status: true, source: true } }),
        prisma.vehicle.groupBy({ by: ['category'], _count: { id: true } }),
        prisma.lead.findMany({
          include: { assignedTo: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 6,
        }),
        prisma.booking.findMany({
          include: { customer: true, vehicle: true, salesperson: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.sale.findMany({
          include: { customer: true, vehicle: true, salesperson: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.payment.findMany({
          include: { customer: true, invoice: true },
          orderBy: { paymentDate: 'desc' },
          take: 5,
        }),
        prisma.invoice.findMany({
          where: { status: { in: ['UNPAID', 'PARTIAL'] } },
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.exchangeRequest.findMany({
          include: { customer: true, assignedStaff: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.financeApplication.findMany({
          include: { customer: true, assignedStaff: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.serviceBooking.findMany({
          include: { customer: true, advisor: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.serviceJobCard.findMany({
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 8 }),
      ]);

      const todaysSalesTotal = todaysSalesList.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const todaysCollectionsTotal = todaysPaymentsList.reduce((sum, payment) => sum + payment.amount, 0);
      const outstandingPayments = Math.max(
        0,
        (invoiceTotals._sum.totalAmount ?? 0) - (paymentTotals._sum.amount ?? 0)
      );

      const pipelineCounts: Record<string, number> = {
        NEW: 0,
        CONTACTED: 0,
        FOLLOW_UP: 0,
        INTERESTED: 0,
        TEST_DRIVE: 0,
        NEGOTIATION: 0,
        CONVERTED: 0,
        BOOKED: 0,
        DELIVERED: 0,
        NOT_INTERESTED: 0,
        LOST: 0,
        CLOSED: 0,
      };
      allLeads.forEach((lead) => {
        pipelineCounts[lead.status] = (pipelineCounts[lead.status] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        kpis: {
          todaysLeads: todaysLeadsCount,
          pendingFollowups: pendingFollowupsCount,
          vehiclesInStock: vehiclesInStockCount,
          totalVehicles: totalVehiclesCount,
          newVehicles: newVehiclesCount,
          preOwnedVehicles: preOwnedVehiclesCount,
          evVehicles: evVehiclesCount,
          activeOffers: activeOffersCount,
          exchangeRequests: exchangeRequestsCount,
          serviceBookings: serviceBookingsCount,
          financeApplications: financeApplicationsCount,
          testRideRequests: testRidesCount,
          todaysSales: todaysSalesTotal,
          todaysCollections: todaysCollectionsTotal,
          activeServiceJobs: activeServiceJobsCount,
          outstandingPayments,
        },
        pipeline: pipelineCounts,
        vehicleCategories: vehicleCategories.map((category) => ({
          category: category.category,
          count: category._count.id,
        })),
        recentLeads,
        recentBookings,
        recentSales,
        recentPayments,
        pendingInvoices,
        recentExchanges,
        recentFinances,
        recentServiceBookings,
        recentServiceJobs,
        recentAuditLogs,
      });
    } catch (dbError) {
      console.warn('Prisma reports query failed, returning fallback dashboard data:', dbError);
      return NextResponse.json({ success: true, ...FALLBACK_DASHBOARD });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: true, ...FALLBACK_DASHBOARD });
  }
}
