'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, BatteryCharging, ArrowLeft, Leaf, Shield, IndianRupee } from 'lucide-react';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';
import TestDriveModal from '@/components/TestDriveModal';
import { useModal } from '@/context/ModalContext';

export default function ElectricVehiclesPage() {
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testDriveVehicle, setTestDriveVehicle] = useState<VehicleData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/vehicles?category=ELECTRIC');
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

        {/* EV Header Banner */}
        <div className="bg-gradient-to-r from-[#021B1B] to-[#04332D] rounded-3xl p-8 sm:p-12 text-white mb-12 border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Green Mobility Zone • Kinetic Green
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
              Quiet Power.<br />Zero Fuel Bills.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-6">
              Experience the new era of commercial and city two-wheelers. Featuring the legendary Kinetic E-Luna series and Zulu high-speed scooters with portable charging and battery warranty.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20 flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-bold text-white">₹0.25 / KM Cost</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20 flex items-center gap-2.5">
                <BatteryCharging className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-bold text-white">Portable Fast Charge</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20 flex items-center gap-2.5">
                <Leaf className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-bold text-white">Govt. EV Subsidy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gm-navy uppercase tracking-tight">
            Electric Vehicles in Raipur Showroom ({vehicles.length})
          </h2>
          <button
            onClick={() => openEnquiry('Electric EV subsidy details')}
            className="text-xs font-black text-emerald-600 hover:underline"
          >
            Inquire About EV Subsidy ↗
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2].map((n) => (
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
