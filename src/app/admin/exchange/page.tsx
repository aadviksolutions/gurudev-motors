'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';

export default function AdminExchangePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Edit / Status state
  const [editStatus, setEditStatus] = useState('NEW');
  const [estimatedValuation, setEstimatedValuation] = useState('');
  const [finalValuation, setFinalValuation] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/exchange?status=${statusFilter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
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
    fetchRequests();
    fetchEmployees();
  }, [statusFilter]);

  const openDetails = (req: any) => {
    setSelectedRequest(req);
    setEditStatus(req.status || 'NEW');
    setEstimatedValuation(req.estimatedValuation ? String(req.estimatedValuation) : '');
    setFinalValuation(req.finalValuation ? String(req.finalValuation) : '');
    setNotes(req.notes || '');
    setAssignedStaffId(req.assignedStaffId || '');
    setInspectionDate(req.inspectionDate ? req.inspectionDate.split('T')[0] : '');
    setFollowUpDate(req.followUpDate ? req.followUpDate.split('T')[0] : '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSaving(true);
    try {
      const res = await fetch('/api/exchange', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: editStatus,
          estimatedValuation: estimatedValuation ? Number(estimatedValuation) : null,
          finalValuation: finalValuation ? Number(finalValuation) : null,
          notes,
          assignedStaffId: assignedStaffId || null,
          inspectionDate: inspectionDate || null,
          followUpDate: followUpDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete exchange request ${number}?`)) return;
    try {
      const res = await fetch(`/api/exchange?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedRequest?.id === id) setSelectedRequest(null);
        fetchRequests();
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
      case 'INSPECTION_SCHEDULED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INSPECTION_COMPLETED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'VALUATION_GIVEN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'NEGOTIATION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CONVERTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
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
              <RefreshCw className="w-6 h-6 text-gm-red" />
              <span>Vehicle Exchange Requests</span>
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Customer trade-in valuations, inspection appointments, and upgrade negotiations.
            </p>
          </div>
          <span className="text-xs text-gm-muted font-bold bg-white px-3 py-1.5 rounded-xl border border-gm-line self-start sm:self-auto">
            Total {requests.length} requests
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
              onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
              placeholder="Search by customer, phone, model, or exchange ID..."
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
              <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
              <option value="INSPECTION_COMPLETED">Inspection Completed</option>
              <option value="VALUATION_GIVEN">Valuation Given</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={fetchRequests}
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
                  <th className="p-3.5">ID / Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Current Bike</th>
                  <th className="p-3.5">Upgrading To</th>
                  <th className="p-3.5">Est / Final Valuation</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      Loading exchange requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      No exchange requests found matching criteria.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-extrabold text-gm-navy block font-mono">
                          {r.exchangeNumber}
                        </span>
                        <span className="text-[10px] text-gm-muted">
                          {formatDate(r.createdAt)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gm-navy block">{r.customerName}</span>
                        <a href={`tel:${r.mobile}`} className="text-gm-red hover:underline text-[11px] block">
                          {r.mobile}
                        </a>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gm-navy block">
                          {r.currentBrand} {r.currentModel}
                        </span>
                        <span className="text-[10px] text-gm-muted">
                          {r.registrationYear} • {Number(r.kmDriven).toLocaleString()} km • {r.condition}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gm-navy">{r.upgradingVehicle}</span>
                      </td>
                      <td className="p-3.5">
                        {r.finalValuation ? (
                          <span className="font-black text-emerald-700 block">
                            {formatCurrency(r.finalValuation)}
                          </span>
                        ) : r.estimatedValuation ? (
                          <span className="font-semibold text-gm-muted block">
                            Est: {formatCurrency(r.estimatedValuation)}
                          </span>
                        ) : (
                          <span className="text-gm-muted italic">Pending quote</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-gm-navy font-medium">
                          {r.assignedStaff?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(r.status)}`}>
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetails(r)}
                            className="p-1.5 rounded-lg border border-gm-line hover:border-gm-navy text-gm-navy transition-colors"
                            title="Edit / Valuation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/91${r.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${r.customerName}, regarding your Gurudev Motors Exchange Request ${r.exchangeNumber} for ${r.currentBrand} ${r.currentModel}:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(r.id, r.exchangeNumber)}
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

      {/* Edit / Valuation Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-gm-line shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-gm-navy text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block">
                  Exchange Processing
                </span>
                <h3 className="text-xl font-black">
                  {selectedRequest.exchangeNumber} — {selectedRequest.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Submitted Specs */}
              <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Current Bike</span>
                  <b className="text-gm-navy">{selectedRequest.currentBrand} {selectedRequest.currentModel}</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Reg Year & KM</span>
                  <b className="text-gm-navy">{selectedRequest.registrationYear} • {selectedRequest.kmDriven} km</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Condition</span>
                  <b className="text-gm-navy">{selectedRequest.condition}</b>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Upgrading To</span>
                  <b className="text-emerald-700">{selectedRequest.upgradingVehicle}</b>
                </div>
              </div>

              {selectedRequest.message && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <b>Customer Note:</b> {selectedRequest.message}
                </div>
              )}

              {/* Valuation & Status Form */}
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Process Status *</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
                      <option value="INSPECTION_COMPLETED">Inspection Completed</option>
                      <option value="VALUATION_GIVEN">Valuation Given</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Assigned Staff</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Estimated Valuation (₹)</label>
                    <input
                      type="number"
                      value={estimatedValuation}
                      onChange={(e) => setEstimatedValuation(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Final Agreed Valuation (₹)</label>
                    <input
                      type="number"
                      value={finalValuation}
                      onChange={(e) => setFinalValuation(e.target.value)}
                      placeholder="e.g. 48000"
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Inspection Date</label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1.5">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Staff Inspection Notes / History</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter valuation details, tyre condition, RC status, customer expectations..."
                    className="w-full p-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gm-line">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-5 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy hover:bg-gm-soft"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Updates'}
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
