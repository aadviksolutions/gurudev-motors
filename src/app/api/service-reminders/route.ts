import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface ServiceReminderItem {
  customerId: string;
  customerName: string;
  mobile: string;
  email?: string | null;
  city?: string | null;
  vehicleModel: string;
  vehicleRegNo: string;
  purchaseDate: string | null;
  lastServiceDate: string | null;
  nextDueDate: string;
  serviceCycleType: string;
  intervalMonths: number;
  status: 'OVERDUE' | 'DUE_THIS_WEEK' | 'DUE_THIS_MONTH' | 'UPCOMING';
  daysDifference: number; // negative = overdue, positive = days left
  lastJobCardNumber?: string | null;
  whatsappMessage: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('service', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const intervalParam = parseInt(searchParams.get('interval') || '3', 10);
    const intervalMonths = intervalParam === 6 ? 6 : 3;
    const filter = (searchParams.get('filter') || 'ALL').toUpperCase();
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // Fetch customers who have either vehicle / service details or sales / job card records
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          include: { vehicle: true },
          orderBy: { deliveryDate: 'desc' },
          take: 1,
        },
        jobCards: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allReminders: ServiceReminderItem[] = [];

    for (const c of customers) {
      const latestSale = c.sales?.[0];
      const latestJob = c.jobCards?.[0];

      const model =
        c.vehicleModel ||
        (latestSale?.vehicle ? `${latestSale.vehicle.brand} ${latestSale.vehicle.model}` : null) ||
        latestJob?.vehicleModel ||
        '';

      const reg = c.vehicleRegNo || latestJob?.vehicleRegNumber || '';

      const lastService = c.lastServiceDate || (latestJob?.createdAt ? new Date(latestJob.createdAt) : null);
      const purchase = c.purchaseDate || (latestSale?.deliveryDate ? new Date(latestSale.deliveryDate) : null);

      // Must have either last service or purchase date to calculate due reminder
      if (!lastService && !purchase) continue;

      let nextDue: Date;
      let serviceCycleType = 'Periodic Maintenance';

      if (lastService) {
        nextDue = new Date(lastService);
        nextDue.setMonth(nextDue.getMonth() + intervalMonths);
        serviceCycleType = intervalMonths === 3 ? '3-Month Periodic Service' : '6-Month Comprehensive Service';
      } else if (purchase) {
        // Calculate service milestone from purchase date
        const purchDate = new Date(purchase);
        let cycle = 1;
        let chosenDate = new Date(purchDate);
        chosenDate.setMonth(chosenDate.getMonth() + intervalMonths);

        // Advance cycle until we hit a window around or ahead of today
        while (cycle < 16) {
          const candidate = new Date(purchDate);
          candidate.setMonth(candidate.getMonth() + (cycle * intervalMonths));
          chosenDate = candidate;
          if (candidate.getTime() >= today.getTime() - 30 * 24 * 3600 * 1000) {
            break;
          }
          cycle++;
        }

        nextDue = chosenDate;
        if (cycle === 1) serviceCycleType = '1st Periodic Free Service';
        else if (cycle === 2) serviceCycleType = '2nd Periodic Free Service';
        else if (cycle === 3) serviceCycleType = '3rd Periodic Free Service';
        else serviceCycleType = `${cycle}th Periodic Maintenance`;
      } else {
        continue;
      }

      // Calculate days difference
      const dueMidnight = new Date(nextDue);
      dueMidnight.setHours(0, 0, 0, 0);
      const diffMs = dueMidnight.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

      let status: ServiceReminderItem['status'] = 'UPCOMING';
      if (diffDays < 0) {
        status = 'OVERDUE';
      } else if (diffDays <= 7) {
        status = 'DUE_THIS_WEEK';
      } else if (diffDays <= 30) {
        status = 'DUE_THIS_MONTH';
      } else {
        status = 'UPCOMING';
      }

      const formattedDueDate = nextDue.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const cleanReg = reg || 'Your vehicle';
      const cleanModel = model || 'Two-Wheeler';

      const whatsappText =
        `Namaste ${c.name} ji! Greetings from Gurudev Motors Raipur.\n\n` +
        `This is a friendly reminder that your ${cleanModel} (${cleanReg}) is due for ${serviceCycleType} on *${formattedDueDate}*.\n\n` +
        `Regular servicing keeps your engine in peak condition, maximizes fuel mileage, and ensures complete riding safety.\n\n` +
        `Location: Gurudev Motors, Near Ring Road, Raipura, Raipur\n` +
        `Phone / Booking: 0771-4001234 / +91 ${c.mobile}\n\n` +
        `We look forward to serving you!`;

      allReminders.push({
        customerId: c.id,
        customerName: c.name,
        mobile: c.mobile,
        email: c.email,
        city: c.city,
        vehicleModel: cleanModel,
        vehicleRegNo: cleanReg,
        purchaseDate: purchase ? purchase.toISOString() : null,
        lastServiceDate: lastService ? lastService.toISOString() : null,
        nextDueDate: nextDue.toISOString(),
        serviceCycleType,
        intervalMonths,
        status,
        daysDifference: diffDays,
        lastJobCardNumber: latestJob?.jobCardNumber || null,
        whatsappMessage: whatsappText,
      });
    }

    // Sort: Overdue first (most overdue at top), then closest upcoming
    allReminders.sort((a, b) => a.daysDifference - b.daysDifference);

    // Compute summary stats before filter
    const stats = {
      total: allReminders.length,
      overdue: allReminders.filter((r) => r.status === 'OVERDUE').length,
      dueThisWeek: allReminders.filter((r) => r.status === 'DUE_THIS_WEEK').length,
      dueThisMonth: allReminders.filter((r) => r.status === 'DUE_THIS_MONTH' || r.status === 'DUE_THIS_WEEK').length,
      upcoming: allReminders.filter((r) => r.status === 'UPCOMING').length,
    };

    // Filter by search query
    let filtered = allReminders;
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(search) ||
          r.mobile.includes(search) ||
          r.vehicleModel.toLowerCase().includes(search) ||
          r.vehicleRegNo.toLowerCase().includes(search)
      );
    }

    // Filter by status tab
    if (filter === 'OVERDUE') {
      filtered = filtered.filter((r) => r.status === 'OVERDUE');
    } else if (filter === 'DUE_THIS_WEEK') {
      filtered = filtered.filter((r) => r.status === 'DUE_THIS_WEEK');
    } else if (filter === 'DUE_THIS_MONTH') {
      filtered = filtered.filter((r) => r.status === 'DUE_THIS_MONTH' || r.status === 'DUE_THIS_WEEK');
    } else if (filter === 'UPCOMING') {
      filtered = filtered.filter((r) => r.status === 'UPCOMING');
    }

    return NextResponse.json({
      success: true,
      stats,
      intervalMonths,
      filter,
      reminders: filtered,
    });
  } catch (error: any) {
    console.error('Service reminders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
