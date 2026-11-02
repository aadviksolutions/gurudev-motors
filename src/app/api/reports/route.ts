import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { FALLBACK_DASHBOARD } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('dashboard', 'view', user) || await hasPermission('reports', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'overview';
    const fromDateStr = searchParams.get('fromDate');
    const toDateStr = searchParams.get('toDate');
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Date range filter
    let dateFilter: any = undefined;
    if (fromDateStr || toDateStr) {
      dateFilter = {};
      if (fromDateStr) dateFilter.gte = new Date(fromDateStr);
      if (toDateStr) {
        const end = new Date(toDateStr);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    // Role-based staff scoping
    let effectiveSalesStaffId: string | undefined = undefined;
    let effectiveServiceStaffId: string | undefined = undefined;

    if (scope.isSalesExecutive) {
      effectiveSalesStaffId = user.id;
    } else if (staffId && staffId !== 'ALL') {
      effectiveSalesStaffId = staffId;
    }

    if (scope.isServiceExecutive) {
      effectiveServiceStaffId = user.id;
    } else if (staffId && staffId !== 'ALL') {
      effectiveServiceStaffId = staffId;
    }

    // 1. If detailed report type requested, generate tabular dataset
    if (reportType === 'leads') {
      const where: any = {};
      if (effectiveSalesStaffId) where.assignedToId = effectiveSalesStaffId;
      if (status && status !== 'ALL') where.status = status;
      if (dateFilter) where.createdAt = dateFilter;
      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search } },
          { vehicleModel: { contains: search, mode: 'insensitive' } },
          { leadNumber: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [leads, totalCount] = await Promise.all([
        prisma.lead.findMany({
          where,
          include: { assignedTo: { select: { id: true, name: true } }, customer: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.lead.count({ where }),
      ]);

      const byStatus: Record<string, number> = {};
      leads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });

      return NextResponse.json({
        success: true,
        reportType: 'leads',
        totalCount,
        records: leads,
        summary: {
          totalLeads: totalCount,
          byStatus,
          converted: byStatus['CONVERTED'] || byStatus['BOOKED'] || byStatus['DELIVERED'] || 0,
        },
      });
    }

    if (reportType === 'sales') {
      const where: any = {};
      if (effectiveSalesStaffId) where.salespersonId = effectiveSalesStaffId;
      if (status && status !== 'ALL') where.paymentStatus = status;
      if (dateFilter) where.createdAt = dateFilter;
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { mobile: { contains: search } } },
          { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          salesperson: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
      const totalBalance = sales.reduce((sum, s) => sum + s.balanceAmount, 0);

      return NextResponse.json({
        success: true,
        reportType: 'sales',
        totalCount: sales.length,
        records: sales,
        summary: {
          totalSales: sales.length,
          totalRevenue,
          totalDiscount,
          totalBalance,
        },
      });
    }

    if (reportType === 'service') {
      const where: any = {};
      if (effectiveServiceStaffId) where.advisorId = effectiveServiceStaffId;
      if (status && status !== 'ALL') where.status = status;
      if (dateFilter) where.createdAt = dateFilter;
      if (search) {
        where.OR = [
          { jobCardNumber: { contains: search, mode: 'insensitive' } },
          { vehicleRegNumber: { contains: search, mode: 'insensitive' } },
          { vehicleModel: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const jobCards = await prisma.serviceJobCard.findMany({
        where,
        include: {
          customer: true,
          advisor: { select: { id: true, name: true } },
          parts: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalParts = jobCards.reduce((sum, j) => sum + j.partsTotal, 0);
      const totalLabour = jobCards.reduce((sum, j) => sum + j.labourTotal, 0);
      const totalAmount = jobCards.reduce((sum, j) => sum + j.finalTotal, 0);
      const byStage: Record<string, number> = {};
      jobCards.forEach(j => { byStage[j.status] = (byStage[j.status] || 0) + 1; });

      return NextResponse.json({
        success: true,
        reportType: 'service',
        totalCount: jobCards.length,
        records: jobCards,
        summary: {
          totalJobCards: jobCards.length,
          totalParts,
          totalLabour,
          totalAmount,
          byStage,
        },
      });
    }

    if (reportType === 'performance') {
      // Executive-wise sales and service performance
      const [salesStaff, serviceStaff] = await Promise.all([
        prisma.user.findMany({
          where: {
            active: true,
            role: { code: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
          },
          include: {
            _count: { select: { assignedLeads: true, sales: true, bookings: true, testDrives: true } },
            sales: { select: { totalAmount: true } },
          },
        }),
        prisma.user.findMany({
          where: {
            active: true,
            role: { code: { in: ['SERVICE_EXECUTIVE', 'SERVICE_MANAGER'] } },
          },
          include: {
            _count: { select: { serviceJobCards: true, serviceBookings: true } },
            serviceJobCards: { select: { finalTotal: true } },
          },
        }),
      ]);

      const salesPerformance = salesStaff.map(s => {
        const rev = s.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          leads: s._count.assignedLeads,
          testDrives: s._count.testDrives,
          bookings: s._count.bookings,
          salesClosed: s._count.sales,
          revenueGenerated: rev,
          conversionRate: s._count.assignedLeads > 0 ? Math.round((s._count.sales / s._count.assignedLeads) * 100) : 0,
        };
      });

      const servicePerformance = serviceStaff.map(s => {
        const rev = s.serviceJobCards.reduce((sum, jc) => sum + jc.finalTotal, 0);
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          appointments: s._count.serviceBookings,
          jobsCompleted: s._count.serviceJobCards,
          revenueGenerated: rev,
        };
      });

      return NextResponse.json({
        success: true,
        reportType: 'performance',
        salesPerformance,
        servicePerformance,
      });
    }

    // 2. Default Overview / Dashboard Data
    const leadsWhere: any = {};
    const followupsWhere: any = {
      followUpDate: { lte: now },
      status: { notIn: ['DELIVERED', 'LOST', 'CLOSED'] },
    };
    const testDrivesWhere: any = { status: { notIn: ['COMPLETED', 'CANCELLED'] } };
    const bookingsWhere: any = {};
    const salesWhere: any = {};
    const serviceJobsWhere: any = { status: { notIn: ['DELIVERED'] } };
    const serviceBookingsWhere: any = { status: { notIn: ['DELIVERED', 'CANCELLED'] } };

    if (scope.isSalesExecutive) {
      leadsWhere.assignedToId = user.id;
      followupsWhere.assignedToId = user.id;
      testDrivesWhere.assignedToId = user.id;
      bookingsWhere.salespersonId = user.id;
      salesWhere.salespersonId = user.id;
    }

    if (scope.isServiceExecutive) {
      serviceJobsWhere.advisorId = user.id;
      serviceBookingsWhere.advisorId = user.id;
    }

    const [
      todaysLeadsCount,
      pendingFollowupsCount,
      overdueFollowupsCount,
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
      completedServiceJobsCount,
      delayedServiceJobsCount,
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
      prisma.lead.count({ where: { ...leadsWhere, createdAt: { gte: today } } }),
      prisma.lead.count({ where: followupsWhere }),
      prisma.lead.count({
        where: {
          ...leadsWhere,
          followUpDate: { lt: today },
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
      prisma.serviceBooking.count({ where: serviceBookingsWhere }),
      prisma.financeApplication.count({ where: { status: { notIn: ['DISBURSED', 'REJECTED', 'CLOSED'] } } }),
      prisma.testDrive.count({ where: testDrivesWhere }),
      prisma.sale.findMany({ where: { ...salesWhere, createdAt: { gte: today } } }),
      prisma.payment.findMany({ where: { paymentDate: { gte: today } } }),
      prisma.serviceJobCard.count({ where: serviceJobsWhere }),
      prisma.serviceJobCard.count({
        where: {
          ...(scope.isServiceExecutive ? { advisorId: user.id } : {}),
          status: 'DELIVERED',
        },
      }),
      prisma.serviceJobCard.count({
        where: {
          ...serviceJobsWhere,
          createdAt: { lt: new Date(Date.now() - 3 * 24 * 3600 * 1000) }, // Over 3 days old and not delivered
        },
      }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.lead.findMany({
        where: leadsWhere,
        select: { status: true, source: true },
      }),
      prisma.vehicle.groupBy({ by: ['category'], _count: { id: true } }),
      prisma.lead.findMany({
        where: leadsWhere,
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.booking.findMany({
        where: bookingsWhere,
        include: { customer: true, vehicle: true, salesperson: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.sale.findMany({
        where: salesWhere,
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
        where: serviceBookingsWhere,
        include: { customer: true, advisor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.serviceJobCard.findMany({
        where: serviceJobsWhere,
        include: { customer: true, advisor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      scope.isGlobalAdmin
        ? prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 8 })
        : Promise.resolve([]),
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
      userScope: {
        roleCode: user.roleCode,
        roleName: user.roleName,
        userName: user.name,
        department: user.departmentName,
      },
      kpis: {
        todaysLeads: todaysLeadsCount,
        pendingFollowups: pendingFollowupsCount,
        overdueFollowups: overdueFollowupsCount,
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
        completedServiceJobs: completedServiceJobsCount,
        delayedServiceJobs: delayedServiceJobsCount,
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
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: true, ...FALLBACK_DASHBOARD });
  }
}
