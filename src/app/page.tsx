'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  Shield,
  Zap,
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Sparkles,
} from 'lucide-react';
import Hero from '@/components/Hero';
import QuickStats from '@/components/QuickStats';
import VehicleCard, { VehicleData } from '@/components/VehicleCard';
import TestDriveModal from '@/components/TestDriveModal';
import { CONTACT_INFO } from '@/lib/constants';
import { useModal } from '@/context/ModalContext';

export default function HomePage() {
  const { openEnquiry } = useModal();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'NEW' | 'PRE_OWNED' | 'ELECTRIC'>('all');
  const [loading, setLoading] = useState(true);
  const [testDriveVehicle, setTestDriveVehicle] = useState<VehicleData | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.vehicles);
        }
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    if (activeFilter === 'all') return true;
    return v.category === activeFilter;
  });

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <Hero onOpenEnquiry={() => openEnquiry()} />

      {/* Quick Stats Strip */}
      <QuickStats />

      {/* SECTION 01: About Gurudev Motors */}
      <section className="py-24 sm:py-32 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gm-red mb-2">
                01 / Who We Are
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gm-navy leading-[0.9]">
                Built around<br />the ride.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gm-muted max-w-md leading-relaxed">
              Gurudev Motors brings multiple motorcycle and scooter choices together with pre-owned buying, selling and exchange support in Raipur, Chhattisgarh.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Showroom Photo with Tag */}
            <div className="lg:col-span-6 relative min-h-[460px] sm:min-h-[540px] rounded-3xl overflow-hidden border border-gm-line shadow-sm group">
              <Image
                src="/images/showroom-1.jpeg"
                alt="Gurudev Motors Showroom Raipur"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031330]/95 via-[#031330]/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase font-extrabold tracking-widest text-gm-red block mb-1">
                  Raipur Showroom
                </span>
                <b className="text-2xl sm:text-3xl font-black block tracking-tight">
                  Gurudev Motors
                </b>
                <small className="text-xs text-white/80 tracking-wide mt-1 block">
                  Mahadev Ghat Chowk • Raipura • Raipur (C.G.)
                </small>
              </div>
            </div>

            {/* Content Cards */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              {/* Approach Card */}
              <div className="bg-white border border-gm-line rounded-3xl p-8 shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-widest text-gm-red block mb-2">
                  Our Approach
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gm-navy tracking-tight mb-3">
                  More choice.<br />One destination.
                </h3>
                <p className="text-sm text-gm-muted leading-relaxed mb-6">
                  From everyday scooters and motorcycles to electric mobility and certified pre-owned options, our showroom brings different riding needs under one roof.
                </p>

                {/* 4 Feature Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-gm-soft border border-gm-line/60 rounded-2xl p-4">
                    <b className="text-sm font-black text-gm-navy block mb-1">
                      New Vehicles
                    </b>
                    <span className="text-xs text-gm-muted leading-normal block">
                      Motorcycles & scooters across major brands.
                    </span>
                  </div>

                  <div className="bg-gm-soft border border-gm-line/60 rounded-2xl p-4">
                    <b className="text-sm font-black text-gm-navy block mb-1">
                      Pre-Owned
                    </b>
                    <span className="text-xs text-gm-muted leading-normal block">
                      40-point certified buy, sell and exchange.
                    </span>
                  </div>

                  <div className="bg-gm-soft border border-gm-line/60 rounded-2xl p-4">
                    <b className="text-sm font-black text-gm-navy block mb-1">
                      Electric Mobility
                    </b>
                    <span className="text-xs text-gm-muted leading-normal block">
                      Kinetic Green zero-emission models.
                    </span>
                  </div>

                  <div className="bg-gm-soft border border-gm-line/60 rounded-2xl p-4">
                    <b className="text-sm font-black text-gm-navy block mb-1">
                      Workshop & Lounge
                    </b>
                    <span className="text-xs text-gm-muted leading-normal block">
                      Routine maintenance and doorstep service.
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-gm-navy text-white rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
                    Visit Our Showroom
                  </span>
                  <h4 className="text-xl font-black tracking-tight">
                    Mahadev Ghat Chowk
                  </h4>
                  <p className="text-xs text-white/70 mt-1 max-w-xs">
                    Mahadev Ghat Chowk, Raipura, Raipur, Chhattisgarh.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${CONTACT_INFO.phoneRaw}`}
                    className="bg-gm-red hover:bg-gm-red-dark text-white px-5 py-3 rounded-xl text-xs font-black shadow transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hello Gurudev Motors, I would like to visit the showroom.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/20 hover:border-white text-white px-4 py-3 rounded-xl text-xs font-bold transition-colors"
                  >
                    WhatsApp ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: Dynamic Vehicle Showcase */}
      <section className="py-24 sm:py-32 bg-gm-soft border-y border-gm-line" id="vehicles">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gm-red mb-2">
                02 / Vehicle Range
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gm-navy leading-[0.9]">
                Find your<br />next ride.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gm-muted max-w-md leading-relaxed">
              Explore the models represented in the Gurudev Motors range. Compare prices, fuel types, and estimated EMIs.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                activeFilter === 'all'
                  ? 'bg-gm-navy text-white shadow-md'
                  : 'bg-white text-gm-navy/80 hover:bg-gm-navy hover:text-white border border-gm-line'
              }`}
            >
              All Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveFilter('NEW')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                activeFilter === 'NEW'
                  ? 'bg-gm-navy text-white shadow-md'
                  : 'bg-white text-gm-navy/80 hover:bg-gm-navy hover:text-white border border-gm-line'
              }`}
            >
              New Two-Wheelers
            </button>
            <button
              onClick={() => setActiveFilter('PRE_OWNED')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                activeFilter === 'PRE_OWNED'
                  ? 'bg-gm-navy text-white shadow-md'
                  : 'bg-white text-gm-navy/80 hover:bg-gm-navy hover:text-white border border-gm-line'
              }`}
            >
              Certified Pre-Owned
            </button>
            <button
              onClick={() => setActiveFilter('ELECTRIC')}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                activeFilter === 'ELECTRIC'
                  ? 'bg-gm-navy text-white shadow-md'
                  : 'bg-white text-gm-navy/80 hover:bg-gm-navy hover:text-white border border-gm-line'
              }`}
            >
              Electric Mobility (EV)
            </button>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-gm-line" />
              ))}
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEnquire={openEnquiry}
                  onTestDrive={(v) => setTestDriveVehicle(v)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gm-line">
              <p className="text-gm-muted text-sm font-semibold">
                No vehicles found in this category. Contact showroom for upcoming arrivals.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-black tracking-wide uppercase px-8 py-4 rounded-xl shadow transition-all hover:gap-3"
            >
              <span>View Full Inventory & Filters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 03: Pre-Owned & Exchange Split Cards */}
      <section className="py-24 sm:py-32 bg-white" id="used">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gm-red mb-2">
                03 / Pre-Owned & Exchange
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gm-navy leading-[0.9]">
                Second-hand.<br />First-class attention.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gm-muted max-w-md leading-relaxed">
              Buying, selling and exchange support for customers looking for verified pre-owned options in Raipur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Buy Pre-Owned */}
            <div className="relative min-h-[440px] rounded-3xl overflow-hidden border border-gm-line shadow-sm group">
              <Image
                src="/images/bikes-1.jpeg"
                alt="Motorcycles at Gurudev Motors"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031330] via-[#031330]/75 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase font-extrabold tracking-widest text-gm-red block mb-1">
                  Pre-Owned Two-Wheelers
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                  Buy with clarity.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-md">
                  Every certified pre-owned motorcycle and scooter passes a rigorous 40-point technical check, with clean RTO documents and dealer warranty.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/vehicles/pre-owned"
                    className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Browse Pre-Owned Stock ↗</span>
                  </Link>
                  <button
                    onClick={() => openEnquiry('Pre-owned enquiry')}
                    className="border border-white/30 hover:border-white text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Ask For Upcoming Stock
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Exchange */}
            <div className="relative min-h-[440px] rounded-3xl overflow-hidden border border-gm-line shadow-sm group">
              <Image
                src="/images/scooters-1.jpeg"
                alt="Scooters at Gurudev Motors"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031330] via-[#031330]/75 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs uppercase font-extrabold tracking-widest text-gm-red block mb-1">
                  Vehicle Exchange
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                  Move on from your old ride.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-md">
                  Bring your existing bike or scooter of any brand into the showroom for instant transparent valuation and offset the price of your new dream ride.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/exchange"
                    className="bg-white hover:bg-gm-soft text-gm-navy text-xs font-black px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Exchange Estimator ↗</span>
                  </Link>
                  <button
                    onClick={() => openEnquiry('Vehicle exchange valuation')}
                    className="border border-white/30 hover:border-white text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    Get Instant Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: Electric Mobility Banner */}
      <section className="py-20 bg-gm-navy text-white relative overflow-hidden" id="electric">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/hero.jpeg')` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">
              <Zap className="w-4 h-4" />
              04 / Electric Mobility
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-4">
              Quiet power.<br />
              <span className="text-emerald-400">Everyday freedom.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
              Discover Kinetic Green electric models including E-Luna Plus, Zing, and Zulu at Gurudev Motors. Say goodbye to fuel lines and enjoy low running cost from ₹0.25/km.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/vehicles/electric"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-7 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <span>Explore Electric Range</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openEnquiry('Electric mobility enquiry')}
                className="border border-white/30 hover:border-white text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors"
              >
                Ask About Subsidy & EMI ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05: Workshop & Service Centre */}
      <section className="py-24 sm:py-32 bg-white" id="service">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gm-red mb-2">
                05 / Workshop Care
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gm-navy leading-[0.9]">
                Service that<br />keeps you moving.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gm-muted max-w-md leading-relaxed">
              Practical service support for routine maintenance and vehicle care, plus a customer lounge and doorstep service facility in Raipur.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Workshop Photo Card */}
            <div className="lg:col-span-5 relative min-h-[420px] rounded-3xl overflow-hidden border border-gm-line shadow-sm group">
              <Image
                src="/images/workshop.jpeg"
                alt="Gurudev Motors workshop"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031330] via-[#031330]/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-1">
                  Workshop Care
                </span>
                <h3 className="text-3xl font-black tracking-tight mb-2">
                  Care beyond the showroom.
                </h3>
                <p className="text-xs text-white/80">
                  Certified technicians, genuine lubricants and computerized diagnostic systems.
                </p>
              </div>
            </div>

            {/* 4 Service Pillars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gm-line rounded-3xl p-7 flex flex-col justify-between hover:border-gm-navy transition-colors">
                <div>
                  <span className="text-xs font-black text-gm-red tracking-widest block mb-3">01</span>
                  <h4 className="text-xl font-black text-gm-navy mb-2">Well-Equipped Workshop</h4>
                  <p className="text-xs text-gm-muted leading-relaxed">
                    Hydraulic bike ramps, pneumatic tools, and genuine spare parts for multi-brand motorcycles and scooters.
                  </p>
                </div>
                <div className="pt-4 text-xs font-bold text-gm-navy flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Routine Maintenance</span>
                </div>
              </div>

              <div className="bg-white border border-gm-line rounded-3xl p-7 flex flex-col justify-between hover:border-gm-navy transition-colors">
                <div>
                  <span className="text-xs font-black text-gm-red tracking-widest block mb-3">02</span>
                  <h4 className="text-xl font-black text-gm-navy mb-2">Customer Lounge</h4>
                  <p className="text-xs text-gm-muted leading-relaxed">
                    A dedicated, air-conditioned waiting space with Wi-Fi while your vehicle is serviced and inspected.
                  </p>
                </div>
                <div className="pt-4 text-xs font-bold text-gm-navy flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Comfortable Waiting</span>
                </div>
              </div>

              <div className="bg-white border border-gm-line rounded-3xl p-7 flex flex-col justify-between hover:border-gm-navy transition-colors">
                <div>
                  <span className="text-xs font-black text-gm-red tracking-widest block mb-3">03</span>
                  <h4 className="text-xl font-black text-gm-navy mb-2">Doorstep Service</h4>
                  <p className="text-xs text-gm-muted leading-relaxed">
                    Doorstep service facility for minor repairs, battery jumpstart, and routine checkups across Raipur.
                  </p>
                </div>
                <div className="pt-4 text-xs font-bold text-gm-navy flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>On-Demand Support</span>
                </div>
              </div>

              <div className="bg-gm-soft border border-gm-navy/10 rounded-3xl p-7 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-gm-red tracking-widest block mb-3">04</span>
                  <h4 className="text-xl font-black text-gm-navy mb-2">New Service Centre</h4>
                  <p className="text-xs text-gm-muted leading-relaxed">
                    {CONTACT_INFO.serviceCenterAddress}
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href="/service-centre"
                    className="text-xs font-black text-gm-red hover:underline flex items-center gap-1"
                  >
                    <span>Book Service Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06: Inside Gurudev Motors Gallery */}
      <section className="py-24 sm:py-32 bg-gm-soft border-t border-gm-line" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gm-red mb-2">
                06 / Inside Gurudev Motors
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gm-navy leading-[0.9]">
                Real place.<br />Real people.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gm-muted max-w-md leading-relaxed">
              Authentic showroom and workshop visuals from our Raipur premises.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative h-64 sm:h-72 col-span-2 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/showroom-1.jpeg"
                alt="Showroom"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Main Showroom
              </span>
            </div>

            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/bikes-1.jpeg"
                alt="Motorcycles"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Motorcycles
              </span>
            </div>

            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/scooters-1.jpeg"
                alt="Scooters"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Scooters & EV
              </span>
            </div>

            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/desk.jpeg"
                alt="Consultation Desk"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Customer Lounge
              </span>
            </div>

            <div className="relative h-64 sm:h-72 col-span-2 md:col-span-1 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/workshop.jpeg"
                alt="Workshop Service"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Workshop & Care
              </span>
            </div>

            <div className="relative h-64 sm:h-72 col-span-2 rounded-2xl overflow-hidden border border-gm-line group">
              <Image
                src="/images/hero.jpeg"
                alt="Delivery celebration"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 text-white text-xs font-black uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                Raipura Multi-Brand Hub
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 07: Visit Or Enquire CTA Box */}
      <section className="py-24 bg-gm-navy text-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/20 overflow-hidden bg-[#031330]">
            <div className="lg:col-span-7 p-8 sm:p-14 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-3">
                  07 / Visit Or Enquire
                </span>
                <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.9] text-white mb-6">
                  Let&apos;s find<br />your next ride.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mb-8">
                  Call, WhatsApp or visit our showroom. For current stock, pricing, and finance availability, enquire directly with Gurudev Motors.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="bg-white hover:bg-gm-soft text-gm-navy font-black text-xs px-7 py-3.5 rounded-xl transition-all shadow"
                >
                  Call Gurudev Motors
                </a>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hello Gurudev Motors, I want to enquire about a vehicle.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gm-red hover:bg-gm-red-dark text-white font-black text-xs px-7 py-3.5 rounded-xl transition-all shadow"
                >
                  WhatsApp ↗
                </a>
                <button
                  onClick={() => openEnquiry()}
                  className="border border-white/30 hover:border-white text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all"
                >
                  Online Enquiry Form
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 sm:p-14 bg-white/[0.04] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-center gap-6">
              <div className="flex items-start gap-4">
                <span className="text-xs font-black text-gm-red mt-0.5">01</span>
                <div>
                  <b className="text-sm font-bold text-white block mb-0.5">Showroom</b>
                  <span className="text-xs text-slate-300 leading-relaxed block">
                    {CONTACT_INFO.showroomAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-xs font-black text-gm-red mt-0.5">02</span>
                <div>
                  <b className="text-sm font-bold text-white block mb-0.5">Direct Line</b>
                  <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-xs text-gm-red font-bold hover:underline block">
                    {CONTACT_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-xs font-black text-gm-red mt-0.5">03</span>
                <div>
                  <b className="text-sm font-bold text-white block mb-0.5">Vehicle Offerings</b>
                  <span className="text-xs text-slate-300 block">
                    New • Pre-Owned • Electric Mobility • Exchange
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-xs font-black text-gm-red mt-0.5">04</span>
                <div>
                  <b className="text-sm font-bold text-white block mb-0.5">New Service Centre</b>
                  <span className="text-xs text-slate-300 leading-relaxed block">
                    {CONTACT_INFO.serviceCenterAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Drive Modal */}
      <TestDriveModal
        isOpen={Boolean(testDriveVehicle)}
        onClose={() => setTestDriveVehicle(null)}
        vehicle={testDriveVehicle}
      />
    </div>
  );
}
