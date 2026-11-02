'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Printer,
  Share2,
  RefreshCw,
  X,
  Search,
  Filter,
  Users,
  Calendar,
  BadgeDollarSign,
  Wrench,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  Copy,
  Mail,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

type ReportTab = 'overview' | 'leads' | 'sales' | 'service' | 'performance';
type DatePreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL_TIME' | 'CUSTOM';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('ALL_TIME');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [leadsReport, setLeadsReport] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [serviceReport, setServiceReport] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch employees for staff filter
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (err) {
        console.error('Failed to load employees for filter:', err);
      }
    }
    loadEmployees();
  }, []);

  // Handle date preset change
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      setFromDate(yStr);
      setToDate(yStr);
    } else if (preset === 'THIS_WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      setFromDate(startOfWeek.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(startOfMonth.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'ALL_TIME') {
      setFromDate('');
      setToDate('');
    }
  };

  // Build query string
  const buildQueryParams = (type: string) => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (staffFilter && staffFilter !== 'ALL') params.set('staffId', staffFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    return params.toString();
  };

  // Load report data
  const loadActiveReport = async () => {
    try {
      setRefreshing(true);
      const qs = buildQueryParams(activeTab);
      const res = await fetch(`/api/reports?${qs}`);
      const data = await res.json();

      if (activeTab === 'overview') {
        if (data.success) setOverviewData(data);
      } else if (activeTab === 'leads') {
        if (data.success) setLeadsReport(data);
      } else if (activeTab === 'sales') {
        if (data.success) setSalesReport(data);
      } else if (activeTab === 'service') {
        if (data.success) setServiceReport(data);
      } else if (activeTab === 'performance') {
        if (data.success) setPerformanceReport(data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveReport();
  }, [activeTab, datePreset, fromDate, toDate, statusFilter, staffFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadActiveReport();
  };

  const handleClearFilters = () => {
    setDatePreset('ALL_TIME');
    setFromDate('');
    setToDate('');
    setStatusFilter('ALL');
    setStaffFilter('ALL');
    setSearchQuery('');
  };

  // Export to Excel (.xlsx) using xlsx library
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `Gurudev_Motors_${activeTab.toUpperCase()}_Report_${timestamp}.xlsx`;

    if (activeTab === 'leads' && leadsReport?.records) {
      const rows = leadsReport.records.map((r: any) => ({
        'Lead Number': r.leadNumber,
        'Customer Name': r.customerName,
        'Mobile Number': r.mobile,
        'Email Address': r.email || '',
        'Vehicle Model': r.vehicleModel,
        'Budget / Requirement': r.budget || '',
        'Source': r.source,
        'Status': r.status,
        'Assigned Executive': r.assignedTo?.name || 'Unassigned',
        'Follow-up Date': r.followUpDate ? formatDate(r.followUpDate) : '',
        'Created Date': formatDate(r.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    } else if (activeTab === 'sales' && salesReport?.records) {
      const rows = salesReport.records.map((r: any) => ({
        'Invoice Number': r.invoiceNumber,
        'Customer Name': r.customer?.name || '',
        'Customer Mobile': r.customer?.mobile || '',
        'Vehicle': `${r.vehicle?.brand || ''} ${r.vehicle?.model || ''}`.trim(),
        'Vehicle Price (INR)': r.vehiclePrice,
        'Discount (INR)': r.discount,
        'Total Amount (INR)': r.totalAmount,
        'Balance Due (INR)': r.balanceAmount,
        'Payment Status': r.paymentStatus,
        'Sales Executive': r.salesperson?.name || 'Unassigned',
        'Sale Date': formatDate(r.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    } else if (activeTab === 'service' && serviceReport?.records) {
      const rows = serviceReport.records.map((r: any) => ({
        'Job Card Number': r.jobCardNumber,
        'Customer Name': r.customer?.name || '',
        'Customer Mobile': r.customer?.mobile || '',
        'Vehicle Model': r.vehicleModel,
        'Registration Plate': r.vehicleRegNumber,
        'KM Reading': r.kmReading,
        'Stage / Status': r.status,
        'Parts Total (INR)': r.partsTotal,
        'Labour Total (INR)': r.labourTotal,
        'Final Total (INR)': r.finalTotal,
        'Advisor': r.advisor?.name || '',
        'Created Date': formatDate(r.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Service_Jobs');
    } else if (activeTab === 'performance' && performanceReport) {
      const salesRows = (performanceReport.salesPerformance || []).map((s: any) => ({
        'Executive Name': s.name,
        'Email': s.email,
        'Leads Handled': s.leads,
        'Test Drives': s.testDrives,
        'Advance Bookings': s.bookings,
        'Sales Closed': s.salesClosed,
        'Revenue Generated (INR)': s.revenueGenerated,
        'Conversion Rate (%)': `${s.conversionRate}%`,
      }));
      const serviceRows = (performanceReport.servicePerformance || []).map((sv: any) => ({
        'Advisor Name': sv.name,
        'Email': sv.email,
        'Service Appointments': sv.appointments,
        'Job Cards Completed': sv.jobsCompleted,
        'Service Revenue (INR)': sv.revenueGenerated,
      }));
      const wsSales = XLSX.utils.json_to_sheet(salesRows);
      const wsService = XLSX.utils.json_to_sheet(serviceRows);
      XLSX.utils.book_append_sheet(wb, wsSales, 'Sales_Performance');
      XLSX.utils.book_append_sheet(wb, wsService, 'Service_Performance');
    } else {
      // Overview summary export
      const overviewRows = [
        { 'Metric': "Today's Leads", 'Value': overviewData?.kpis?.todaysLeads || 0 },
        { 'Metric': "Pending Follow-ups", 'Value': overviewData?.kpis?.pendingFollowups || 0 },
        { 'Metric': "Vehicles In Stock", 'Value': overviewData?.kpis?.vehiclesInStock || 0 },
        { 'Metric': "Active Service Jobs", 'Value': overviewData?.kpis?.activeServiceJobs || 0 },
        { 'Metric': "Today's Sales (INR)", 'Value': overviewData?.kpis?.todaysSales || 0 },
        { 'Metric': "Today's Collections (INR)", 'Value': overviewData?.kpis?.todaysCollections || 0 },
        { 'Metric': "Outstanding Receivables (INR)", 'Value': overviewData?.kpis?.outstandingPayments || 0 },
      ];
      const ws = XLSX.utils.json_to_sheet(overviewRows);
      XLSX.utils.book_append_sheet(wb, ws, 'Overview');
    }

    XLSX.writeFile(wb, filename);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Gurudev_Motors_${activeTab.toUpperCase()}_Report_${timestamp}.csv`;

    if (activeTab === 'leads' && leadsReport?.records) {
      const headers = ['Lead Number', 'Customer Name', 'Mobile', 'Vehicle', 'Status', 'Executive', 'Created Date'];
      const rows = leadsReport.records.map((r: any) => [
        `"${r.leadNumber}"`,
        `"${r.customerName}"`,
        `"${r.mobile}"`,
        `"${r.vehicleModel}"`,
        `"${r.status}"`,
        `"${r.assignedTo?.name || 'Unassigned'}"`,
        `"${formatDate(r.createdAt)}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    } else if (activeTab === 'sales' && salesReport?.records) {
      const headers = ['Invoice Number', 'Customer', 'Vehicle', 'Total Amount', 'Balance Due', 'Status', 'Date'];
      const rows = salesReport.records.map((r: any) => [
        `"${r.invoiceNumber}"`,
        `"${r.customer?.name || ''}"`,
        `"${r.vehicle?.brand || ''} ${r.vehicle?.model || ''}"`,
        r.totalAmount,
        r.balanceAmount,
        `"${r.paymentStatus}"`,
        `"${formatDate(r.createdAt)}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    } else if (activeTab === 'service' && serviceReport?.records) {
      const headers = ['Job Card Number', 'Customer', 'Vehicle', 'Reg Number', 'Status', 'Final Total', 'Date'];
      const rows = serviceReport.records.map((r: any) => [
        `"${r.jobCardNumber}"`,
        `"${r.customer?.name || ''}"`,
        `"${r.vehicleModel}"`,
        `"${r.vehicleRegNumber}"`,
        `"${r.status}"`,
        r.finalTotal,
        `"${formatDate(r.createdAt)}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    } else {
      csvContent = 'Metric,Value\n' +
        `Today Leads,${overviewData?.kpis?.todaysLeads || 0}\n` +
        `Pending Followups,${overviewData?.kpis?.pendingFollowups || 0}\n` +
        `Vehicles In Stock,${overviewData?.kpis?.vehiclesInStock || 0}\n` +
        `Active Service Jobs,${overviewData?.kpis?.activeServiceJobs || 0}\n` +
        `Today Sales,${overviewData?.kpis?.todaysSales || 0}\n` +
        `Today Collections,${overviewData?.kpis?.todaysCollections || 0}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Trigger Print View (Native PDF / Print layout)
  const handlePrint = () => {
    window.print();
  };

  // Prepare sharing message text
  const shareSummaryText = useMemo(() => {
    const dateRangeLabel = fromDate && toDate ? `${fromDate} to ${toDate}` : 'All Time';
    let text = `*Gurudev Motors Raipur — ${activeTab.toUpperCase()} REPORT*\nPeriod: ${dateRangeLabel}\nGenerated: ${new Date().toLocaleString('en-IN')}\n\n`;

    if (activeTab === 'overview' && overviewData?.kpis) {
      text += `• Today Leads: ${overviewData.kpis.todaysLeads}\n`;
      text += `• Overdue Follow-ups: ${overviewData.kpis.overdueFollowups}\n`;
      text += `• Vehicles In Stock: ${overviewData.kpis.vehiclesInStock}\n`;
      text += `• Active Service Jobs: ${overviewData.kpis.activeServiceJobs}\n`;
      text += `• Today Sales: ${formatCurrency(overviewData.kpis.todaysSales)}\n`;
      text += `• Today Collections: ${formatCurrency(overviewData.kpis.todaysCollections)}\n`;
      text += `• Outstanding Balances: ${formatCurrency(overviewData.kpis.outstandingPayments)}\n`;
    } else if (activeTab === 'leads' && leadsReport?.summary) {
      text += `• Total Filtered Leads: ${leadsReport.summary.totalLeads}\n`;
      text += `• Converted / Booked: ${leadsReport.summary.converted}\n`;
    } else if (activeTab === 'sales' && salesReport?.summary) {
      text += `• Total Sales Count: ${salesReport.summary.totalSales}\n`;
      text += `• Total Revenue: ${formatCurrency(salesReport.summary.totalRevenue)}\n`;
      text += `• Total Balance Due: ${formatCurrency(salesReport.summary.totalBalance)}\n`;
    } else if (activeTab === 'service' && serviceReport?.summary) {
      text += `• Total Job Cards: ${serviceReport.summary.totalJobCards}\n`;
      text += `• Total Workshop Billing: ${formatCurrency(serviceReport.summary.totalAmount)}\n`;
    }
    text += `\nGurudev Motors DMS - Authorized Dealership Report`;
    return text;
  }, [activeTab, overviewData, leadsReport, salesReport, serviceReport, fromDate, toDate]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Printable Executive Report Document Header (visible only when printing) */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="Gurudev Motors"
                className="w-16 h-16 object-contain rounded-lg border border-slate-300 p-0.5"
              />
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  GURUDEV MOTORS
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Authorised Multi-Brand Two-Wheeler Showroom & Workshop Station
                </p>
                <p className="text-[10px] text-slate-600">
                  Mahadevghat Chowk, Raipura, Raipur (C.G.) - 492013 | Phone: +91 7000619808
                </p>
              </div>
            </div>

            <div className="text-right border border-slate-300 p-2.5 rounded-lg bg-slate-50 min-w-[220px]">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                Official Dealership Operations Report
              </span>
              <h2 className="text-sm font-black text-slate-900 uppercase">
                {activeTab === 'overview' ? 'Executive Overview Report' :
                 activeTab === 'leads' ? 'CRM Leads & Pipeline Report' :
                 activeTab === 'sales' ? 'Vehicle Sales & Revenue Report' :
                 activeTab === 'service' ? 'Workshop Floor & Job Cards Report' :
                 'Staff Performance Report'}
              </h2>
              <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
                <div><span className="font-bold">Period:</span> {fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : 'All Time History'}</div>
                <div><span className="font-bold">Generated:</span> {new Date().toLocaleString('en-IN')}</div>
                <div><span className="font-bold">Branch:</span> Raipur Main Dealership</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Header & Report Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-gm-red" />
              Universal Reporting System
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Comprehensive role-scoped analytics, conversion metrics, financial statements, and workshop reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="Print formatted layout or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gm-navy" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download Microsoft Excel XLSX"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download RFC CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-gm-red" />
              <span>Share</span>
            </button>

            <button
              onClick={loadActiveReport}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Report Tab Navigation */}
        <div className="flex gap-1.5 border-b border-gm-line overflow-x-auto pb-2 print:hidden">
          {[
            { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
            { id: 'leads', label: 'CRM Leads & Pipeline', icon: Users },
            { id: 'sales', label: 'Vehicle Sales & Revenue', icon: BadgeDollarSign },
            { id: 'service', label: 'Workshop & Job Cards', icon: Wrench },
            { id: 'performance', label: 'Staff Performance', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ReportTab);
                  setStatusFilter('ALL');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-gm-navy text-white shadow-xs'
                    : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gm-muted'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Comprehensive Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gm-line shadow-xs space-y-3 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black text-gm-navy uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gm-red" />
              Report Parameters & Filters
            </span>

            {/* Date Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL_TIME', label: 'All Time' },
                { id: 'TODAY', label: 'Today' },
                { id: 'YESTERDAY', label: 'Yesterday' },
                { id: 'THIS_WEEK', label: 'This Week' },
                { id: 'THIS_MONTH', label: 'This Month' },
                { id: 'CUSTOM', label: 'Custom Range' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleDatePresetChange(p.id as DatePreset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    datePreset === p.id
                      ? 'bg-gm-red text-white'
                      : 'bg-gm-soft text-gm-navy hover:bg-gm-line/50 border border-gm-line'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* From Date */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gm-muted mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setFromDate(e.target.value);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-gm-soft/30"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gm-muted mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setToDate(e.target.value);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-gm-soft/30"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gm-muted mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gm-line text-xs font-bold focus:outline-none focus:border-gm-navy bg-white"
              >
                <option value="ALL">All Statuses</option>
                {activeTab === 'leads' && (
                  <>
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="TEST_DRIVE">TEST DRIVE</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="LOST">LOST</option>
                  </>
                )}
                {activeTab === 'sales' && (
                  <>
                    <option value="COMPLETED">COMPLETED (Paid)</option>
                    <option value="PARTIAL">PARTIAL (Advance)</option>
                    <option value="UNPAID">UNPAID (Pending)</option>
                  </>
                )}
                {activeTab === 'service' && (
                  <>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="ESTIMATE">ESTIMATE</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="WORK_IN_PROGRESS">WORK IN PROGRESS</option>
                    <option value="QUALITY_CHECK">QUALITY CHECK</option>
                    <option value="READY">READY</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </>
                )}
              </select>
            </div>

            {/* Staff / Executive Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gm-muted mb-1">Staff / Executive</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gm-line text-xs font-bold focus:outline-none focus:border-gm-navy bg-white"
              >
                <option value="ALL">All Staff</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role?.name || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input & Action */}
            <form onSubmit={handleSearchSubmit}>
              <label className="block text-[10px] font-black uppercase text-gm-muted mb-1">Search Record</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, phone, vehicle, ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                />
                <Search className="w-3.5 h-3.5 text-gm-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gm-line/50">
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-gm-muted hover:text-gm-navy px-3 py-1 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={loadActiveReport}
              className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Tab 1: Executive Overview Report */}
        {activeTab === 'overview' && overviewData && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block mb-1">Total Leads In Scope</span>
                <b className="text-2xl font-black text-gm-navy">{overviewData.kpis.todaysLeads}</b>
                <span className="text-xs text-gm-muted block mt-1">Today&apos;s new enquiries</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block mb-1">Overdue Follow-ups</span>
                <b className="text-2xl font-black text-rose-600">{overviewData.kpis.overdueFollowups}</b>
                <span className="text-xs text-gm-muted block mt-1">Pending contact action</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block mb-1">Today&apos;s Vehicle Sales</span>
                <b className="text-2xl font-black text-emerald-600">{formatCurrency(overviewData.kpis.todaysSales)}</b>
                <span className="text-xs text-gm-muted block mt-1">Bookings & spot deliveries</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block mb-1">Workshop Active Jobs</span>
                <b className="text-2xl font-black text-indigo-600">{overviewData.kpis.activeServiceJobs}</b>
                <span className="text-xs text-gm-muted block mt-1">Vehicles on service floor</span>
              </div>
            </div>

            {/* Pipeline Stage Breakdown Table */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  CRM Lead Pipeline Distribution
                </h3>
                <span className="text-xs text-gm-muted">Raipur Showroom</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-5">
                {Object.entries(overviewData.pipeline).map(([st, count]: [string, any]) => (
                  <div key={st} className="p-3 rounded-xl bg-gm-soft border border-gm-line/70">
                    <span className="text-[10px] font-bold text-gm-muted uppercase block">{st.replace('_', ' ')}</span>
                    <b className="text-xl font-black text-gm-navy">{count}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Inventory Fleet Status
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {overviewData.vehicleCategories.map((c: any) => (
                  <div key={c.category} className="p-4 rounded-xl bg-gm-soft border border-gm-line flex items-center justify-between">
                    <div>
                      <b className="text-sm font-bold text-gm-navy block">
                        {c.category === 'NEW' ? 'New Motorcycles & Scooters' : c.category === 'PRE_OWNED' ? 'Certified Pre-Owned' : 'Electric Vehicles (EV)'}
                      </b>
                      <span className="text-xs text-gm-muted">Ready for delivery</span>
                    </div>
                    <span className="text-xl font-black text-gm-red">{c.count} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CRM Leads Report */}
        {activeTab === 'leads' && leadsReport && (
          <div className="space-y-6">
            {/* Summary Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Total Filtered Leads</span>
                <b className="text-2xl font-black text-gm-navy">{leadsReport.totalCount}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Converted / Booked</span>
                <b className="text-2xl font-black text-emerald-600">{leadsReport.summary?.converted || 0}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Conversion Rate</span>
                <b className="text-2xl font-black text-gm-navy">
                  {leadsReport.totalCount > 0 ? Math.round(((leadsReport.summary?.converted || 0) / leadsReport.totalCount) * 100) : 0}%
                </b>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Filtered Lead Records ({leadsReport.records?.length || 0})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Lead #</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Vehicle Model</th>
                      <th className="p-3.5">Source</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Assigned To</th>
                      <th className="p-3.5">Follow-up Date</th>
                      <th className="p-3.5">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {leadsReport.records?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gm-muted">No matching leads found.</td>
                      </tr>
                    ) : (
                      leadsReport.records?.map((lead: any) => (
                        <tr key={lead.id} className="hover:bg-gm-soft/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-gm-navy">{lead.leadNumber}</td>
                          <td className="p-3.5">
                            <b className="text-gm-navy block">{lead.customerName}</b>
                            <span className="text-gm-muted text-[11px]">{lead.mobile}</span>
                          </td>
                          <td className="p-3.5 font-bold text-gm-navy">{lead.vehicleModel}</td>
                          <td className="p-3.5 font-semibold text-gm-muted">{lead.source}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-gm-muted font-medium">{lead.assignedTo?.name || 'Unassigned'}</td>
                          <td className="p-3.5 text-gm-muted">{formatDate(lead.followUpDate)}</td>
                          <td className="p-3.5 text-gm-muted">{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vehicle Sales & Revenue Report */}
        {activeTab === 'sales' && salesReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Total Transactions</span>
                <b className="text-2xl font-black text-gm-navy">{salesReport.summary?.totalSales || 0}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Gross Invoiced Revenue</span>
                <b className="text-2xl font-black text-emerald-600">{formatCurrency(salesReport.summary?.totalRevenue || 0)}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Total Discounts Given</span>
                <b className="text-2xl font-black text-amber-600">{formatCurrency(salesReport.summary?.totalDiscount || 0)}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Outstanding Balances</span>
                <b className="text-2xl font-black text-rose-600">{formatCurrency(salesReport.summary?.totalBalance || 0)}</b>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Sales Transactions Ledger ({salesReport.records?.length || 0})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Vehicle</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Balance Due</th>
                      <th className="p-3.5">Payment Status</th>
                      <th className="p-3.5">Sales Executive</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {salesReport.records?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gm-muted">No sales records matching filter.</td>
                      </tr>
                    ) : (
                      salesReport.records?.map((sale: any) => (
                        <tr key={sale.id} className="hover:bg-gm-soft/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-gm-navy">{sale.invoiceNumber}</td>
                          <td className="p-3.5 font-bold text-gm-navy">{sale.customer?.name}</td>
                          <td className="p-3.5 text-gm-navy font-semibold">{sale.vehicle?.brand} {sale.vehicle?.model}</td>
                          <td className="p-3.5 font-black text-gm-navy">{formatCurrency(sale.totalAmount)}</td>
                          <td className="p-3.5 font-bold text-rose-600">{formatCurrency(sale.balanceAmount)}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(sale.paymentStatus)}`}>
                              {sale.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-gm-muted font-medium">{sale.salesperson?.name || 'Unassigned'}</td>
                          <td className="p-3.5 text-gm-muted">{formatDate(sale.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Workshop Service Report */}
        {activeTab === 'service' && serviceReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Job Cards Generated</span>
                <b className="text-2xl font-black text-gm-navy">{serviceReport.summary?.totalJobCards || 0}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Parts Total</span>
                <b className="text-2xl font-black text-gm-navy">{formatCurrency(serviceReport.summary?.totalParts || 0)}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Labour Charges</span>
                <b className="text-2xl font-black text-gm-navy">{formatCurrency(serviceReport.summary?.totalLabour || 0)}</b>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs">
                <span className="text-[10px] font-black uppercase text-gm-muted block">Total Service Billing</span>
                <b className="text-2xl font-black text-emerald-600">{formatCurrency(serviceReport.summary?.totalAmount || 0)}</b>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Workshop Floor Job Cards ({serviceReport.records?.length || 0})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Job Card #</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Vehicle & Reg Plate</th>
                      <th className="p-3.5">Stage</th>
                      <th className="p-3.5">Parts Total</th>
                      <th className="p-3.5">Labour Total</th>
                      <th className="p-3.5">Final Total</th>
                      <th className="p-3.5">Service Advisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {serviceReport.records?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gm-muted">No workshop records matching filter.</td>
                      </tr>
                    ) : (
                      serviceReport.records?.map((jc: any) => (
                        <tr key={jc.id} className="hover:bg-gm-soft/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-gm-navy">{jc.jobCardNumber}</td>
                          <td className="p-3.5">
                            <b className="text-gm-navy block">{jc.customer?.name}</b>
                            <span className="text-gm-muted text-[11px]">{jc.customer?.mobile}</span>
                          </td>
                          <td className="p-3.5">
                            <b className="text-gm-navy block">{jc.vehicleModel}</b>
                            <span className="text-gm-muted text-[11px]">{jc.vehicleRegNumber}</span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(jc.status)}`}>
                              {jc.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-gm-navy font-semibold">{formatCurrency(jc.partsTotal)}</td>
                          <td className="p-3.5 text-gm-navy font-semibold">{formatCurrency(jc.labourTotal)}</td>
                          <td className="p-3.5 font-black text-gm-navy">{formatCurrency(jc.finalTotal)}</td>
                          <td className="p-3.5 text-gm-muted font-medium">{jc.advisor?.name || 'Unassigned'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Executive Performance Report */}
        {activeTab === 'performance' && performanceReport && (
          <div className="space-y-6">
            {/* Sales Team Performance */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    Sales Executives & Managers Performance
                  </h3>
                  <span className="text-xs text-gm-muted">Leads conversion and revenue generation breakdown</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Executive</th>
                      <th className="p-3.5 text-center">Leads Handled</th>
                      <th className="p-3.5 text-center">Test Rides</th>
                      <th className="p-3.5 text-center">Bookings</th>
                      <th className="p-3.5 text-center">Sales Closed</th>
                      <th className="p-3.5">Revenue Generated</th>
                      <th className="p-3.5 text-center">Conversion %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {(performanceReport.salesPerformance || []).map((s: any) => (
                      <tr key={s.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{s.name}</b>
                          <span className="text-gm-muted text-[11px]">{s.email}</span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-gm-navy">{s.leads}</td>
                        <td className="p-3.5 text-center font-bold text-gm-navy">{s.testDrives}</td>
                        <td className="p-3.5 text-center font-bold text-gm-navy">{s.bookings}</td>
                        <td className="p-3.5 text-center font-black text-emerald-600">{s.salesClosed}</td>
                        <td className="p-3.5 font-black text-gm-navy">{formatCurrency(s.revenueGenerated)}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {s.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service Advisors Performance */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gm-line flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    Service Advisors & Workshop Performance
                  </h3>
                  <span className="text-xs text-gm-muted">Service appointments, job cards, and floor turnover</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Service Advisor</th>
                      <th className="p-3.5 text-center">Appointments Handled</th>
                      <th className="p-3.5 text-center">Job Cards Completed</th>
                      <th className="p-3.5">Total Service Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {(performanceReport.servicePerformance || []).map((sv: any) => (
                      <tr key={sv.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{sv.name}</b>
                          <span className="text-gm-muted text-[11px]">{sv.email}</span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-gm-navy">{sv.appointments}</td>
                        <td className="p-3.5 text-center font-black text-indigo-600">{sv.jobsCompleted}</td>
                        <td className="p-3.5 font-black text-gm-navy">{formatCurrency(sv.revenueGenerated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Printable Formal Document Sign-Off & Footer (Visible only when printing) */}
        <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-900 text-[10px] text-slate-700">
          <div className="grid grid-cols-3 gap-8 pt-8 mb-6 text-center">
            <div className="border-t border-slate-400 pt-1.5">
              <span className="font-bold uppercase block text-slate-900">Prepared By</span>
              <span className="text-[9px] text-slate-500">System Operator / DMS User</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <span className="font-bold uppercase block text-slate-900">Verified By</span>
              <span className="text-[9px] text-slate-500">Accounts & Operations Head</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <span className="font-bold uppercase block text-slate-900">Authorised Signatory</span>
              <span className="text-[9px] text-slate-500">Dealer Principal / GM Motors</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-300 pt-2">
            <span>Official Dealership Management System • Gurudev Motors Raipur</span>
            <span>Confidential — Dealership Business Intelligence Report</span>
            <span>Ref: GM-RPT-{activeTab.toUpperCase()}-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        {/* Global Print Stylesheet for Report */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-size: 11px !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 10px !important;
            }
            th, td {
              border: 1px solid #cbd5e1 !important;
              padding: 6px 8px !important;
            }
            thead th {
              background-color: #f1f5f9 !important;
              color: #0f172a !important;
              font-weight: 800 !important;
              text-transform: uppercase !important;
            }
            tr {
              page-break-inside: avoid !important;
            }
            .bg-white, .bg-gm-soft {
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}</style>

        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-gm-red" />
                  <h3 className="text-lg font-black text-gm-navy">Share {activeTab.toUpperCase()} Report</h3>
                </div>
                <button onClick={() => setShareModalOpen(false)} className="text-gm-muted hover:text-gm-navy font-bold">
                  ✕
                </button>
              </div>

              <p className="text-xs text-gm-muted">
                Share verified dealership metrics with management, partners or auditors via WhatsApp or Email.
              </p>

              {/* Message preview */}
              <div className="p-3.5 rounded-xl bg-gm-soft border border-gm-line/80 font-mono text-[11px] text-gm-navy whitespace-pre-wrap max-h-48 overflow-y-auto">
                {shareSummaryText}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareSummaryText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                {/* Email button */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Gurudev Motors - ${activeTab.toUpperCase()} Report`)}&body=${encodeURIComponent(shareSummaryText)}`}
                  className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Report</span>
                </a>

                {/* Copy button */}
                <button
                  onClick={handleCopyShare}
                  className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors bg-white"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
