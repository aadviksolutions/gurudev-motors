'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Building,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCard from '@/components/admin/KpiCard';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminAccountsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'PAYMENTS' | 'EXPENSES'>('INVOICES');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // New Payment state
  const [payCustId, setPayCustId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payTxnRef, setPayTxnRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // New Expense state
  const [expCategory, setExpCategory] = useState('WORKSHOP');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expMethod, setExpMethod] = useState('BANK');

  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const rep = await res.json();
      if (rep.success) setData(rep);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCustId || !payAmount) return;

    setSubmitting(true);
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PAYMENT',
          customerId: payCustId,
          amount: payAmount,
          paymentMethod: payMethod,
          transactionRef: payTxnRef,
          notes: payNotes,
        }),
      });
      setPaymentModalOpen(false);
      setPayAmount('');
      setPayTxnRef('');
      setPayNotes('');
      fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCategory || !expDesc || !expAmount) return;

    setSubmitting(true);
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'EXPENSE',
          category: expCategory,
          description: expDesc,
          amount: expAmount,
          vendorName: expVendor,
          paymentMethod: expMethod,
        }),
      });
      setExpenseModalOpen(false);
      setExpDesc('');
      setExpAmount('');
      setExpVendor('');
      fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Accounts & Financial Ledger
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              GST billing, payments collection, vendor expenses and daily cashier totals for Raipur dealership.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Today's Collections"
              value={formatCurrency(data.summary.todayCollections)}
              sub="Received today in cashier"
              icon={TrendingUp}
              badge="CASHIER"
              badgeColor="bg-emerald-50 text-emerald-700"
            />
            <KpiCard
              label="Total Revenue"
              value={formatCurrency(data.summary.totalRevenue)}
              sub="All invoices issued"
              icon={Receipt}
              badge="GROSS SALES"
              badgeColor="bg-blue-50 text-blue-700"
            />
            <KpiCard
              label="Total Collections"
              value={formatCurrency(data.summary.totalCollected)}
              sub="Payments realized"
              icon={CreditCard}
              badge="BANKED"
              badgeColor="bg-purple-50 text-purple-700"
            />
            <KpiCard
              label="Outstanding Receivables"
              value={formatCurrency(data.summary.outstandingReceivables)}
              sub="Pending balances"
              icon={AlertCircle}
              badge="COLLECT"
              badgeColor="bg-red-50 text-red-700"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gm-line pb-3">
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'INVOICES' ? 'bg-gm-navy text-white shadow-xs' : 'text-gm-muted hover:text-gm-navy'
            }`}
          >
            Invoices ({data?.invoices?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'PAYMENTS' ? 'bg-gm-navy text-white shadow-xs' : 'text-gm-muted hover:text-gm-navy'
            }`}
          >
            Collections & Payments ({data?.payments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'EXPENSES' ? 'bg-gm-navy text-white shadow-xs' : 'text-gm-muted hover:text-gm-navy'
            }`}
          >
            Expenses & Vendors ({data?.expenses?.length || 0})
          </button>
        </div>

        {/* Invoices View */}
        {activeTab === 'INVOICES' && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Taxable Subtotal</th>
                    <th className="p-3.5">GST (18%)</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {data?.invoices?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">{inv.invoiceNumber}</td>
                      <td className="p-3.5 font-bold text-gm-navy">{inv.customer?.name}</td>
                      <td className="p-3.5 text-gm-muted font-bold text-[10px]">{inv.type}</td>
                      <td className="p-3.5 text-gm-navy">{formatCurrency(inv.subtotal)}</td>
                      <td className="p-3.5 text-gm-muted">{formatCurrency(inv.taxAmount)}</td>
                      <td className="p-3.5 font-black text-gm-navy">{formatCurrency(inv.totalAmount)}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-gm-muted">{formatDate(inv.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments View */}
        {activeTab === 'PAYMENTS' && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Reference / Txn</th>
                    <th className="p-3.5">Cashier / Staff</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {data?.payments?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">{p.paymentNumber}</td>
                      <td className="p-3.5 font-bold text-gm-navy">{p.customer?.name}</td>
                      <td className="p-3.5 font-black text-emerald-700">{formatCurrency(p.amount)}</td>
                      <td className="p-3.5 font-bold text-gm-navy">{p.paymentMethod}</td>
                      <td className="p-3.5 font-mono text-gm-muted text-[11px]">{p.transactionRef || '-'}</td>
                      <td className="p-3.5 text-gm-muted font-medium">{p.recordedBy?.name || 'Accounts'}</td>
                      <td className="p-3.5 text-gm-muted">{formatDate(p.paymentDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses View */}
        {activeTab === 'EXPENSES' && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Voucher #</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Vendor / Payee</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {data?.expenses?.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">{e.expenseNumber}</td>
                      <td className="p-3.5 font-bold text-[10px] text-gm-red uppercase">{e.category}</td>
                      <td className="p-3.5 text-gm-navy max-w-sm">{e.description}</td>
                      <td className="p-3.5 font-black text-red-600">-{formatCurrency(e.amount)}</td>
                      <td className="p-3.5 font-semibold text-gm-navy">{e.vendorName || '-'}</td>
                      <td className="p-3.5 font-bold text-gm-muted">{e.paymentMethod}</td>
                      <td className="p-3.5 text-gm-muted">{formatDate(e.expenseDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Record Customer Payment</h3>
                <button onClick={() => setPaymentModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreatePayment} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Select Customer *</label>
                  <select
                    value={payCustId}
                    onChange={(e) => setPayCustId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {data?.invoices?.map((inv: any) => (
                      <option key={inv.customer?.id} value={inv.customer?.id}>
                        {inv.customer?.name} ({inv.customer?.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash Collection</option>
                      <option value="BANK">Bank NEFT / RTGS</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="FINANCE">Finance Disbursement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Transaction Ref / Cheque No.</label>
                  <input
                    type="text"
                    value={payTxnRef}
                    onChange={(e) => setPayTxnRef(e.target.value)}
                    placeholder="e.g. UPI/2026/88921"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="w-1/3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Recording...' : 'Record Payment & Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {expenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Add Dealership Expense</h3>
                <button onClick={() => setExpenseModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Category *</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="WORKSHOP">Workshop & Spares</option>
                      <option value="SHOWROOM">Showroom Maintenance</option>
                      <option value="UTILITIES">Electricity & Utilities</option>
                      <option value="MARKETING">Marketing & Banners</option>
                      <option value="SALARIES">Staff Salaries</option>
                      <option value="MISC">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Expense Description *</label>
                  <input
                    type="text"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Monthly workshop lubricant supplies"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vendor / Payee</label>
                    <input
                      type="text"
                      value={expVendor}
                      onChange={(e) => setExpVendor(e.target.value)}
                      placeholder="e.g. Gulf Oil Depot"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Payment Method</label>
                    <select
                      value={expMethod}
                      onChange={(e) => setExpMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="BANK">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExpenseModalOpen(false)}
                    className="w-1/3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Recording...' : 'Save Expense Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
