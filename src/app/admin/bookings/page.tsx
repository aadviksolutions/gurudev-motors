'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Compass,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Car,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<'TEST_DRIVES' | 'BOOKINGS'>('TEST_DRIVES');
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [tdRes, bkRes, empRes] = await Promise.all([
        fetch(`/api/test-drives?search=${encodeURIComponent(search)}`),
        fetch(`/api/bookings?search=${encodeURIComponent(search)}`),
        fetch('/api/employees'),
      ]);
      const tdData = await tdRes.json();
      const bkData = await bkRes.json();
      const empData = await empRes.json();

      if (tdData.success) setTestDrives(tdData.testDrives);
      if (bkData.success) setBookings(bkData.bookings);
      if (empData.success) {
        setEmployees(
          empData.employees.filter((e: any) =>
            ['SALES_EXECUTIVE', 'SALES_MANAGER', 'MAIN_ADMIN'].includes(e.role?.code)
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleUpdateTestDrive = async (id: string, status: string) => {
    try {
      await fetch('/api/test-drives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTestDrive = async (id: string, assignedToId: string) => {
    try {
      await fetch('/api/test-drives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, assignedToId }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-gm-red" />
              Bookings & Test Ride Experiences
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Customer test ride scheduling, advance vehicle tokens, and showroom booking ledger.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-gm-line pb-3">
          <button
            onClick={() => setActiveTab('TEST_DRIVES')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'TEST_DRIVES'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            Test Rides ({testDrives.length})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'BOOKINGS'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            Advance Vehicle Bookings ({bookings.length})
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, mobile, vehicle..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy bg-white shadow-xs"
          />
          <Search className="w-4 h-4 text-gm-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {/* Test Drives View */}
        {activeTab === 'TEST_DRIVES' && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Preferred Slot</th>
                    <th className="p-3.5">Assigned To</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">Loading test drives...</td>
                    </tr>
                  ) : testDrives.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">No test drives requested.</td>
                    </tr>
                  ) : (
                    testDrives.map((td) => (
                      <tr key={td.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{td.customerName}</b>
                          <a href={`tel:${td.mobile}`} className="text-gm-muted text-[11px] flex items-center gap-1 hover:text-gm-red">
                            <Phone className="w-3 h-3 text-gm-red" />
                            {td.mobile}
                          </a>
                        </td>
                        <td className="p-3.5 font-bold text-gm-navy">
                          {td.vehicle?.brand} {td.vehicle?.model}
                        </td>
                        <td className="p-3.5 text-gm-navy">
                          <span className="font-semibold block">{formatDate(td.preferredDate)}</span>
                          <span className="text-gm-muted text-[10px]">{td.preferredTime}</span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={td.assignedToId || ''}
                            onChange={(e) => handleAssignTestDrive(td.id, e.target.value)}
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(td.status)}`}>
                            {td.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-gm-muted max-w-xs truncate">
                          {td.notes || '-'}
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={td.status}
                            onChange={(e) => handleUpdateTestDrive(td.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gm-line text-xs font-bold bg-white"
                          >
                            <option value="REQUESTED">REQUESTED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings View */}
        {activeTab === 'BOOKINGS' && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Booking #</th>
                    <th className="p-3.5">Customer & Contact</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Advance Amount</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Booking Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">Loading advance bookings...</td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">No advance bookings recorded.</td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gm-soft/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gm-navy">{b.bookingNumber}</td>
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{b.customer?.name}</b>
                          <span className="text-gm-muted text-[11px]">{b.customer?.mobile}</span>
                        </td>
                        <td className="p-3.5 text-gm-navy font-bold">
                          {b.vehicle?.brand} {b.vehicle?.model}
                        </td>
                        <td className="p-3.5 font-black text-gm-navy">
                          {formatCurrency(b.bookingAmount)}
                        </td>
                        <td className="p-3.5 font-bold text-gm-muted">{b.paymentMode}</td>
                        <td className="p-3.5">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer ${getStatusColor(b.status)}`}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-gm-muted">{formatDate(b.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
