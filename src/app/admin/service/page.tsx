'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, CheckCircle2, Clock, User, FileText, Settings, ShieldAlert } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminServicePage() {
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJc, setSelectedJc] = useState<any | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [complaints, setComplaints] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');
  const [partsTotal, setPartsTotal] = useState('0');
  const [labourTotal, setLabourTotal] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [status, setStatus] = useState('RECEIVED');
  const [technicianName, setTechnicianName] = useState('Suresh Kumar');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobCards = async () => {
    try {
      const res = await fetch('/api/service-jobs');
      const data = await res.json();
      if (data.success) setJobCards(data.jobCards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, []);

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerMobile || !vehicleRegNumber || !vehicleModel) return;

    setSubmitting(true);
    try {
      await fetch('/api/service-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          vehicleRegNumber,
          vehicleModel,
          kmReading: Number(kmReading) || 0,
          complaints,
          inspectionNotes,
          estimateAmount: Number(estimateAmount) || 0,
          partsTotal: Number(partsTotal) || 0,
          labourTotal: Number(labourTotal) || 0,
          discount: Number(discount) || 0,
          status,
          technicianName,
        }),
      });
      setModalOpen(false);
      fetchJobCards();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/service-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchJobCards();
      if (selectedJc?.id === id) {
        setSelectedJc({ ...selectedJc, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stages = [
    'BOOKED',
    'RECEIVED',
    'INSPECTION',
    'ESTIMATE',
    'APPROVED',
    'WORK_IN_PROGRESS',
    'QUALITY_CHECK',
    'READY',
    'DELIVERED',
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Workshop & Job Card Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Service workflow from vehicle receiving to inspection, parts estimation, repair, quality check and delivery.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Card</span>
          </button>
        </div>

        {/* Job Cards Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Job Card #</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Vehicle & Reg Plate</th>
                  <th className="p-3.5">KM</th>
                  <th className="p-3.5">Complaints</th>
                  <th className="p-3.5">Current Stage</th>
                  <th className="p-3.5">Total (₹)</th>
                  <th className="p-3.5">Technician</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gm-muted">Loading job cards...</td>
                  </tr>
                ) : jobCards.length > 0 ? (
                  jobCards.map((jc) => (
                    <tr key={jc.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">{jc.jobCardNumber}</td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block">{jc.customer?.name}</b>
                        <span className="text-gm-muted text-[11px]">{jc.customer?.mobile}</span>
                      </td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block">{jc.vehicleModel}</b>
                        <span className="font-mono text-gm-red font-bold text-[11px]">{jc.vehicleRegNumber}</span>
                      </td>
                      <td className="p-3.5 text-gm-muted">{jc.kmReading} km</td>
                      <td className="p-3.5 text-gm-muted max-w-xs truncate">{jc.complaints || 'Periodic Service'}</td>
                      <td className="p-3.5">
                        <select
                          value={jc.status}
                          onChange={(e) => handleUpdateStatus(jc.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer ${getStatusColor(jc.status)}`}
                        >
                          {stages.map((st) => (
                            <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5 font-black text-gm-navy">
                        {formatCurrency(jc.finalTotal || jc.estimateAmount)}
                      </td>
                      <td className="p-3.5 text-gm-muted font-medium">{jc.technicianName || 'Floor Tech'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedJc(jc)}
                          className="text-xs font-bold text-gm-navy hover:text-gm-red underline"
                        >
                          View Card
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gm-muted">No service job cards active.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Job Card Drawer */}
        {selectedJc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider block">
                    Gurudev Motors Workshop Job Card
                  </span>
                  <h3 className="text-xl font-black text-gm-navy">
                    {selectedJc.jobCardNumber} • {selectedJc.vehicleRegNumber}
                  </h3>
                </div>
                <button onClick={() => setSelectedJc(null)} className="text-gm-muted font-bold">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                <div><b>Customer:</b> {selectedJc.customer?.name} ({selectedJc.customer?.mobile})</div>
                <div><b>Vehicle:</b> {selectedJc.vehicleModel} | KM: {selectedJc.kmReading}</div>
                <div><b>Complaints:</b> {selectedJc.complaints}</div>
                <div><b>Inspection Findings:</b> {selectedJc.inspectionNotes || 'Standard checkup passed.'}</div>
                <div><b>Assigned Technician:</b> {selectedJc.technicianName}</div>
                <div><b>Current Stage:</b> <span className="font-bold text-gm-red">{selectedJc.status}</span></div>

                {selectedJc.parts && selectedJc.parts.length > 0 && (
                  <div className="pt-2">
                    <b>Spare Parts Replaced:</b>
                    <div className="mt-1 border border-gm-line rounded-xl p-2 bg-gm-soft space-y-1">
                      {selectedJc.parts.map((p: any) => (
                        <div key={p.id} className="flex justify-between text-[11px]">
                          <span>{p.partName} (x{p.quantity})</span>
                          <b>{formatCurrency(p.totalPrice)}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gm-line space-y-1 text-xs">
                  <div className="flex justify-between"><span>Parts:</span> <b>{formatCurrency(selectedJc.partsTotal)}</b></div>
                  <div className="flex justify-between"><span>Labour:</span> <b>{formatCurrency(selectedJc.labourTotal)}</b></div>
                  <div className="flex justify-between"><span>GST (18%):</span> <b>{formatCurrency(selectedJc.tax)}</b></div>
                  <div className="flex justify-between text-sm font-black text-gm-navy pt-1 border-t border-gm-line">
                    <span>Total Bill:</span> <span className="text-gm-red">{formatCurrency(selectedJc.finalTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => setSelectedJc(null)}
                  className="w-full bg-gm-navy text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Job Card Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gm-line shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Generate Service Job Card</h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateJobCard} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="Mobile"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle Model *</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Activa 6G"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Registration # *</label>
                    <input
                      type="text"
                      value={vehicleRegNumber}
                      onChange={(e) => setVehicleRegNumber(e.target.value)}
                      placeholder="CG 04 XX 1234"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs uppercase font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Odometer KM</label>
                    <input
                      type="number"
                      value={kmReading}
                      onChange={(e) => setKmReading(e.target.value)}
                      placeholder="e.g. 14500"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Customer Complaints / Issues</label>
                  <textarea
                    value={complaints}
                    onChange={(e) => setComplaints(e.target.value)}
                    placeholder="Rear brake sound, oil change, general wash & lube..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Parts Estimate (₹)</label>
                    <input
                      type="number"
                      value={partsTotal}
                      onChange={(e) => setPartsTotal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Labour Estimate (₹)</label>
                    <input
                      type="number"
                      value={labourTotal}
                      onChange={(e) => setLabourTotal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Technician</label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Generating...' : 'Issue Job Card'}
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
