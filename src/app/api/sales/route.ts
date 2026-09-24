import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('sales', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        vehicle: true,
        salesperson: { select: { id: true, name: true } },
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
    } = body;

    if (!customerId || !vehicleId || !vehiclePrice) {
      return NextResponse.json({ error: 'Customer, vehicle, and price are required' }, { status: 400 });
    }

    const price = Number(vehiclePrice);
    const disc = Number(discount);
    const exch = Number(exchangeValue);
    const fin = Number(financeAmount);
    const book = Number(bookingAmount);

    const totalAmount = price - disc - exch;
    const balanceAmount = totalAmount - fin - book;

    const count = await prisma.sale.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 43).padStart(4, '0')}`;

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
        balanceAmount: Math.max(0, balanceAmount),
        totalAmount,
        paymentStatus,
        salespersonId: user.id,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
        notes: notes || null,
      },
      include: {
        customer: true,
        vehicle: true,
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
