'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  UserPlus,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCustomer, setActiveCustomer] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Single Customer Modal State
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState('');
  const [singleSuccess, setSingleSuccess] = useState('');
  const [custForm, setCustForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Raipur',
    state: 'Chhattisgarh',
    pincode: '',
    aadharNo: '',
    panNo: '',
    notes: '',
  });

  // Bulk Upload Modal State
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<'csv' | 'paste'>('csv');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkResult, setBulkResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Helper to parse CSV or Tab/Comma-separated customer rows
  const parseCustomerRawText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes('name') ||
      firstLine.includes('mobile') ||
      firstLine.includes('phone') ||
      firstLine.includes('contact');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const rows = dataLines.map((line, idx) => {
      // Split by comma or tab
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.split(',').map((p) => p.trim());

      const name = (parts[0] || '').replace(/^["']|["']$/g, '').trim();
      const rawMobile = (parts[1] || '').replace(/^["']|["']$/g, '').trim();
      const email = (parts[2] || '').replace(/^["']|["']$/g, '').trim();
      const address = (parts[3] || '').replace(/^["']|["']$/g, '').trim();
      const city = (parts[4] || '').replace(/^["']|["']$/g, '').trim() || 'Raipur';

      // Clean mobile number (strip +91, spaces, dashes)
      let digits = rawMobile.replace(/[^0-9]/g, '');
      if (digits.length > 10 && digits.startsWith('91')) {
        digits = digits.slice(2);
      }
      const cleanMobile = digits.slice(-10);
      const isMobileValid = cleanMobile.length === 10;
      const isNameValid = name.length >= 2;
      const isValid = isNameValid && isMobileValid;

      let error = null;
      if (!isNameValid) error = 'Name required';
      else if (!isMobileValid) error = '10-digit mobile required';

      return {
        rowNum: idx + 1,
        name,
        mobile: cleanMobile || rawMobile,
        email: email || '',
        address: address || '',
        city,
        isValid,
        error,
      };
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCustomerRawText(content);
    };
    reader.onerror = () => {
      setBulkError('Failed to read file. Please ensure it is a valid CSV or TXT file.');
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'Name,Mobile,Email,Address,City\n' +
      'Rajesh Verma,9827110022,rajesh@example.com,Civil Lines,Raipur\n' +
      'Sunita Agrawal,9425201199,sunita@example.com,Pandri,Raipur\n' +
      'Mahesh Patel,7000619808,mahesh@example.com,Mahadevghat Chowk,Raipur\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gurudev_motors_sample_customers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Single Customer (no lead required)
  const handleSingleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError('');
    setSingleSuccess('');
    setSingleLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setSingleSuccess(`Customer ${data.customer.name} (${data.customer.customerNo}) added successfully!`);
      fetchCustomers();
      setTimeout(() => {
        setAddCustomerModal(false);
        setSingleSuccess('');
      }, 1500);
    } catch (err: any) {
      setSingleError(err.message || 'Error creating customer');
    } finally {
      setSingleLoading(false);
    }
  };

  // Submit Bulk Customers
  const handleBulkSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setBulkError('No valid customer records found to upload. Please correct rows before submitting.');
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    setBulkResult(null);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          customers: validRows.map((r) => ({
            name: r.name,
            mobile: r.mobile,
            email: r.email || undefined,
            address: r.address || undefined,
            city: r.city || 'Raipur',
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to bulk upload customers');
      }

      setBulkResult(data);
      fetchCustomers();
    } catch (err: any) {
      setBulkError(err.message || 'Error during bulk upload');
    } finally {
      setBulkLoading(false);
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
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setBulkResult(null);
                setBulkError('');
                setParsedRows([]);
                setPasteText('');
                setBulkModal(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-gm-line bg-white hover:bg-gm-soft text-gm-navy text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk Upload</span>
            </button>
            <button
              onClick={() => {
                setSingleError('');
                setSingleSuccess('');
                setCustForm({
                  name: '',
                  mobile: '',
                  email: '',
                  address: '',
                  city: 'Raipur',
                  state: 'Chhattisgarh',
                  pincode: '',
                  aadharNo: '',
                  panNo: '',
                  notes: '',
                });
                setAddCustomerModal(true);
              }}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
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

        {/* Modal 1: Add Single Customer (Direct without any lead) */}
        {addCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gm-line shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <div>
                  <h3 className="text-xl font-black text-gm-navy">Add New Customer</h3>
                  <p className="text-xs text-gm-muted">Directly register customer profile without requiring a lead or enquiry</p>
                </div>
                <button
                  onClick={() => setAddCustomerModal(false)}
                  className="p-1 rounded-lg hover:bg-gm-soft text-gm-muted font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {singleError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{singleError}</span>
                </div>
              )}

              {singleSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{singleSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSingleCustomerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gm-navy mb-1">
                      Customer Full Name <span className="text-gm-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={custForm.name}
                      onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar Verma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">
                      Mobile Number <span className="text-gm-red">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={custForm.mobile}
                      onChange={(e) => setCustForm({ ...custForm, mobile: e.target.value })}
                      placeholder="10-digit number, e.g. 9827110022"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Email Address</label>
                    <input
                      type="email"
                      value={custForm.email}
                      onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gm-navy mb-1">Street Address</label>
                    <input
                      type="text"
                      value={custForm.address}
                      onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                      placeholder="e.g. Near Ganesh Mandir, Mahadevghat Road"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">City</label>
                    <input
                      type="text"
                      value={custForm.city}
                      onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                      placeholder="Raipur"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">State</label>
                    <input
                      type="text"
                      value={custForm.state}
                      onChange={(e) => setCustForm({ ...custForm, state: e.target.value })}
                      placeholder="Chhattisgarh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Pincode</label>
                    <input
                      type="text"
                      value={custForm.pincode}
                      onChange={(e) => setCustForm({ ...custForm, pincode: e.target.value })}
                      placeholder="492001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Aadhar / PAN (Optional)</label>
                    <input
                      type="text"
                      value={custForm.panNo}
                      onChange={(e) => setCustForm({ ...custForm, panNo: e.target.value.toUpperCase() })}
                      placeholder="PAN or Aadhar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-semibold uppercase focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gm-navy mb-1">Notes / Preferences</label>
                    <textarea
                      rows={2}
                      value={custForm.notes}
                      onChange={(e) => setCustForm({ ...custForm, notes: e.target.value })}
                      placeholder="Walk-in customer notes, preferred contact time, etc."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium resize-none focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gm-line flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAddCustomerModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted hover:bg-gm-soft transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={singleLoading}
                    className="bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50"
                  >
                    {singleLoading ? 'Saving Customer...' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Bulk Upload Customers */}
        {bulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gm-line shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <div>
                  <h3 className="text-xl font-black text-gm-navy flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>Bulk Upload Customers</span>
                  </h3>
                  <p className="text-xs text-gm-muted">Upload CSV or paste a list with Name and Mobile number</p>
                </div>
                <button
                  onClick={() => setBulkModal(false)}
                  className="p-1 rounded-lg hover:bg-gm-soft text-gm-muted font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Result Alert */}
              {bulkResult && (
                <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-gm-line space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-xs font-black text-gm-navy">Upload Complete</h4>
                    </div>
                    <span className="text-xs font-bold text-gm-muted">Total: {bulkResult.total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-emerald-800 font-bold block text-[11px] uppercase">Created</span>
                      <strong className="text-xl font-black text-emerald-700">{bulkResult.createdCount}</strong>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-amber-800 font-bold block text-[11px] uppercase">Skipped / Duplicates</span>
                      <strong className="text-xl font-black text-amber-700">{bulkResult.skippedCount}</strong>
                    </div>
                  </div>

                  {bulkResult.skipped && bulkResult.skipped.length > 0 && (
                    <div className="text-[11px] space-y-1 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-gm-line">
                      <span className="font-bold text-gm-muted uppercase text-[9px] block">Skipped Details:</span>
                      {bulkResult.skipped.map((s: any, idx: number) => (
                        <div key={idx} className="text-slate-600">
                          • <strong className="text-slate-800">{s.name}</strong> ({s.mobile}): {s.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setBulkModal(false);
                      setBulkResult(null);
                    }}
                    className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                  >
                    Done & View Customers
                  </button>
                </div>
              )}

              {!bulkResult && (
                <div className="space-y-4">
                  {bulkError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bulkError}</span>
                    </div>
                  )}

                  {/* Mode Selector */}
                  <div className="flex items-center justify-between gap-2 border-b border-gm-line pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkMode('csv')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bulkMode === 'csv'
                            ? 'bg-gm-navy text-white shadow-xs'
                            : 'bg-gm-soft text-gm-muted hover:text-gm-navy'
                        }`}
                      >
                        Upload CSV File
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkMode('paste')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bulkMode === 'paste'
                            ? 'bg-gm-navy text-white shadow-xs'
                            : 'bg-gm-soft text-gm-muted hover:text-gm-navy'
                        }`}
                      >
                        Copy & Paste List
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={downloadSampleCsv}
                      className="text-xs font-bold text-gm-red hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>

                  {/* Mode 1: File Upload */}
                  {bulkMode === 'csv' && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gm-line hover:border-gm-navy p-6 rounded-2xl text-center cursor-pointer transition-colors bg-gm-soft/30 hover:bg-gm-soft/60"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv,text/plain"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gm-muted mx-auto mb-2" />
                      <p className="text-xs font-bold text-gm-navy">
                        Click to select or drag and drop customer CSV file
                      </p>
                      <p className="text-[11px] text-gm-muted mt-0.5">
                        Supported columns: Name, Mobile, Email, Address, City
                      </p>
                    </div>
                  )}

                  {/* Mode 2: Copy Paste */}
                  {bulkMode === 'paste' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gm-navy">
                        Paste Customers (One customer per line):
                      </label>
                      <textarea
                        rows={5}
                        value={pasteText}
                        onChange={(e) => {
                          setPasteText(e.target.value);
                          parseCustomerRawText(e.target.value);
                        }}
                        placeholder="e.g.&#10;Ramesh Kumar, 9827110022, ramesh@example.com, Civil Lines&#10;Anita Sahu, 9425201199, Pandri Raipur"
                        className="w-full p-3 rounded-xl border border-gm-line text-xs font-mono focus:outline-none focus:border-gm-navy resize-none"
                      />
                      <p className="text-[11px] text-gm-muted">
                        Format: <code className="bg-slate-100 px-1 py-0.5 rounded">Name, Mobile, Email, Address</code>. Commas or tabs are supported.
                      </p>
                    </div>
                  )}

                  {/* Parsed Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-2 border-t border-gm-line pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gm-navy">
                          Preview ({parsedRows.length} detected):
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {parsedRows.filter((r) => r.isValid).length} Valid
                          </span>
                          {parsedRows.filter((r) => !r.isValid).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                              {parsedRows.filter((r) => !r.isValid).length} Errors
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto rounded-xl border border-gm-line overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gm-soft/80 text-gm-muted uppercase text-[9px] font-bold">
                            <tr>
                              <th className="p-2">#</th>
                              <th className="p-2">Name</th>
                              <th className="p-2">Mobile</th>
                              <th className="p-2">City</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gm-line/50">
                            {parsedRows.slice(0, 50).map((r) => (
                              <tr key={r.rowNum} className={r.isValid ? 'bg-white' : 'bg-red-50/50'}>
                                <td className="p-2 text-gm-muted text-[10px]">{r.rowNum}</td>
                                <td className="p-2 font-bold text-gm-navy">{r.name || '—'}</td>
                                <td className="p-2 font-mono text-[11px]">{r.mobile || '—'}</td>
                                <td className="p-2 text-gm-muted text-[11px]">{r.city}</td>
                                <td className="p-2">
                                  {r.isValid ? (
                                    <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Ready
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-bold text-[10px] flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> {r.error}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedRows.length > 50 && (
                        <p className="text-[10px] text-gm-muted text-center italic">
                          Showing first 50 rows of {parsedRows.length} total rows.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gm-line flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBulkModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted hover:bg-gm-soft transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={bulkLoading || parsedRows.filter((r) => r.isValid).length === 0}
                      onClick={handleBulkSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {bulkLoading
                          ? 'Uploading...'
                          : `Upload ${parsedRows.filter((r) => r.isValid).length} Customers`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
