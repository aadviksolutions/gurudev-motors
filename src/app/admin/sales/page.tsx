'use client';

import React, { useState, useEffect } from 'react';
import {
  BadgeDollarSign,
  Plus,
  Search,
  Calendar,
  FileText,
  CheckCircle2,
  User,
  Car,
  Printer,
  RefreshCw,
  Phone,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  // New Sale Form
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [exchangeValue, setExchangeValue] = useState('0');
  const [financeAmount, setFinanceAmount] = useState('0');
  const [bookingAmount, setBookingAmount] = useState('0');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('COMPLETED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSales = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) setSales(data.sales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [cRes, vRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles?all=true'),
      ]);
      const cData = await cRes.json();
      const vData = await vRes.json();
      if (cData.success) setCustomers(cData.customers);
      if (vData.success) setVehicles(vData.vehicles);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchLookups();
  }, []);

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const selected = vehicles.find((v) => v.id === vId);
    if (selected) {
      setVehiclePrice(String(selected.offerPrice || selected.price));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !vehicleId || !vehiclePrice) return;

    setSubmitting(true);
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          vehicleId,
          vehiclePrice,
          discount,
          exchangeValue,
          financeAmount,
          bookingAmount,
          deliveryDate,
          paymentStatus,
          notes,
        }),
      });
      setModalOpen(false);
      fetchSales();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDeliveryStatus = async (saleId: string, newStatus: string) => {
    try {
      await fetch('/api/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: saleId,
          paymentStatus: newStatus,
        }),
      });
      fetchSales();
      if (selectedSale?.id === saleId) {
        setSelectedSale({ ...selectedSale, paymentStatus: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calcNet = () => {
    const p = Number(vehiclePrice) || 0;
    const d = Number(discount) || 0;
    const ex = Number(exchangeValue) || 0;
    return p - d - ex;
  };

  const calcBal = () => {
    const net = calcNet();
    const f = Number(financeAmount) || 0;
    const b = Number(bookingAmount) || 0;
    return Math.max(0, net - f - b);
  };

  const filteredSales = sales.filter((s) => {
    if (statusFilter !== 'ALL' && s.paymentStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchInv = s.invoiceNumber?.toLowerCase().includes(q);
      const matchCust = s.customer?.name?.toLowerCase().includes(q) || s.customer?.mobile?.includes(q);
      const matchVeh = s.vehicle?.model?.toLowerCase().includes(q) || s.vehicle?.brand?.toLowerCase().includes(q);
      return matchInv || matchCust || matchVeh;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <BadgeDollarSign className="w-6 h-6 text-gm-red" />
              Vehicle Sales & Delivery Ledger
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Record quotations, booking advances, financing values, discounts, and vehicle delivery notes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSales}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Vehicle Sale</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice #, customer, vehicle..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
            <Search className="w-4 h-4 text-gm-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'COMPLETED', 'PARTIAL', 'UNPAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                  statusFilter === st
                    ? 'bg-gm-navy text-white'
                    : 'bg-gm-soft text-gm-navy hover:bg-gm-line/50 border border-gm-line'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Base Price</th>
                  <th className="p-3.5">Discount / Exch</th>
                  <th className="p-3.5">Net Payable</th>
                  <th className="p-3.5">Balance Due</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Delivery Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gm-muted">Loading sales records...</td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gm-muted">No sales matching filter.</td>
                  </tr>
                ) : (
                  filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">{s.invoiceNumber}</td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block">{s.customer?.name}</b>
                        <span className="text-[11px] text-gm-muted">{s.customer?.mobile}</span>
                      </td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block">{s.vehicle?.brand} {s.vehicle?.model}</b>
                        <span className="text-[10px] text-gm-muted">{s.vehicle?.category}</span>
                      </td>
                      <td className="p-3.5 text-gm-muted font-semibold">{formatCurrency(s.vehiclePrice)}</td>
                      <td className="p-3.5 text-gm-red font-medium">
                        -{formatCurrency(s.discount + s.exchangeValue)}
                      </td>
                      <td className="p-3.5 font-black text-gm-navy">{formatCurrency(s.totalAmount)}</td>
                      <td className="p-3.5 font-bold text-gm-navy">
                        {s.balanceAmount > 0 ? (
                          <span className="text-red-600">{formatCurrency(s.balanceAmount)}</span>
                        ) : (
                          <span className="text-emerald-600">Cleared</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(s.paymentStatus)}`}>
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-gm-muted">{formatDate(s.deliveryDate)}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="text-xs font-bold text-gm-navy hover:text-gm-red underline"
                        >
                          Invoice ↗
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice View & Delivery Tracking Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider block">
                    Tax Invoice & Delivery Receipt
                  </span>
                  <h3 className="text-xl font-black text-gm-navy">
                    {selectedSale.invoiceNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gm-muted hover:text-gm-navy text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <b className="text-gm-muted block">Customer</b>
                  <span className="font-bold text-gm-navy">{selectedSale.customer?.name}</span>
                  <span className="text-gm-muted text-[11px] block">{selectedSale.customer?.mobile}</span>
                </div>
                <div>
                  <b className="text-gm-muted block">Vehicle Delivered</b>
                  <span className="font-bold text-gm-navy">{selectedSale.vehicle?.brand} {selectedSale.vehicle?.model}</span>
                </div>
                <div>
                  <b className="text-gm-muted block">Sales Executive</b>
                  <span className="font-semibold text-gm-navy">{selectedSale.salesperson?.name || 'Unassigned'}</span>
                </div>
                <div>
                  <b className="text-gm-muted block">Delivery Date</b>
                  <span className="font-semibold text-gm-navy">{formatDate(selectedSale.deliveryDate)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Ex-Showroom Price:</span>
                  <b>{formatCurrency(selectedSale.vehiclePrice)}</b>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-gm-red">
                    <span>Discount Offered:</span>
                    <b>-{formatCurrency(selectedSale.discount)}</b>
                  </div>
                )}
                {selectedSale.exchangeValue > 0 && (
                  <div className="flex justify-between text-gm-red">
                    <span>Old Vehicle Exchange:</span>
                    <b>-{formatCurrency(selectedSale.exchangeValue)}</b>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gm-line font-black text-gm-navy">
                  <span>Total Invoiced Amount:</span>
                  <span>{formatCurrency(selectedSale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedSale.balanceAmount)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gm-navy">Status:</span>
                  <select
                    value={selectedSale.paymentStatus}
                    onChange={(e) => handleUpdateDeliveryStatus(selectedSale.id, e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gm-line text-xs font-bold bg-white"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="UNPAID">UNPAID</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Sale Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gm-line shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Record Vehicle Sale & Invoice</h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Select Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile}) - {c.customerNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Select Vehicle in Inventory *</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    required
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.colour}) - ₹{v.price} [{v.stockStatus}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Discount Offered (₹)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Old Vehicle Exchange Value (₹)</label>
                    <input
                      type="number"
                      value={exchangeValue}
                      onChange={(e) => setExchangeValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Bank Finance Disbursed (₹)</label>
                    <input
                      type="number"
                      value={financeAmount}
                      onChange={(e) => setFinanceAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Advance Booking Paid (₹)</label>
                    <input
                      type="number"
                      value={bookingAmount}
                      onChange={(e) => setBookingAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Summary */}
                <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Net Invoice Amount:</span>
                    <b className="text-gm-navy">{formatCurrency(calcNet())}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance to Collect:</span>
                    <b className="text-gm-red">{formatCurrency(calcBal())}</b>
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
                    {submitting ? 'Generating Sale...' : 'Save & Issue Tax Invoice'}
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
