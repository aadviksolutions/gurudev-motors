import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission, getRoleScope } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('sales', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get('paymentStatus');
    const salespersonId = searchParams.get('salespersonId');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {};
    if (paymentStatus && paymentStatus !== 'ALL') where.paymentStatus = paymentStatus;

    // Role scoping: Sales Executive only sees sales where they are the salesperson
    if (scope.isSalesExecutive) {
      where.salespersonId = user.id;
    } else if (salespersonId && salespersonId !== 'ALL') {
      where.salespersonId = salespersonId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, sales });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('sales', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const body = await req.json();
    const {
      customerId,
      vehicleId,
      vehiclePrice,
      discount = 0,
      exchangeValue = 0,
      financeAmount = 0,
      bookingAmount = 0,
      paymentStatus = 'COMPLETED',
      deliveryDate,
      notes,
      salespersonId,
    } = body;

    if (!customerId || !vehicleId || !vehiclePrice) {
      return NextResponse.json({ error: 'Customer, vehicle, and price are required' }, { status: 400 });
    }

    const price = Number(vehiclePrice);
    const disc = Number(discount);
    const exch = Number(exchangeValue);
    const fin = Number(financeAmount);
    const book = Number(bookingAmount);

    const totalAmount = Math.max(0, price - disc - exch);
    const balanceAmount = Math.max(0, totalAmount - fin - book);

    const count = await prisma.sale.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 43).padStart(4, '0')}`;

    let assignedSalesperson = user.id;
    if ((scope.isGlobalAdmin || scope.isSalesManager) && salespersonId) {
      assignedSalesperson = salespersonId;
    }

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        customerId,
        vehicleId,
        vehiclePrice: price,
        discount: disc,
        exchangeValue: exch,
        financeAmount: fin,
        bookingAmount: book,
        balanceAmount,
        totalAmount,
        paymentStatus,
        salespersonId: assignedSalesperson,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
        notes: notes || null,
      },
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
      },
    });

    // Mark vehicle as SOLD
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { stockStatus: 'SOLD' },
    });

    // Auto-create Tax Invoice in Accounts
    const subtotal = Math.round(totalAmount / 1.18);
    const taxAmount = totalAmount - subtotal;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        saleId: sale.id,
        type: 'VEHICLE_SALE',
        subtotal,
        taxAmount,
        totalAmount,
        status: paymentStatus === 'COMPLETED' ? 'PAID' : 'PARTIAL',
        notes: `Vehicle Sale Invoice for ${sale.vehicle.brand} ${sale.vehicle.model}`,
      },
    });

    // Record booking payment if any
    if (book > 0) {
      const pCount = await prisma.payment.count();
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${new Date().getFullYear()}-${String(pCount + 101).padStart(4, '0')}`,
          invoiceId: invoice.id,
          customerId,
          amount: book,
          paymentMethod: 'UPI',
          notes: 'Advance booking credit applied to invoice',
          recordedById: user.id,
        },
      });
    }

    await logAudit({
      user,
      action: 'CREATE',
      module: 'SALES',
      recordId: sale.invoiceNumber,
      newValue: `Recorded Sale of ${sale.vehicle.brand} ${sale.vehicle.model} to ${sale.customer.name} (₹${sale.totalAmount})`,
    });

    return NextResponse.json({ success: true, sale, invoice });
  } catch (error: any) {
    console.error('Record sale error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canEdit = await hasPermission('sales', 'edit', user);
    if (!canEdit) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const scope = getRoleScope(user);
    const body = await req.json();
    const { id, paymentStatus, deliveryDate, notes } = body;

    if (!id) return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });

    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Sale record not found' }, { status: 404 });

    if (scope.isSalesExecutive && existing.salespersonId !== user.id) {
      return NextResponse.json({ error: 'Permission denied: Sale is not assigned to you' }, { status: 403 });
    }

    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.sale.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true, phone: true } },
      },
    });

    await logAudit({
      user,
      action: 'UPDATE',
      module: 'SALES',
      recordId: existing.invoiceNumber,
      oldValue: `Payment: ${existing.paymentStatus}`,
      newValue: `Payment: ${updated.paymentStatus}`,
    });

    return NextResponse.json({ success: true, sale: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
