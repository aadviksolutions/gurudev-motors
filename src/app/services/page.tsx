'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, Shield, CheckCircle2, Clock, MapPin, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function ServicesPage() {
  const servicePackages = [
    {
      title: 'Periodic General Service',
      price: '₹349',
      features: [
        'Complete washing & polish',
        'Engine oil drain & refill (oil extra)',
        'Spark plug clean & gap check',
        'Brake shoe inspection & adjustment',
        'Drive chain lubrication & tension',
        'Battery voltage & electrical test',
      ],
      tag: 'MOST POPULAR',
    },
    {
      title: 'Full Premium Service',
      price: '₹799',
      features: [
        'Everything in General Service',
        'Carburetor / Injector cleaning',
        'Brake caliper & drum overhaul',
        'Clutch play & cable lubrication',
        'Wheel bearing inspection',
        'Anti-rust frame treatment',
      ],
      tag: 'RECOMMENDED',
    },
    {
      title: 'Doorstep Raipur Service',
      price: '₹499',
      features: [
        'Technician visits your doorstep in Raipur',
        'On-the-spot routine maintenance',
        'Engine oil change',
        'Battery jump-start & testing',
        'Minor electrical and wire fixes',
        'Genuine parts doorstep delivery',
      ],
      tag: 'CONVENIENT',
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Wrench className="w-4 h-4 text-gm-red" />
            Gurudev Motors Workshop
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Keep Your Machine In Prime Shape
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Authorized multi-brand two-wheeler maintenance with genuine spares, skilled technicians, and an air-conditioned customer lounge in Raipura, Raipur.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {servicePackages.map((pkg, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm hover:shadow-gm hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gm-red bg-gm-red/10 px-2.5 py-1 rounded-full inline-block mb-3">
                  {pkg.tag}
                </span>
                <h3 className="text-2xl font-black text-gm-navy tracking-tight mb-2">
                  {pkg.title}
                </h3>
                <div className="text-3xl font-black text-gm-navy mb-6">
                  {pkg.price}<span className="text-xs text-gm-muted font-normal"> / labour</span>
                </div>

                <ul className="space-y-3 text-xs text-gm-muted">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/service-centre"
                  className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-extrabold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Book This Service ↗</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Workshop Location Banner */}
        <div className="bg-gm-navy text-white rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-white/10">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-1">
              Visit The Service Center
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              New Service Centre & Lounge
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {CONTACT_INFO.serviceCenterAddress}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gm-red" />
                {CONTACT_INFO.serviceTimings}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/service-centre"
              className="bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-colors"
            >
              Book Service Slot ↗
            </Link>
            <a
              href={`tel:${CONTACT_INFO.phoneRaw}`}
              className="border border-white/20 hover:border-white text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Workshop
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
