import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canView = await hasPermission('accounts', 'view', user);
    if (!canView) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // invoices, payments, expenses, summary

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        sale: { include: { vehicle: true } },
        serviceJobCard: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const payments = await prisma.payment.findMany({
      include: {
        customer: true,
        invoice: true,
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const expenses = await prisma.expense.findMany({
      include: {
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { expenseDate: 'desc' },
    });

    // Calculate Financial KPIs
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const outstandingReceivables = Math.max(0, totalRevenue - totalCollected);

    // Today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollections = payments
      .filter((p) => new Date(p.paymentDate) >= today)
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalCollected,
        totalExpenses,
        outstandingReceivables,
        todayCollections,
      },
      invoices,
      payments,
      expenses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const canCreate = await hasPermission('accounts', 'create', user);
    if (!canCreate) return NextResponse.json({ error: 'Permission denied' }, { status: 403 });

    const body = await req.json();
    const { actionType } = body; // 'PAYMENT' or 'EXPENSE'

    if (actionType === 'PAYMENT') {
      const { invoiceId, customerId, amount, paymentMethod, transactionRef, notes } = body;
      if (!customerId || !amount) {
        return NextResponse.json({ error: 'Customer and amount are required' }, { status: 400 });
      }

      const pCount = await prisma.payment.count();
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(pCount + 101).padStart(4, '0')}`;

      const payment = await prisma.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoiceId || null,
          customerId,
          amount: Number(amount),
          paymentMethod: paymentMethod || 'UPI',
          transactionRef: transactionRef || null,
          notes: notes || null,
          recordedById: user.id,
        },
        include: { customer: true, invoice: true },
      });

      // Update invoice status if fully paid
      if (invoiceId) {
        const inv = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { payments: true },
        });
        if (inv) {
          const paidSoFar = inv.payments.reduce((s, p) => s + p.amount, 0);
          if (paidSoFar >= inv.totalAmount) {
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID' },
            });
          }
        }
      }

      await logAudit({
        user,
        action: 'CREATE',
        module: 'ACCOUNTS',
        recordId: payment.paymentNumber,
        newValue: `Recorded Payment of ₹${payment.amount} (${payment.paymentMethod}) for ${payment.customer.name}`,
      });

      return NextResponse.json({ success: true, payment });
    } else if (actionType === 'EXPENSE') {
      const { category, description, amount, paymentMethod, vendorName } = body;
      if (!category || !description || !amount) {
        return NextResponse.json({ error: 'Category, description and amount are required' }, { status: 400 });
      }

      const expCount = await prisma.expense.count();
      const expenseNumber = `EXP-${new Date().getFullYear()}-${String(expCount + 50).padStart(4, '0')}`;

      const expense = await prisma.expense.create({
        data: {
          expenseNumber,
          category,
          description,
          amount: Number(amount),
          paymentMethod: paymentMethod || 'BANK',
          vendorName: vendorName || null,
          recordedById: user.id,
        },
      });

      await logAudit({
        user,
        action: 'CREATE',
        module: 'ACCOUNTS',
        recordId: expense.expenseNumber,
        newValue: `Recorded Expense ₹${expense.amount} under ${expense.category}: ${expense.description}`,
      });

      return NextResponse.json({ success: true, expense });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
  } catch (error: any) {
    console.error('Accounts action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
