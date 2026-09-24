'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowLeft, Wrench, FileCheck, RefreshCw } from 'lucide-react';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';
import TestDriveModal from '@/components/TestDriveModal';
import { useModal } from '@/context/ModalContext';

export default function PreOwnedVehiclesPage() {
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testDriveVehicle, setTestDriveVehicle] = useState<VehicleData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/vehicles?category=PRE_OWNED');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.vehicles);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="py-12 bg-gm-soft min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/vehicles" className="inline-flex items-center gap-1.5 text-xs font-bold text-gm-muted hover:text-gm-navy mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Vehicles</span>
        </Link>

        {/* Banner */}
        <div className="bg-gradient-to-r from-gm-navy to-[#031330] rounded-3xl p-8 sm:p-12 text-white mb-12 border border-white/10 shadow-lg">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-2">
              Certified Pre-Owned Assurance
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
              Second-Hand.<br />First-Class Care.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Every pre-owned vehicle at Gurudev Motors undergoes our thorough 40-point technical inspection with verified RC ownership, transparent pricing, and 6-month engine warranty.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white">40-Point Tested</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-white">Clean Raipur RTO</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-white">Easy Exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gm-navy uppercase tracking-tight">
            Currently Available Stock ({vehicles.length})
          </h2>
          <button
            onClick={() => openEnquiry('Pre-owned vehicle requirement')}
            className="text-xs font-black text-gm-red hover:underline"
          >
            Sell / Exchange Your Bike ↗
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onEnquire={openEnquiry}
                onTestDrive={(item) => setTestDriveVehicle(item)}
              />
            ))}
          </div>
        )}
      </div>

      <TestDriveModal
        isOpen={Boolean(testDriveVehicle)}
        onClose={() => setTestDriveVehicle(null)}
        vehicle={testDriveVehicle}
      />
    </div>
  );
}
