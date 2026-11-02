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
  RefreshCw,
  Phone,
  ShieldCheck,
  Calendar,
  Car,
  FileText,
  Plus,
  UserPlus,
  Printer,
  ChevronRight,
  Layers,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCard from '@/components/admin/KpiCard';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SALES' | 'WORKSHOP' | 'FINANCE'>('ALL');

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/reports');
      const report = await res.json();
      if (report.success) {
        setData(report);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const userScope = data?.userScope || null;
  const todayDateString = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* Compact Dealership Header & Quick Action Shortcuts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gm-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gm-navy text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              GM
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-gm-navy tracking-tight">
                  {userScope?.userName ? `Welcome, ${userScope.userName}` : 'Dealership Operations'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 text-gm-red border border-red-200">
                  {userScope?.roleName || 'Admin'}
                </span>
              </div>
              <p className="text-xs text-gm-muted mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Raipur Showroom & Workshop</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{todayDateString}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Live Sync
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/leads"
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </Link>

            <Link
              href="/admin/service"
              className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Job Card</span>
            </Link>

            <Link
              href="/admin/customers"
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-gm-muted" />
              <span>Add Customer</span>
            </Link>

            <Link
              href="/admin/reports"
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gm-muted" />
              <span>Reports</span>
            </Link>

            <button
              onClick={loadDashboard}
              disabled={refreshing}
              title="Refresh Live Data"
              className="p-2 rounded-xl border border-gm-line bg-white hover:bg-gm-soft text-gm-navy transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compact KPI Grid (8 Key Metrics) */}
        {loading || !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-24 bg-white rounded-xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Showroom & CRM Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard
                label="Today's Leads"
                value={data.kpis.todaysLeads}
                sub="New enquiries today"
                icon={Users}
                badge="CRM ACTIVE"
                badgeColor="bg-blue-50 text-blue-700"
              />
              <KpiCard
                label="Pending Follow-ups"
                value={data.kpis.pendingFollowups}
                sub={`${data.kpis.overdueFollowups} overdue for contact`}
                icon={Clock}
                badge={data.kpis.overdueFollowups > 0 ? "OVERDUE" : "ON TRACK"}
                badgeColor={data.kpis.overdueFollowups > 0 ? "bg-red-50 text-red-700 font-bold" : "bg-emerald-50 text-emerald-700"}
              />
              <KpiCard
                label="Test Drives"
                value={data.kpis.testRideRequests}
                sub="Active appointments"
                icon={CalendarCheck}
                badge="SALES PIPELINE"
                badgeColor="bg-amber-50 text-amber-700"
              />
              <KpiCard
                label="Vehicles In Stock"
                value={data.kpis.vehiclesInStock}
                sub={`Total fleet: ${data.kpis.totalVehicles} units`}
                icon={Compass}
                badge="READY STOCK"
                badgeColor="bg-emerald-50 text-emerald-700"
              />
            </div>

            {/* Workshop & Revenue Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard
                label="Active Service Jobs"
                value={data.kpis.activeServiceJobs}
                sub={`${data.kpis.delayedServiceJobs} overdue jobs`}
                icon={Wrench}
                badge="WORKSHOP FLOOR"
                badgeColor="bg-indigo-50 text-indigo-700"
              />
              <KpiCard
                label="Today's Sales"
                value={formatCurrency(data.kpis.todaysSales)}
                sub="Delivered & booked"
                icon={BadgeDollarSign}
                badge="SALES"
                badgeColor="bg-emerald-50 text-emerald-700"
              />
              <KpiCard
                label="Today's Collections"
                value={formatCurrency(data.kpis.todaysCollections)}
                sub="Payments received"
                icon={Receipt}
                badge="FINANCE"
                badgeColor="bg-purple-50 text-purple-700"
              />
              <KpiCard
                label="Outstanding Balances"
                value={formatCurrency(data.kpis.outstandingPayments)}
                sub="Total receivables"
                icon={AlertCircle}
                badge="ACCOUNTS"
                badgeColor="bg-rose-50 text-rose-700"
              />
            </div>
          </div>
        )}

        {/* Overdue Follow-ups Alert Banner if any */}
        {data && data.kpis.overdueFollowups > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <b className="text-red-950 font-bold block">
                  Action Required: {data.kpis.overdueFollowups} Customer Follow-up{data.kpis.overdueFollowups > 1 ? 's' : ''} Overdue
                </b>
                <span className="text-red-800">
                  Potential buyers awaiting contact. Action promptly to protect sales conversion.
                </span>
              </div>
            </div>
            <Link
              href="/admin/leads"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
            >
              Contact Leads ↗
            </Link>
          </div>
        )}

        {/* Clean Dashboard Department Tabs */}
        <div className="flex items-center gap-1.5 border-b border-gm-line pb-2 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'SALES', label: 'CRM & Sales Pipeline' },
            { id: 'WORKSHOP', label: 'Workshop & Service' },
            { id: 'FINANCE', label: 'Sales Ledger & Accounts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gm-navy text-white shadow-xs'
                  : 'bg-white text-gm-muted hover:text-gm-navy border border-gm-line'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {data && (
          <div className="space-y-4">
            {/* Lead Pipeline & Inventory Breakdown (Visible on ALL and SALES) */}
            {(activeTab === 'ALL' || activeTab === 'SALES') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Pipeline */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-gm-line shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                        CRM Lead Pipeline Progression
                      </h3>
                      <p className="text-[11px] text-gm-muted">Active leads at each stage of customer journey</p>
                    </div>
                    <Link href="/admin/leads" className="text-xs font-bold text-gm-red hover:underline">
                      Manage ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(data.pipeline).map(([status, count]: [string, any]) => (
                      <div key={status} className="p-3 rounded-xl border border-gm-line/70 bg-gm-soft/40 hover:bg-gm-soft transition-colors">
                        <span className="text-[10px] font-bold text-gm-muted uppercase block truncate mb-1">
                          {status.replace(/_/g, ' ')}
                        </span>
                        <b className="text-lg font-black text-gm-navy">{count}</b>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-gm-line shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider mb-1">
                      Ready Showroom Stock
                    </h3>
                    <p className="text-[11px] text-gm-muted mb-3">
                      Units ready for spot delivery in Raipur
                    </p>

                    <div className="space-y-2">
                      {data.vehicleCategories.map((cat: any) => (
                        <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-xl bg-gm-soft border border-gm-line/60 text-xs">
                          <span className="font-bold text-gm-navy">
                            {cat.category === 'NEW' ? 'New Two-Wheelers' : cat.category === 'PRE_OWNED' ? 'Certified Pre-Owned' : 'Electric (EV)'}
                          </span>
                          <b className="font-black text-gm-red">{cat.count} units</b>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/admin/vehicles"
                    className="mt-3 text-center text-xs font-bold text-gm-navy hover:text-gm-red py-2 rounded-xl border border-gm-line hover:bg-gm-soft transition-colors"
                  >
                    Manage Inventory ↗
                  </Link>
                </div>
              </div>
            )}

            {/* Tables Grid: Leads & Workshop Jobs */}
            {(activeTab === 'ALL' || activeTab === 'SALES' || activeTab === 'WORKSHOP') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Leads */}
                {(activeTab === 'ALL' || activeTab === 'SALES') && (
                  <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
                    <div className="p-3.5 sm:p-4 border-b border-gm-line flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                          Recent Customer Enquiries
                        </h3>
                        <span className="text-[11px] text-gm-muted">Latest CRM enquiries</span>
                      </div>
                      <Link href="/admin/leads" className="text-xs font-bold text-gm-red hover:underline">
                        View All ({data.recentLeads.length})
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5 sm:p-3">Customer</th>
                            <th className="p-2.5 sm:p-3">Vehicle</th>
                            <th className="p-2.5 sm:p-3">Status</th>
                            <th className="p-2.5 sm:p-3">Assigned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gm-line/60">
                          {data.recentLeads.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-5 text-center text-gm-muted">No leads logged.</td>
                            </tr>
                          ) : (
                            data.recentLeads.slice(0, 6).map((lead: any) => (
                              <tr key={lead.id} className="hover:bg-gm-soft/40 transition-colors">
                                <td className="p-2.5 sm:p-3">
                                  <b className="text-gm-navy block">{lead.customerName}</b>
                                  <span className="text-gm-muted text-[10px]">{lead.mobile}</span>
                                </td>
                                <td className="p-2.5 sm:p-3 text-gm-navy font-semibold">{lead.vehicleModel}</td>
                                <td className="p-2.5 sm:p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="p-2.5 sm:p-3 text-gm-muted font-medium">
                                  {lead.assignedTo?.name || 'Unassigned'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Active Service Jobs */}
                {(activeTab === 'ALL' || activeTab === 'WORKSHOP') && (
                  <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
                    <div className="p-3.5 sm:p-4 border-b border-gm-line flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                          Workshop Service Floor
                        </h3>
                        <span className="text-[11px] text-gm-muted">Vehicles currently undergoing service</span>
                      </div>
                      <Link href="/admin/service" className="text-xs font-bold text-gm-red hover:underline">
                        Workshop Ledger ↗
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5 sm:p-3">Job Card #</th>
                            <th className="p-2.5 sm:p-3">Vehicle</th>
                            <th className="p-2.5 sm:p-3">Stage</th>
                            <th className="p-2.5 sm:p-3">Estimate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gm-line/60">
                          {data.recentServiceJobs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-5 text-center text-gm-muted">No active service jobs.</td>
                            </tr>
                          ) : (
                            data.recentServiceJobs.slice(0, 6).map((jc: any) => (
                              <tr key={jc.id} className="hover:bg-gm-soft/40 transition-colors">
                                <td className="p-2.5 sm:p-3">
                                  <b className="text-gm-navy font-mono text-[11px]">{jc.jobCardNumber}</b>
                                  <span className="block text-[10px] text-gm-muted">{jc.customer?.name}</span>
                                </td>
                                <td className="p-2.5 sm:p-3">
                                  <b className="text-gm-navy block">{jc.vehicleModel}</b>
                                  <span className="text-gm-muted text-[10px]">{jc.vehicleRegNumber}</span>
                                </td>
                                <td className="p-2.5 sm:p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(jc.status)}`}>
                                    {jc.status}
                                  </span>
                                </td>
                                <td className="p-2.5 sm:p-3 font-black text-gm-navy">
                                  {formatCurrency(jc.finalTotal || jc.estimateAmount)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sales & Invoices Table (Visible on ALL and FINANCE) */}
            {(activeTab === 'ALL' || activeTab === 'FINANCE') && (
              <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-gm-line flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                      Recent Vehicle Sales & Invoices
                    </h3>
                    <span className="text-[11px] text-gm-muted">Showroom delivery ledger</span>
                  </div>
                  <Link href="/admin/sales" className="text-xs font-bold text-gm-red hover:underline">
                    Full Ledger ↗
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 sm:p-3">Invoice #</th>
                        <th className="p-2.5 sm:p-3">Customer</th>
                        <th className="p-2.5 sm:p-3">Vehicle</th>
                        <th className="p-2.5 sm:p-3">Amount</th>
                        <th className="p-2.5 sm:p-3">Payment</th>
                        <th className="p-2.5 sm:p-3">Executive</th>
                        <th className="p-2.5 sm:p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gm-line/60">
                      {data.recentSales.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-5 text-center text-gm-muted">No sales logged yet.</td>
                        </tr>
                      ) : (
                        data.recentSales.slice(0, 6).map((sale: any) => (
                          <tr key={sale.id} className="hover:bg-gm-soft/40 transition-colors">
                            <td className="p-2.5 sm:p-3 font-mono font-bold text-gm-navy">
                              {sale.invoiceNumber}
                            </td>
                            <td className="p-2.5 sm:p-3 font-bold text-gm-navy">
                              {sale.customer?.name}
                            </td>
                            <td className="p-2.5 sm:p-3 text-gm-navy">
                              {sale.vehicle?.brand} {sale.vehicle?.model}
                            </td>
                            <td className="p-2.5 sm:p-3 font-black text-gm-navy">
                              {formatCurrency(sale.totalAmount)}
                            </td>
                            <td className="p-2.5 sm:p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(sale.paymentStatus)}`}>
                                {sale.paymentStatus}
                              </span>
                            </td>
                            <td className="p-2.5 sm:p-3 text-gm-muted font-medium">
                              {sale.salesperson?.name || '-'}
                            </td>
                            <td className="p-2.5 sm:p-3 text-gm-muted">
                              {formatDate(sale.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Logs if Admin */}
            {data.recentAuditLogs && data.recentAuditLogs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-gm-line flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-gm-navy" />
                      <span>Security & Audit Log Trail</span>
                    </h3>
                    <span className="text-[11px] text-gm-muted">Recent role & data updates</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    System Verified
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 sm:p-3">Timestamp</th>
                        <th className="p-2.5 sm:p-3">User</th>
                        <th className="p-2.5 sm:p-3">Action</th>
                        <th className="p-2.5 sm:p-3">Module</th>
                        <th className="p-2.5 sm:p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gm-line/60">
                      {data.recentAuditLogs.slice(0, 5).map((log: any) => (
                        <tr key={log.id} className="hover:bg-gm-soft/40 transition-colors">
                          <td className="p-2.5 sm:p-3 text-gm-muted font-mono whitespace-nowrap text-[11px]">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="p-2.5 sm:p-3 font-bold text-gm-navy whitespace-nowrap">
                            {log.userName}
                          </td>
                          <td className="p-2.5 sm:p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              log.action === 'CREATE' ? 'bg-blue-50 text-blue-700' :
                              log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700' :
                              log.action === 'DELETE' ? 'bg-red-50 text-red-700' :
                              'bg-purple-50 text-purple-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-2.5 sm:p-3 font-bold text-gm-navy whitespace-nowrap">
                            {log.module}
                          </td>
                          <td className="p-2.5 sm:p-3 text-gm-navy/80 max-w-md truncate text-[11px]">
                            {log.newValue || log.oldValue || 'Audit event recorded'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
