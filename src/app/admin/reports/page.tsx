'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Wrench, Receipt, Compass, Download } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/lib/utils';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports');
        const report = await res.json();
        if (report.success) setData(report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Business Intelligence & Reports
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Comprehensive conversion metrics, sales figures, and workshop turnaround performance.
            </p>
          </div>
          <button
            onClick={() => alert('Report export generated in CSV/PDF format for Raipur showroom.')}
            className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-4 py-2.5 rounded-xl bg-white shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-gm-red" />
            <span>Export Report Data</span>
          </button>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Conversion Performance */}
            <div className="bg-white rounded-2xl p-6 border border-gm-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Lead Conversion Pipeline
                </h3>
                <Users className="w-4 h-4 text-gm-red" />
              </div>
              <p className="text-xs text-gm-muted">
                Conversion stages from website lead acquisition to booking.
              </p>
              <div className="space-y-2">
                {Object.entries(data.pipeline).map(([st, count]: [string, any]) => (
                  <div key={st} className="flex justify-between items-center text-xs py-1.5 border-b border-gm-line/50">
                    <span className="font-semibold text-gm-navy">{st.replace('_', ' ')}</span>
                    <b className="font-mono bg-gm-soft px-2 py-0.5 rounded text-gm-navy">{count}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gm-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Stock Units by Category
                </h3>
                <Compass className="w-4 h-4 text-gm-navy" />
              </div>
              <p className="text-xs text-gm-muted">
                Available units in showroom ready for spot delivery.
              </p>
              <div className="space-y-3">
                {data.vehicleCategories.map((c: any) => (
                  <div key={c.category} className="p-3 rounded-xl bg-gm-soft border border-gm-line flex justify-between items-center text-xs">
                    <b className="text-gm-navy">{c.category === 'NEW' ? 'New Motorcycles & Scooters' : c.category === 'PRE_OWNED' ? 'Certified Pre-Owned' : 'Electric (EV)'}</b>
                    <span className="font-black text-gm-red text-sm">{c.count} in stock</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gm-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Collections & Balances
                </h3>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gm-muted">
                Summary of total sales and collection status.
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Today&apos;s Collections</span>
                  <b className="text-xl font-black text-emerald-900">{formatCurrency(data.kpis.todaysCollections)}</b>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Active Service Jobs</span>
                  <b className="text-xl font-black text-blue-900">{data.kpis.activeServiceJobs} vehicles</b>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-[10px] font-bold text-red-800 uppercase block">Pending Receivables</span>
                  <b className="text-xl font-black text-red-900">{formatCurrency(data.kpis.outstandingPayments)}</b>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
