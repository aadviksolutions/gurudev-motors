'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  Filter,
  Phone,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminFinancePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Edit states
  const [editStatus, setEditStatus] = useState('NEW');
  const [bankPartner, setBankPartner] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emi, setEmi] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/finance?status=${statusFilter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchEmployees();
  }, [statusFilter]);

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setEditStatus(app.status || 'NEW');
    setBankPartner(app.bankPartner || 'HDFC Bank');
    setInterestRate(app.interestRate ? String(app.interestRate) : '9.5');
    setEmi(app.emi ? String(app.emi) : '');
    setNotes(app.notes || '');
    setAssignedStaffId(app.assignedStaffId || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSaving(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApp.id,
          status: editStatus,
          bankPartner,
          interestRate: interestRate ? Number(interestRate) : null,
          emi: emi ? Number(emi) : null,
          notes,
          assignedStaffId: assignedStaffId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete finance application ${number}?`)) return;
    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedApp?.id === id) setSelectedApp(null);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTACTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOCUMENTS_PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SUBMITTED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DISBURSED':
        return 'bg-green-100 text-green-900 border-green-300 font-black';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-gm-red" />
              <span>Two-Wheeler Finance & Loans</span>
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Customer loan applications, bank document processing, approvals, and disbursements.
            </p>
          </div>
          <span className="text-xs text-gm-muted font-bold bg-white px-3 py-1.5 rounded-xl border border-gm-line self-start sm:self-auto">
            Total {applications.length} applications
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
              placeholder="Search by customer, phone, vehicle, or application ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gm-muted hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="DOCUMENTS_PENDING">Documents Pending</option>
              <option value="SUBMITTED">Submitted to Bank</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={fetchApplications}
              className="px-4 py-2.5 rounded-xl bg-gm-navy text-white text-xs font-bold hover:bg-gm-navy-dark transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Application ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Loan / Down Payment</th>
                  <th className="p-3.5">Tenure & Est. EMI</th>
                  <th className="p-3.5">Employment</th>
                  <th className="p-3.5">Bank Partner</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gm-muted">
                      Loading finance applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gm-muted">
                      No finance applications found matching criteria.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-extrabold text-gm-navy block font-mono">
                          {app.applicationNumber}
                        </span>
                        <span className="text-[10px] text-gm-muted">
                          {formatDate(app.createdAt)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gm-navy block">{app.customerName}</span>
                        <a href={`tel:${app.mobile}`} className="text-gm-red hover:underline text-[11px] block">
                          {app.mobile}
                        </a>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gm-navy">{app.vehicleModel}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-gm-navy block">
                          {formatCurrency(app.loanAmount)}
                        </span>
                        {app.downPayment > 0 && (
                          <span className="text-[10px] text-gm-muted">
                            DP: {formatCurrency(app.downPayment)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-emerald-700 block">
                          {app.emi ? `${formatCurrency(app.emi)}/mo` : 'Pending'}
                        </span>
                        <span className="text-[10px] text-gm-muted">
                          {app.preferredTenure} Months
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gm-navy font-semibold block">{app.employmentType}</span>
                        {app.monthlyIncome && (
                          <span className="text-[10px] text-gm-muted">{app.monthlyIncome}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-gm-navy font-semibold">
                          {app.bankPartner || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(app.status)}`}>
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetails(app)}
                            className="p-1.5 rounded-lg border border-gm-line hover:border-gm-navy text-gm-navy transition-colors"
                            title="Edit / Loan Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/91${app.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${app.customerName}, regarding your Gurudev Motors Loan Application ${app.applicationNumber} for ${app.vehicleModel}:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(app.id, app.applicationNumber)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit / Loan Approval Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-gm-line shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-gm-navy text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block">
                  Loan Desk Processing
                </span>
                <h3 className="text-xl font-black">
                  {selectedApp.applicationNumber} — {selectedApp.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Application Snapshot */}
              <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Vehicle</span>
                  <b className="text-gm-navy">{selectedApp.vehicleModel}</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Loan Principal</span>
                  <b className="text-emerald-700">{formatCurrency(selectedApp.loanAmount)}</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Tenure</span>
                  <b className="text-gm-navy">{selectedApp.preferredTenure} Months</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Down Payment</span>
                  <b className="text-gm-navy">{formatCurrency(selectedApp.downPayment || 0)}</b>
                </div>
              </div>

              {selectedApp.message && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <b>Applicant Note:</b> {selectedApp.message}
                </div>
              )}

              {/* Status and Bank Partner Form */}
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Application Status *</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="DOCUMENTS_PENDING">Documents Pending</option>
                      <option value="SUBMITTED">Submitted to Bank</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="DISBURSED">Disbursed</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Bank / NBFC Partner</label>
                    <select
                      value={bankPartner}
                      onChange={(e) => setBankPartner(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-semibold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Hero Fincorp">Hero Fincorp</option>
                      <option value="L&T Finance">L&T Finance</option>
                      <option value="Other Bank">Other Bank</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Sanctioned Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="e.g. 9.5"
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Final Approved Monthly EMI (₹)</label>
                    <input
                      type="number"
                      value={emi}
                      onChange={(e) => setEmi(e.target.value)}
                      placeholder="e.g. 2450"
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Assigned Finance Officer</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-semibold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Finance Notes / Document Status</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter document verification notes, CIBIL score, bank approval reference number..."
                    className="w-full p-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gm-line">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-5 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy hover:bg-gm-soft"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Loan Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
