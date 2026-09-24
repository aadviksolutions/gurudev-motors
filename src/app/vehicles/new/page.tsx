'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';
import TestDriveModal from '@/components/TestDriveModal';
import { useModal } from '@/context/ModalContext';

export default function NewVehiclesPage() {
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testDriveVehicle, setTestDriveVehicle] = useState<VehicleData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/vehicles?category=NEW');
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
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <Link href="/vehicles" className="inline-flex items-center gap-1.5 text-xs font-bold text-gm-muted hover:text-gm-navy mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Vehicles</span>
        </Link>

        <div className="mb-8 sm:mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2">
            Brand New Showroom Models
          </span>
          <h1
            className="font-black uppercase text-gm-navy tracking-tight break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            New Motorcycles & Scooters
          </h1>
          <p className="text-sm text-gm-muted mt-2 max-w-xl">
            Choose from the latest models of Hero, Honda, Suzuki and Bajaj with official warranty, easy bank EMI finance, and free helmet kit.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
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
