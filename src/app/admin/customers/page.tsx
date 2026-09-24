'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Receipt,
  BadgeDollarSign,
  FileText,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const open360View = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/customers?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setActiveCustomer(data.customer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              360° Customer Profiles
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Unified view of customer vehicle purchases, booking advances, service job cards, and CRM leads.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
              placeholder="Search customer by name, mobile, customer ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
          </div>
          <span className="text-xs text-gm-muted font-bold">
            Total {customers.length} registered customers
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Customer #</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Mobile & Address</th>
                  <th className="p-3.5 text-center">Vehicles / Sales</th>
                  <th className="p-3.5 text-center">Service Visits</th>
                  <th className="p-3.5 text-center">CRM Leads</th>
                  <th className="p-3.5 text-right">360° Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gm-muted">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gm-navy">
                        {c.customerNo}
                      </td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block font-black">{c.name}</b>
                        {c.email && (
                          <span className="text-gm-muted text-[11px] block">{c.email}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <a href={`tel:${c.mobile}`} className="text-gm-navy hover:text-gm-red font-bold text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gm-red" />
                          {c.mobile}
                        </a>
                        <span className="text-gm-muted text-[11px] block">
                          {c.address ? `${c.address}, ${c.city}` : c.city}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 text-[11px]">
                          {c._count.sales} vehicle{c._count.sales === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-800 text-[11px]">
                          {c._count.jobCards} visit{c._count.jobCards === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 text-[11px]">
                          {c._count.leads}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => open360View(c.id)}
                          className="bg-gm-navy hover:bg-gm-navy-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>View 360°</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gm-muted">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 360-Degree Profile Drawer / Modal */}
        {activeCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
              <div className="flex items-start justify-between pb-4 border-b border-gm-line">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider block">
                    360° Customer Profile
                  </span>
                  <h2 className="text-2xl font-black text-gm-navy">
                    {activeCustomer.name}
                  </h2>
                  <span className="text-xs text-gm-muted font-mono">{activeCustomer.customerNo}</span>
                </div>
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="p-2 rounded-full hover:bg-gm-soft text-gm-muted hover:text-gm-navy font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Personal Info Box */}
              <div className="bg-gm-soft rounded-2xl p-4 border border-gm-line space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gm-muted block text-[10px] uppercase font-bold">Mobile</span>
                    <b className="text-gm-navy">{activeCustomer.mobile}</b>
                  </div>
                  <div>
                    <span className="text-gm-muted block text-[10px] uppercase font-bold">Email</span>
                    <b className="text-gm-navy">{activeCustomer.email || 'N/A'}</b>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gm-muted block text-[10px] uppercase font-bold">Address</span>
                    <b className="text-gm-navy">
                      {activeCustomer.address ? `${activeCustomer.address}, ${activeCustomer.city}, ${activeCustomer.state}` : activeCustomer.city}
                    </b>
                  </div>
                </div>
              </div>

              {/* Section: Vehicles Purchased */}
              <div>
                <h4 className="text-xs font-black uppercase text-gm-navy tracking-wider mb-2 flex items-center gap-1.5">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Purchased Vehicles ({activeCustomer.sales?.length || 0})</span>
                </h4>
                {activeCustomer.sales && activeCustomer.sales.length > 0 ? (
                  <div className="space-y-2">
                    {activeCustomer.sales.map((s: any) => (
                      <div key={s.id} className="p-3 rounded-xl border border-gm-line bg-white flex items-center justify-between text-xs">
                        <div>
                          <b className="text-gm-navy block">{s.vehicle?.brand} {s.vehicle?.model}</b>
                          <span className="text-gm-muted text-[11px]">Invoice: {s.invoiceNumber} • {formatDate(s.deliveryDate)}</span>
                        </div>
                        <div className="text-right">
                          <b className="text-gm-navy block">{formatCurrency(s.totalAmount)}</b>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">{s.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gm-muted italic">No vehicle purchase recorded yet.</p>
                )}
              </div>

              {/* Section: Service History */}
              <div>
                <h4 className="text-xs font-black uppercase text-gm-navy tracking-wider mb-2 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Workshop Service History ({activeCustomer.jobCards?.length || 0})</span>
                </h4>
                {activeCustomer.jobCards && activeCustomer.jobCards.length > 0 ? (
                  <div className="space-y-2">
                    {activeCustomer.jobCards.map((jc: any) => (
                      <div key={jc.id} className="p-3 rounded-xl border border-gm-line bg-white flex items-center justify-between text-xs">
                        <div>
                          <b className="text-gm-navy block">{jc.vehicleModel} ({jc.vehicleRegNumber})</b>
                          <span className="text-gm-muted text-[11px]">{jc.jobCardNumber} • {jc.kmReading} km • {jc.complaints || 'Routine Service'}</span>
                        </div>
                        <div className="text-right">
                          <b className="text-gm-navy block">{formatCurrency(jc.finalTotal)}</b>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(jc.status)}`}>
                            {jc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gm-muted italic">No service visits recorded.</p>
                )}
              </div>

              {/* Section: Enquiries & CRM Leads */}
              <div>
                <h4 className="text-xs font-black uppercase text-gm-navy tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>CRM Leads & Enquiries ({activeCustomer.leads?.length || 0})</span>
                </h4>
                {activeCustomer.leads && activeCustomer.leads.length > 0 ? (
                  <div className="space-y-2">
                    {activeCustomer.leads.map((l: any) => (
                      <div key={l.id} className="p-3 rounded-xl border border-gm-line bg-white flex items-center justify-between text-xs">
                        <div>
                          <b className="text-gm-navy block">{l.vehicleModel}</b>
                          <span className="text-gm-muted text-[11px]">{l.leadNumber} • {l.source} • {formatDate(l.createdAt)}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(l.status)}`}>
                            {l.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gm-muted italic">No leads.</p>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-gm-line">
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-3 rounded-xl transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
