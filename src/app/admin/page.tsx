'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Compass,
  CalendarCheck,
  BadgeDollarSign,
  Wrench,
  Receipt,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCard from '@/components/admin/KpiCard';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/reports');
        const report = await res.json();
        if (report.success) {
          setData(report);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gm-navy tracking-tight">
              Dealership Operations Hub
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Real-time summary of leads, vehicle sales, service jobs and collections at Gurudev Motors Raipur.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/leads"
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>CRM Leads</span>
            </Link>
            <Link
              href="/admin/service"
              className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-4 py-2.5 rounded-xl bg-white transition-colors"
            >
              New Job Card ↗
            </Link>
          </div>
        </div>

        {/* 7 Core KPI Cards */}
        {loading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Today's Leads"
              value={data.kpis.todaysLeads}
              sub="From website & walk-in"
              icon={Users}
              badge="CRM ACTIVE"
              badgeColor="bg-blue-50 text-blue-700"
            />
            <KpiCard
              label="Pending Follow-ups"
              value={data.kpis.pendingFollowups}
              sub="Due for contact today"
              icon={Clock}
              badge="ACTION REQ"
              badgeColor="bg-amber-50 text-amber-700"
            />
            <KpiCard
              label="Vehicles In Stock"
              value={data.kpis.vehiclesInStock}
              sub="New, EV & Pre-owned"
              icon={Compass}
              badge="READY"
              badgeColor="bg-emerald-50 text-emerald-700"
            />
            <KpiCard
              label="Active Service Jobs"
              value={data.kpis.activeServiceJobs}
              sub="On workshop floor"
              icon={Wrench}
              badge="WORKSHOP"
              badgeColor="bg-indigo-50 text-indigo-700"
            />
            <KpiCard
              label="Today's Sales"
              value={formatCurrency(data.kpis.todaysSales)}
              sub="Vehicle bookings & deliveries"
              icon={BadgeDollarSign}
              badge="SALES"
              badgeColor="bg-emerald-50 text-emerald-700"
            />
            <KpiCard
              label="Today's Collections"
              value={formatCurrency(data.kpis.todaysCollections)}
              sub="UPI, Cash, Bank received"
              icon={Receipt}
              badge="FINANCE"
              badgeColor="bg-purple-50 text-purple-700"
            />
            <KpiCard
              label="Outstanding Balances"
              value={formatCurrency(data.kpis.outstandingPayments)}
              sub="Receivables to collect"
              icon={AlertCircle}
              badge="ACCOUNTS"
              badgeColor="bg-red-50 text-red-700"
            />
          </div>
        )}

        {/* Lead Pipeline & Inventory Distribution Charts */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lead Pipeline Bar */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gm-line shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    CRM Lead Pipeline Stages
                  </h3>
                  <p className="text-xs text-gm-muted mt-0.5">
                    Conversion tracking from website lead to customer vehicle delivery.
                  </p>
                </div>
                <Link href="/admin/leads" className="text-xs font-bold text-gm-red hover:underline">
                  Manage Pipeline ↗
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Object.entries(data.pipeline).map(([status, count]: [string, any]) => (
                  <div key={status} className="p-3.5 rounded-xl border border-gm-line/70 bg-gm-soft/40">
                    <span className="text-[10px] font-bold text-gm-muted uppercase block mb-1">
                      {status.replace('_', ' ')}
                    </span>
                    <b className="text-xl font-black text-gm-navy">{count}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Categories Count */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gm-line shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider mb-1">
                  Inventory Stock Breakdown
                </h3>
                <p className="text-xs text-gm-muted mb-4">
                  Distribution of showroom vehicles.
                </p>

                <div className="space-y-3">
                  {data.vehicleCategories.map((cat: any) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 rounded-xl bg-gm-soft border border-gm-line/60">
                      <span className="text-xs font-bold text-gm-navy">
                        {cat.category === 'NEW' ? 'New Two-Wheelers' : cat.category === 'PRE_OWNED' ? 'Certified Pre-Owned' : 'Electric (EV)'}
                      </span>
                      <b className="text-sm font-black text-gm-red">{cat.count} units</b>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/admin/vehicles"
                className="mt-4 text-center text-xs font-bold text-gm-navy hover:text-gm-red py-2 rounded-xl border border-gm-line hover:bg-gm-soft transition-colors"
              >
                Add / Update Vehicles ↗
              </Link>
            </div>
          </div>
        )}

        {/* Tables Grid: Recent Leads & Recent Service Jobs */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    Recent Leads
                  </h3>
                  <span className="text-xs text-gm-muted">Latest enquiries received</span>
                </div>
                <Link href="/admin/leads" className="text-xs font-bold text-gm-red hover:underline">
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gm-line/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {data.recentLeads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3">
                          <b className="text-gm-navy block">{lead.customerName}</b>
                          <span className="text-gm-muted text-[11px]">{lead.mobile}</span>
                        </td>
                        <td className="p-3 text-gm-navy font-semibold">{lead.vehicleModel}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-3 text-gm-muted font-medium">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Service Jobs */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    Workshop Service Jobs
                  </h3>
                  <span className="text-xs text-gm-muted">Vehicles currently being serviced</span>
                </div>
                <Link href="/admin/service" className="text-xs font-bold text-gm-red hover:underline">
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gm-line/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Job Card</th>
                      <th className="p-3">Vehicle & Reg</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Estimate / Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {data.recentServiceJobs.map((jc: any) => (
                      <tr key={jc.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3">
                          <b className="text-gm-navy font-mono">{jc.jobCardNumber}</b>
                          <span className="block text-[11px] text-gm-muted">{jc.customer?.name}</span>
                        </td>
                        <td className="p-3">
                          <b className="text-gm-navy block">{jc.vehicleModel}</b>
                          <span className="text-gm-muted text-[11px]">{jc.vehicleRegNumber}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(jc.status)}`}>
                            {jc.status}
                          </span>
                        </td>
                        <td className="p-3 font-black text-gm-navy">
                          {formatCurrency(jc.finalTotal || jc.estimateAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sales & Invoices */}
        {data && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gm-line flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Recent Vehicle Sales & Invoices
                </h3>
                <span className="text-xs text-gm-muted">Verified sales transactions</span>
              </div>
              <Link href="/admin/sales" className="text-xs font-bold text-gm-red hover:underline">
                Sales Ledger ↗
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Vehicle Delivered</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5">Sales Executive</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {data.recentSales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">
                        {sale.invoiceNumber}
                      </td>
                      <td className="p-3.5 font-bold text-gm-navy">
                        {sale.customer?.name}
                      </td>
                      <td className="p-3.5 text-gm-navy">
                        {sale.vehicle?.brand} {sale.vehicle?.model}
                      </td>
                      <td className="p-3.5 font-black text-gm-navy">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(sale.paymentStatus)}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-gm-muted font-medium">
                        {sale.salesperson?.name || '-'}
                      </td>
                      <td className="p-3.5 text-gm-muted">
                        {formatDate(sale.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
