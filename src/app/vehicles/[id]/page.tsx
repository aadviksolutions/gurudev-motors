'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Fuel,
  Gauge,
  Zap,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  ShieldCheck,
  Calculator,
  RefreshCw,
  Sparkles,
  ArrowRight,
  FileCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';
import { useModal } from '@/context/ModalContext';
import TestDriveModal from '@/components/TestDriveModal';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { openEnquiry } = useModal();

  const [vehicle, setVehicle] = useState<any | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [testDriveOpen, setTestDriveOpen] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      try {
        const res = await fetch(`/api/vehicles/${id}`);
        const data = await res.json();
        if (data.success && data.vehicle) {
          setVehicle(data.vehicle);
          setSimilarVehicles(data.similarVehicles || []);
        }
      } catch (err) {
        console.error('Failed to load vehicle details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 bg-gm-soft min-h-screen">
        <div className="site-container">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-[420px] bg-slate-200 rounded-3xl animate-pulse" />
            <div className="lg:col-span-5 h-[420px] bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="py-20 bg-gm-soft min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl border border-gm-line shadow-sm max-w-md mx-auto">
          <h2 className="text-2xl font-black text-gm-navy mb-2">Vehicle Not Found</h2>
          <p className="text-xs text-gm-muted mb-6">
            The requested vehicle might have been sold or moved to our main showroom inventory.
          </p>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 bg-gm-navy text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gm-navy-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Vehicles</span>
          </Link>
        </div>
      </div>
    );
  }

  const isElectric = vehicle.category === 'ELECTRIC' || vehicle.fuel?.toLowerCase() === 'electric';
  const isPreOwned = vehicle.category === 'PRE_OWNED';

  const badgeColor = isElectric
    ? 'bg-emerald-600 text-white'
    : isPreOwned
    ? 'bg-amber-600 text-white'
    : 'bg-gm-red text-white';

  const badgeText = isElectric ? 'Electric (EV)' : isPreOwned ? 'Certified Pre-Owned' : 'Brand New';

  const allImages =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images.map((img: any) => img.url)
      : [vehicle.imageUrl || '/images/bikes-1.jpeg'];

  const currentImage = allImages[activeImageIndex] || allImages[0];

  const featuresList = vehicle.features
    ? vehicle.features.split(',').map((f: string) => f.trim()).filter(Boolean)
    : [];

  let specsObj: Record<string, string> = {};
  if (vehicle.specifications) {
    try {
      specsObj = typeof vehicle.specifications === 'string' ? JSON.parse(vehicle.specifications) : vehicle.specifications;
    } catch {
      // plain text specifications fallback
    }
  }

  const effectivePrice = vehicle.offerPrice || vehicle.price;
  const computedEmi = vehicle.emi || Math.round(effectivePrice / 36);

  const whatsappMessage = `Hello Gurudev Motors, I am interested in ${vehicle.brand} ${vehicle.model}${vehicle.variant ? ' (' + vehicle.variant + ')' : ''} priced at ${formatCurrency(effectivePrice)}. Please share official quotation and on-road details.`;

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gm-muted mb-6 flex-wrap">
          <Link href="/" className="hover:text-gm-navy">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/vehicles" className="hover:text-gm-navy">Vehicles</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={isPreOwned ? '/vehicles/pre-owned' : isElectric ? '/vehicles/electric' : '/vehicles'}
            className="hover:text-gm-navy"
          >
            {badgeText}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gm-navy font-black">{vehicle.brand} {vehicle.model}</span>
        </div>

        {/* Top Split Layout: Gallery & Key Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* LEFT: Multi-image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-white border border-gm-line shadow-sm">
              <Image
                src={currentImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                priority
                className="object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 pointer-events-none" />

              {/* Status and Category Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${badgeColor}`}>
                  {badgeText}
                </span>
                <span className="bg-white/95 backdrop-blur-sm text-gm-navy px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  {vehicle.stockStatus === 'IN_STOCK' ? 'In Showroom Stock' : vehicle.stockStatus}
                </span>
              </div>

              {/* Brand watermark */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide">
                {vehicle.brand}
              </div>

              {/* Quick Specs Pill */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {isElectric ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <Fuel className="w-3.5 h-3.5 text-amber-400" />}
                  {vehicle.fuel}
                </span>
                {vehicle.mileage && (
                  <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    {vehicle.mileage}
                  </span>
                )}
                {isPreOwned && (
                  <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Gauge className="w-3.5 h-3.5 text-blue-300" />
                    {vehicle.km.toLocaleString()} km
                  </span>
                )}
                <span className="bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {vehicle.year} Model
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-gm-red scale-105 shadow-md' : 'border-gm-line opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description Card */}
            {vehicle.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-sm">
                <h3 className="text-base font-black text-gm-navy uppercase tracking-wider mb-3">
                  Vehicle Overview
                </h3>
                <p className="text-xs sm:text-sm text-gm-muted leading-relaxed">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Price, CTAs & Action Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-sm">
              <span className="text-[11px] font-black uppercase tracking-widest text-gm-red block mb-1">
                {vehicle.brand} Official Raipur
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gm-navy tracking-tight leading-tight">
                {vehicle.model}
              </h1>
              {vehicle.variant && (
                <p className="text-sm font-semibold text-gm-muted mt-0.5">
                  {vehicle.variant}
                </p>
              )}

              {/* Pricing Display */}
              <div className="mt-6 pt-5 border-t border-gm-line">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-gm-navy">
                    {formatCurrency(effectivePrice)}
                  </span>
                  {vehicle.offerPrice && vehicle.offerPrice < vehicle.price && (
                    <span className="text-sm text-gm-muted line-through font-bold">
                      {formatCurrency(vehicle.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gm-muted mt-1">
                  <span>Ex-Showroom Raipur</span>
                  {vehicle.onRoadPrice && (
                    <span className="font-bold text-gm-navy">
                      Est. On-Road: {formatCurrency(vehicle.onRoadPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* EMI Highlight */}
              <div className="mt-4 p-4 rounded-2xl bg-gm-soft border border-gm-line flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-gm-muted block">
                    Starting Monthly EMI
                  </span>
                  <span className="text-lg font-black text-gm-navy">
                    {formatCurrency(computedEmi)}/mo
                  </span>
                </div>
                <Link
                  href={`/finance?model=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}&amount=${effectivePrice}`}
                  className="text-xs font-bold text-gm-red hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Customize Loan ↗</span>
                </Link>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={() => setTestDriveOpen(true)}
                  className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-black py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Schedule Test Ride at Showroom / Home</span>
                </button>

                <button
                  onClick={() => openEnquiry(`${vehicle.brand} ${vehicle.model}`)}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Send Direct Enquiry</span>
                </button>
              </div>

              {/* Direct Instant Contact CTAs */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 pt-4 border-t border-gm-line">
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-emerald-500/40 hover:bg-emerald-50 text-emerald-700 text-xs font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Ask on WhatsApp</span>
                </a>
                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="border border-gm-navy/30 hover:bg-gm-soft text-gm-navy text-xs font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-gm-red" />
                  <span>Call Dealership</span>
                </a>
              </div>

              {/* Exchange & Finance Quick Navigation */}
              <div className="mt-4 pt-4 border-t border-gm-line grid grid-cols-2 gap-2 text-xs">
                <Link
                  href={`/exchange?upgrade=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`}
                  className="p-3 rounded-xl bg-gm-soft hover:bg-gm-soft/80 border border-gm-line text-gm-navy font-bold flex flex-col justify-between"
                >
                  <span className="text-[10px] text-gm-muted uppercase font-black">Exchange Old Bike</span>
                  <span className="text-gm-red mt-1 flex items-center gap-1">Get Valuation ↗</span>
                </Link>
                <Link
                  href={`/finance?model=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}&amount=${effectivePrice}`}
                  className="p-3 rounded-xl bg-gm-soft hover:bg-gm-soft/80 border border-gm-line text-gm-navy font-bold flex flex-col justify-between"
                >
                  <span className="text-[10px] text-gm-muted uppercase font-black">Instant Loan</span>
                  <span className="text-gm-navy mt-1 flex items-center gap-1">Spot Approval ↗</span>
                </Link>
              </div>
            </div>

            {/* Pre-Owned Verification Card */}
            {isPreOwned && (
              <div className="bg-white rounded-3xl p-6 border border-gm-line shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-gm-navy">
                    Gurudev Motors Pre-Owned Seal
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gm-navy font-semibold pt-1">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>40-Point Checked</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{vehicle.rcStatus || 'Original RC Verified'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                    <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{vehicle.ownerCount || 1}st Registered Owner</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{vehicle.warrantyDetails || 'Dealer Warranty'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specifications & Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Key Specifications */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-sm">
            <h3 className="text-base font-black text-gm-navy uppercase tracking-wider mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gm-red" />
              <span>Technical Specifications</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Vehicle Type</span>
                <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.vehicleType || 'Two Wheeler'}</b>
              </div>
              <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Fuel / Power</span>
                <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.fuel}</b>
              </div>
              <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Transmission</span>
                <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.transmission}</b>
              </div>
              {vehicle.engineCC && (
                <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                  <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Displacement</span>
                  <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.engineCC} cc</b>
                </div>
              )}
              {vehicle.mileage && (
                <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                  <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Claimed Mileage</span>
                  <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.mileage}</b>
                </div>
              )}
              <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Model Year</span>
                <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.year}</b>
              </div>
              <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Colour</span>
                <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.colour}</b>
              </div>
              {isPreOwned && (
                <div className="p-3.5 rounded-2xl bg-gm-soft border border-gm-line">
                  <span className="text-[10px] text-gm-muted font-black uppercase tracking-wider block">Odometer Run</span>
                  <b className="text-xs sm:text-sm text-gm-navy block mt-0.5">{vehicle.km.toLocaleString()} km</b>
                </div>
              )}
            </div>

            {/* Extra parsed specifications */}
            {Object.keys(specsObj).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gm-line">
                <h4 className="text-xs font-black uppercase text-gm-navy tracking-wider mb-3">
                  Engine & Chassis Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(specsObj).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-gm-line/50">
                      <span className="text-gm-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <b className="text-gm-navy">{String(val)}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Features Highlights */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-sm">
            <h3 className="text-base font-black text-gm-navy uppercase tracking-wider mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key Features & Technology</span>
            </h3>

            {featuresList.length > 0 ? (
              <ul className="space-y-3">
                {featuresList.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gm-navy font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gm-muted">
                Official standard manufacturer package with factory warranty and original manufacturer fittings.
              </p>
            )}

            <div className="mt-8 p-4 rounded-2xl bg-gm-soft border border-gm-line">
              <b className="text-xs font-bold text-gm-navy block mb-1">Gurudev Motors Advantage</b>
              <p className="text-[11px] text-gm-muted leading-relaxed">
                All two-wheelers purchased from our Raipur showroom come with spot paperwork, doorstep delivery assistance, and verified after-sales warranty support at our Mahadev Ghat facility.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Vehicles Carousel / Grid */}
        {similarVehicles.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gm-red block mb-1">
                  More Options For You
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gm-navy uppercase tracking-tight">
                  Similar Vehicles In Raipur
                </h3>
              </div>
              <Link
                href="/vehicles"
                className="text-xs font-black text-gm-navy hover:text-gm-red flex items-center gap-1"
              >
                <span>View All Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarVehicles.map((simVehicle) => (
                <VehicleCard
                  key={simVehicle.id}
                  vehicle={simVehicle}
                  onEnquire={openEnquiry}
                  onTestDrive={() => setTestDriveOpen(true)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Drive Modal */}
      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        vehicle={vehicle}
      />
    </div>
  );
}
