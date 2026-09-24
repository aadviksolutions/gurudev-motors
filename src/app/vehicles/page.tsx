'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';
import TestDriveModal from '@/components/TestDriveModal';
import { VEHICLE_BRANDS } from '@/lib/constants';
import { useModal } from '@/context/ModalContext';

export default function VehiclesPage() {
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [brand, setBrand] = useState('ALL');
  const [fuel, setFuel] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [testDriveVehicle, setTestDriveVehicle] = useState<VehicleData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/vehicles');
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

  const filtered = vehicles
    .filter((v) => {
      if (category !== 'ALL' && v.category !== category) return false;
      if (brand !== 'ALL' && v.brand !== brand) return false;
      if (fuel !== 'ALL' && v.fuel.toLowerCase() !== fuel.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.variant && v.variant.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.offerPrice || a.price) - (b.offerPrice || b.price);
      if (sortBy === 'price_desc') return (b.offerPrice || b.price) - (a.offerPrice || a.price);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gm-red mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Gurudev Motors Catalog
          </div>
          <h1
            className="font-black uppercase text-gm-navy tracking-tight break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Explore All Vehicles
          </h1>
          <p className="text-sm text-gm-muted mt-2 max-w-xl">
            Browse multi-brand motorcycles, city scooters, electric two-wheelers, and certified pre-owned rides available at our Raipur showroom.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-gm-line rounded-2xl p-5 mb-8 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Hero, Activa, Pulsar, E-Luna..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
              >
                <option value="ALL">All Categories</option>
                <option value="NEW">New Vehicles</option>
                <option value="PRE_OWNED">Pre-Owned</option>
                <option value="ELECTRIC">Electric (EV)</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
              >
                <option value="ALL">All Brands</option>
                {VEHICLE_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 text-xs text-gm-muted font-bold">
          <span>Showing {filtered.length} vehicles</span>
          {(category !== 'ALL' || brand !== 'ALL' || search) && (
            <button
              onClick={() => {
                setCategory('ALL');
                setBrand('ALL');
                setFuel('ALL');
                setSearch('');
              }}
              className="text-gm-red hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEnquire={openEnquiry}
                onTestDrive={(v) => setTestDriveVehicle(v)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gm-line">
            <h3 className="text-lg font-black text-gm-navy mb-2">No matching vehicles found</h3>
            <p className="text-xs text-gm-muted max-w-sm mx-auto mb-6">
              Try adjusting your search criteria or contact our sales team to inquire about incoming showroom stock.
            </p>
            <button
              onClick={() => openEnquiry()}
              className="bg-gm-red text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-gm-red-dark transition-colors"
            >
              Ask Showroom Team ↗
            </button>
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
