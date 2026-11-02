'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  UserPlus,
  MessageSquare,
  RefreshCw,
  CalendarCheck,
  History,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatDate, formatDateTime, getStatusColor } from '@/lib/utils';

// Helper to format Date or ISO string safely in local timezone YYYY-MM-DD
function toLocalDateInputValue(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get tomorrow's date string YYYY-MM-DD
function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateInputValue(tomorrow);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Lead Form state
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newSource, setNewSource] = useState('WALK_IN');
  const [newNotes, setNewNotes] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState(getTomorrowDateString());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Follow-up interaction form in Details modal
  const [followUpNote, setFollowUpNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);

  const fetchLeads = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        // Filter to sales staff
        const salesStaff = data.employees.filter((e: any) =>
          ['SALES_EXECUTIVE', 'SALES_MANAGER', 'MAIN_ADMIN'].includes(e.role?.code)
        );
        setEmployees(salesStaff);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchLeads();
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignEmployee = async (id: string, assignedToId: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, assignedToId: assignedToId || null }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to reassign lead');
      }
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!nextFollowUpDate) {
      alert('Please select the Next Follow-up Date');
      return;
    }

    setUpdatingFollowUp(true);
    try {
      const now = new Date();
      // System generated date & time when the followup is being recorded
      const recordedDateTime = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Selected next follow-up date
      const nextDateObj = new Date(nextFollowUpDate);
      const formattedNextDate = nextDateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const noteText = followUpNote.trim() || 'Follow-up discussion logged';
      const logHeader = `[Follow-up Taken: ${recordedDateTime} | Next Follow-up: ${formattedNextDate}]`;
      const newEntry = `${logHeader} ${noteText}`;

      const updatedNotes = selectedLead.notes
        ? `${selectedLead.notes}\n${newEntry}`
        : newEntry;

      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          notes: updatedNotes,
          followUpNotes: `${noteText} (Next Follow-up: ${formattedNextDate})`,
          followUpDate: nextFollowUpDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedLead(data.lead);
        setFollowUpNote('');
        fetchLeads();
      } else {
        alert(data.error || 'Failed to update follow-up');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingFollowUp(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile || !newVehicle) {
      setErrorMsg('Please enter customer name, phone, and vehicle model');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newName.trim(),
          mobile: newMobile.trim(),
          vehicleModel: newVehicle.trim(),
          budget: newBudget.trim(),
          source: newSource,
          notes: newNotes.trim(),
          followUpDate: newFollowUpDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewName('');
        setNewMobile('');
        setNewVehicle('');
        setNewBudget('');
        setNewNotes('');
        setNewFollowUpDate(getTomorrowDateString());
        fetchLeads();
      } else {
        setErrorMsg(data.error || 'Failed to create lead');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    'ALL',
    'NEW',
    'CONTACTED',
    'INTERESTED',
    'TEST_DRIVE',
    'NEGOTIATION',
    'BOOKED',
    'DELIVERED',
    'LOST',
  ];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-gm-red" />
              CRM Lead Management & Pipeline
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Enquiries received via website, WhatsApp, phone calls, and showroom walk-ins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setErrorMsg('');
                setNewFollowUpDate(getTomorrowDateString());
                setShowCreateModal(true);
              }}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, vehicle..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-gm-navy text-white'
                    : 'bg-gm-soft text-gm-navy hover:bg-gm-line/50 border border-gm-line'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Lead #</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Vehicle Model</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Assigned Salesperson</th>
                  <th className="p-3.5">Next Follow-up Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">No leads found matching filter.</td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const leadDate = lead.followUpDate ? new Date(lead.followUpDate) : null;
                    const isClosed = ['DELIVERED', 'LOST', 'CLOSED', 'BOOKED'].includes(lead.status);
                    const isOverdue = leadDate && leadDate < now && !isClosed;
                    const isToday =
                      leadDate &&
                      leadDate >= now &&
                      leadDate < tomorrow &&
                      !isClosed;

                    // Latest recorded followup
                    const lastFollowUp = lead.followUps?.[0];

                    return (
                      <tr key={lead.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gm-navy">
                          {lead.leadNumber}
                        </td>
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{lead.customerName}</b>
                          <a href={`tel:${lead.mobile}`} className="text-gm-muted hover:text-gm-red text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gm-red" />
                            {lead.mobile}
                          </a>
                        </td>
                        <td className="p-3.5 font-bold text-gm-navy">
                          {lead.vehicleModel}
                          {lead.budget && (
                            <span className="block text-[10px] text-gm-muted font-normal">
                              Budget: {lead.budget}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-gm-muted font-bold text-[10px]">
                          {lead.source}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer ${getStatusColor(lead.status)}`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="INTERESTED">INTERESTED</option>
                            <option value="TEST_DRIVE">TEST DRIVE</option>
                            <option value="NEGOTIATION">NEGOTIATION</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="LOST">LOST</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={lead.assignedToId || ''}
                            onChange={(e) => handleAssignEmployee(lead.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gm-line text-xs font-medium text-gm-navy bg-white focus:outline-none"
                          >
                            <option value="">-- Unassigned --</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name} ({emp.role?.name})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5">
                          {lead.followUpDate ? (
                            <div>
                              <span className="text-gm-navy font-bold text-xs block">
                                {formatDate(lead.followUpDate)}
                              </span>
                              {isOverdue ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 mt-0.5 uppercase">
                                  Overdue
                                </span>
                              ) : isToday ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 mt-0.5 uppercase">
                                  Due Today
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5 uppercase">
                                  Scheduled
                                </span>
                              )}
                              {lastFollowUp && (
                                <span className="block text-[10px] text-gm-muted mt-0.5" title={`Follow-up taken on ${formatDateTime(lastFollowUp.createdAt)}`}>
                                  Taken: {formatDate(lastFollowUp.createdAt)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gm-muted text-xs">Not scheduled</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              // Default Next Follow-up Date to tomorrow or lead's future scheduled date
                              const tomorrowStr = getTomorrowDateString();
                              if (lead.followUpDate) {
                                const fDate = new Date(lead.followUpDate);
                                const todayMidnight = new Date();
                                todayMidnight.setHours(0, 0, 0, 0);
                                if (fDate > todayMidnight) {
                                  setNextFollowUpDate(toLocalDateInputValue(fDate));
                                } else {
                                  setNextFollowUpDate(tomorrowStr);
                                }
                              } else {
                                setNextFollowUpDate(tomorrowStr);
                              }
                              setFollowUpNote('');
                            }}
                            className="text-xs font-bold text-gm-navy hover:text-gm-red underline cursor-pointer"
                          >
                            Details & Log ↗
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Details & Follow-up History Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gm-line shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider block">
                    Lead Details & Follow-up History
                  </span>
                  <h3 className="text-xl font-black text-gm-navy">
                    {selectedLead.customerName} ({selectedLead.leadNumber})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gm-muted hover:text-gm-navy text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Customer & Lead Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-gm-line">
                <div><b>Mobile:</b> {selectedLead.mobile}</div>
                <div><b>Email:</b> {selectedLead.email || 'N/A'}</div>
                <div><b>Vehicle Model:</b> {selectedLead.vehicleModel}</div>
                <div><b>Budget:</b> {selectedLead.budget || 'N/A'}</div>
                <div><b>Lead Source:</b> {selectedLead.source}</div>
                <div><b>Current Status:</b> {selectedLead.status}</div>
                <div><b>Executive:</b> {selectedLead.assignedTo?.name || 'Unassigned'}</div>
                <div>
                  <b>Next Follow-up Date:</b>{' '}
                  <span className="font-bold text-gm-red">
                    {selectedLead.followUpDate ? formatDate(selectedLead.followUpDate) : 'Not scheduled'}
                  </span>
                </div>
              </div>

              {/* Structured Follow-up Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-gm-navy flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gm-red" />
                    <span>Follow-up History & Logs</span>
                  </h4>
                  {selectedLead.followUps && selectedLead.followUps.length > 0 && (
                    <span className="text-[10px] font-bold text-gm-muted">
                      {selectedLead.followUps.length} follow-up{selectedLead.followUps.length > 1 ? 's' : ''} recorded
                    </span>
                  )}
                </div>

                {selectedLead.followUps && selectedLead.followUps.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedLead.followUps.map((fu: any, idx: number) => (
                      <div
                        key={fu.id || idx}
                        className="p-3 rounded-xl bg-slate-50 border border-gm-line text-xs space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between text-[11px] gap-2">
                          <span className="font-black text-gm-navy flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gm-red inline-block" />
                            Follow-up Taken: {formatDateTime(fu.createdAt)}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Next Follow-up: {formatDate(fu.scheduledDate)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                          {fu.notes}
                        </p>
                        {fu.user && (
                          <span className="block text-[10px] text-gm-muted">
                            Recorded by: <b>{fu.user.name}</b>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-gm-soft text-center text-xs text-gm-muted">
                    No formal follow-up logs recorded yet.
                  </div>
                )}
              </div>

              {/* Cumulative Raw Notes (toggleable) */}
              {selectedLead.notes && (
                <details className="text-xs group border border-gm-line rounded-xl p-2.5 bg-gm-soft/30">
                  <summary className="font-bold text-gm-muted hover:text-gm-navy cursor-pointer list-none flex items-center justify-between text-[11px]">
                    <span>View Cumulative Notes History</span>
                    <span className="text-[10px] font-bold text-gm-muted">Click to toggle</span>
                  </summary>
                  <div className="mt-2 p-2.5 rounded-lg bg-white border border-gm-line text-gm-navy font-mono text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedLead.notes}
                  </div>
                </details>
              )}

              {/* Log New Follow-up Form */}
              <form onSubmit={handleRecordFollowUp} className="space-y-3 pt-3 border-t border-gm-line">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-gm-navy">
                    Log New Follow-up & Schedule Next Date
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    System Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">
                    Follow-up Discussion Notes / Remarks *
                  </label>
                  <textarea
                    rows={2}
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="e.g. Spoke with customer, customer interested in test drive, agreed to call back on..."
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">
                      Next Follow-up Date *
                    </label>
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      min={getTomorrowDateString()}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={updatingFollowUp}
                      className="w-full bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>{updatingFollowUp ? 'Saving...' : 'Save & Schedule Next'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Contact Actions */}
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${selectedLead.mobile}`}
                  className="flex-1 bg-gm-navy text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Customer</span>
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.customerName}, calling from Gurudev Motors Raipur regarding your enquiry for ${selectedLead.vehicleModel}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Create Lead Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Add New Enquiry / Lead</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gm-muted hover:text-gm-navy text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Alok Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      placeholder="e.g. 9827012345"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle Model *</label>
                    <input
                      type="text"
                      value={newVehicle}
                      onChange={(e) => setNewVehicle(e.target.value)}
                      placeholder="e.g. Hero Splendor+ XTEC"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Lead Source</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="WALK_IN">Showroom Walk-in</option>
                      <option value="WEBSITE">Website Enquiry</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="REFERRAL">Customer Referral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Budget / Requirement</label>
                    <input
                      type="text"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="e.g. ₹85,000 / Cash"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Next Follow-up Date *</label>
                  <input
                    type="date"
                    value={newFollowUpDate}
                    min={getTomorrowDateString()}
                    onChange={(e) => setNewFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Initial Notes</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Customer requirements, preferred colors..."
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-red hover:bg-gm-red-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Create Lead'}
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
