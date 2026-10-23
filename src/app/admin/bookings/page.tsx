'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Compass, Users, Phone, Clock, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<'TEST_DRIVES' | 'BOOKINGS'>('TEST_DRIVES');
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tdRes, bkRes] = await Promise.all([
        fetch('/api/test-drives'),
        fetch('/api/bookings'),
      ]);
      const tdData = await tdRes.json();
      const bkData = await bkRes.json();
      if (tdData.success) setTestDrives(tdData.testDrives);
      if (bkData.success) setBookings(bkData.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gm-navy tracking-tight">
            Bookings & Ride Experiences
          </h1>
          <p className="text-xs text-gm-muted mt-0.5">
            Customer test drive requests and advance vehicle bookings.
          </p>
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
            Test Drives ({testDrives.length})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'BOOKINGS'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            Advance Bookings ({bookings.length})
          </button>
        </div>

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
                  ) : testDrives.length > 0 ? (
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
                        <td className="p-3.5 text-gm-muted font-medium">
                          {td.assignedTo?.name || 'Unassigned'}
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
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">No test drives requested.</td>
                    </tr>
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
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Advance Amount</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Booking Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {bookings.map((b) => (
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-gm-muted">{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
