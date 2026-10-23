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
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`/api/leads?status=${statusFilter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
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
    fetchLeads();
    fetchEmployees();
  }, [statusFilter]);

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
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, assignedToId }),
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile || !newVehicle) return;

    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newName,
          mobile: newMobile,
          vehicleModel: newVehicle,
          budget: newBudget,
          source: newSource,
          notes: newNotes,
        }),
      });
      setShowCreateModal(false);
      setNewName('');
      setNewMobile('');
      setNewVehicle('');
      setNewBudget('');
      setNewNotes('');
      fetchLeads();
    } catch (err) {
      console.error(err);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              CRM Lead Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Enquiries received via website, WhatsApp, phone calls, and showroom walk-ins.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
              placeholder="Search by name, mobile, vehicle..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
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
                  <th className="p-3.5">Follow-up Date</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
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
                      <td className="p-3.5 text-gm-muted">
                        {formatDate(lead.followUpDate)}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-xs font-bold text-gm-navy hover:text-gm-red underline"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider block">
                    Lead Details
                  </span>
                  <h3 className="text-xl font-black text-gm-navy">
                    {selectedLead.customerName} ({selectedLead.leadNumber})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gm-muted hover:text-gm-navy text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div><b>Mobile:</b> {selectedLead.mobile}</div>
                <div><b>Email:</b> {selectedLead.email || 'N/A'}</div>
                <div><b>Vehicle Model:</b> {selectedLead.vehicleModel}</div>
                <div><b>Budget / Requirement:</b> {selectedLead.budget || 'N/A'}</div>
                <div><b>Lead Source:</b> {selectedLead.source}</div>
                <div><b>Current Status:</b> {selectedLead.status}</div>
                <div><b>Assigned Executive:</b> {selectedLead.assignedTo?.name || 'Unassigned'}</div>
                <div className="pt-2">
                  <b>Notes & Interaction History:</b>
                  <p className="mt-1 p-3 rounded-xl bg-gm-soft border border-gm-line text-gm-muted leading-relaxed">
                    {selectedLead.notes || 'No notes added yet.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <a
                  href={`tel:${selectedLead.mobile}`}
                  className="flex-1 bg-gm-navy text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Customer</span>
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.customerName}, calling from Gurudev Motors Raipur regarding your enquiry for ${selectedLead.vehicleModel}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1"
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
                <h3 className="text-xl font-black text-gm-navy">Add Walk-in or Phone Lead</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gm-muted hover:text-gm-navy">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle Model *</label>
                    <input
                      type="text"
                      value={newVehicle}
                      onChange={(e) => setNewVehicle(e.target.value)}
                      placeholder="e.g. Hero Splendor, Activa"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Lead Source</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy bg-white"
                    >
                      <option value="WALK_IN">Showroom Walk-in</option>
                      <option value="CALL">Inbound Phone Call</option>
                      <option value="WHATSAPP">WhatsApp Direct</option>
                      <option value="REFERRAL">Customer Referral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Budget / Plan</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. ₹80,000 / Exchange"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Initial Discussion Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Exchange requirement, financing queries..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs focus:outline-none focus:border-gm-navy resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-red hover:bg-gm-red-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Creating...' : 'Save Lead To CRM'}
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
