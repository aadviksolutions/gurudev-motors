'use client';

import React from 'react';
import Image from 'next/image';
import { Fuel, Gauge, Zap, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface VehicleData {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  category: string;
  year: number;
  fuel: string;
  transmission: string;
  km: number;
  colour: string;
  price: number;
  offerPrice?: number | null;
  emi?: number | null;
  description?: string | null;
  features?: string | null;
  stockStatus: string;
  featured?: boolean;
  published?: boolean;
  imageUrl?: string | null;
}

interface VehicleCardProps {
  vehicle: VehicleData;
  onEnquire?: (vehicleName: string) => void;
  onTestDrive?: (vehicle: VehicleData) => void;
}

export default function VehicleCard({ vehicle, onEnquire, onTestDrive }: VehicleCardProps) {
  const isElectric = vehicle.category === 'ELECTRIC' || vehicle.fuel.toLowerCase() === 'electric';
  const isPreOwned = vehicle.category === 'PRE_OWNED';

  const badgeColor = isElectric
    ? 'bg-emerald-600 text-white'
    : isPreOwned
    ? 'bg-amber-600 text-white'
    : 'bg-gm-red text-white';

  const badgeText = isElectric ? 'Electric' : isPreOwned ? 'Pre-Owned' : 'New';

  return (
    <article className="group bg-white border border-gm-line rounded-2xl overflow-hidden shadow-sm hover:shadow-gm hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Media / Image Area */}
        <div className="relative h-48 sm:h-52 bg-gradient-to-br from-gm-soft to-white flex items-center justify-center overflow-hidden">
          <Image
            src={vehicle.imageUrl || '/images/bikes-1.jpeg'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badge */}
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>

          {/* Brand Tag */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gm-navy px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide">
            {vehicle.brand}
          </span>

          {/* Fuel / Specs pill */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
            <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              {isElectric ? <Zap className="w-3 h-3 text-emerald-400" /> : <Fuel className="w-3 h-3 text-amber-400" />}
              {vehicle.fuel}
            </span>
            {isPreOwned && (
              <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                <Gauge className="w-3 h-3 text-blue-300" />
                {vehicle.km.toLocaleString()} km
              </span>
            )}
            <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              {vehicle.year}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h3 className="text-lg font-black text-gm-navy tracking-tight group-hover:text-gm-red transition-colors">
                {vehicle.model}
              </h3>
              {vehicle.variant && (
                <p className="text-xs text-gm-muted font-medium line-clamp-1">
                  {vehicle.variant}
                </p>
              )}
            </div>
          </div>

          {vehicle.description && (
            <p className="text-xs text-gm-muted line-clamp-2 mt-2 leading-relaxed">
              {vehicle.description}
            </p>
          )}

          {/* Pricing Row */}
          <div className="mt-4 pt-3 border-t border-gm-line flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-gm-navy">
                  {formatCurrency(vehicle.offerPrice || vehicle.price)}
                </span>
                {vehicle.offerPrice && vehicle.offerPrice < vehicle.price && (
                  <span className="text-xs text-gm-muted line-through font-semibold">
                    {formatCurrency(vehicle.price)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gm-muted uppercase font-bold tracking-wider block">
                Ex-Showroom Raipur
              </span>
            </div>

            {vehicle.emi && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-extrabold text-gm-muted block">
                  Est. EMI
                </span>
                <span className="text-xs font-black text-gm-navy bg-gm-soft px-2 py-0.5 rounded border border-gm-line inline-block">
                  {formatCurrency(vehicle.emi)}/mo
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2">
        <button
          onClick={() => onTestDrive && onTestDrive(vehicle)}
          className="border border-gm-navy/20 hover:border-gm-navy text-gm-navy text-xs font-extrabold py-2.5 rounded-xl transition-colors hover:bg-gm-soft flex items-center justify-center gap-1"
        >
          Test Drive
        </button>
        <button
          onClick={() => onEnquire && onEnquire(`${vehicle.brand} ${vehicle.model}`)}
          className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
        >
          <span>Enquire</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
