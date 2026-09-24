import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, MapPin, Award, Users, CheckCircle2, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen section-full w-full">
      <div className="site-container">
        {/* Header */}
        <div className="max-w-3xl mb-10 sm:mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2">
            01 / Our Story & Heritage
          </span>
          <h1
            className="font-black uppercase text-gm-navy tracking-tight leading-[0.92] mb-4 break-words"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
          >
            Built Around<br />The Ride.
          </h1>
          <p className="text-sm sm:text-base text-gm-muted leading-relaxed">
            Gurudev Motors was founded with a singular mission: to simplify two-wheeler ownership in Raipur by providing honest guidance, multi-brand choices, transparent used vehicle certifications, and dependable workshop care under one roof.
          </p>
        </div>

        {/* Big Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          <div className="lg:col-span-7 relative h-96 sm:h-[480px] rounded-3xl overflow-hidden border border-gm-line shadow-sm">
            <Image
              src="/images/showroom-1.jpeg"
              alt="Gurudev Motors Showroom Team"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs uppercase font-extrabold tracking-widest text-gm-red block mb-1">
                People Behind The Showroom
              </span>
              <b className="text-2xl font-black block">Gurudev Motors Team</b>
              <small className="text-xs text-white/80">Mahadev Ghat Chowk • Raipura • Raipur</small>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="border border-gm-line rounded-2xl p-6 bg-gm-soft">
              <Award className="w-6 h-6 text-gm-red mb-2" />
              <h3 className="text-lg font-black text-gm-navy mb-1">Multi-Brand Variety</h3>
              <p className="text-xs text-gm-muted leading-relaxed">
                Compare models from Hero, Honda, Suzuki, Bajaj and Kinetic Green side-by-side without visiting 5 different dealerships across town.
              </p>
            </div>

            <div className="border border-gm-line rounded-2xl p-6 bg-gm-soft">
              <ShieldCheck className="w-6 h-6 text-gm-red mb-2" />
              <h3 className="text-lg font-black text-gm-navy mb-1">Certified Pre-Owned</h3>
              <p className="text-xs text-gm-muted leading-relaxed">
                Every second-hand bike and scooter undergoes our 40-point technical checkup with 6-month engine warranty and clear RTO Raipur titles.
              </p>
            </div>

            <div className="border border-gm-line rounded-2xl p-6 bg-gm-soft">
              <Users className="w-6 h-6 text-gm-red mb-2" />
              <h3 className="text-lg font-black text-gm-navy mb-1">Local Raipur Trust</h3>
              <p className="text-xs text-gm-muted leading-relaxed">
                Deeply rooted in Raipura and Changorabhatha. We treat every customer like family with spot loan approvals and doorstep care.
              </p>
            </div>
          </div>
        </div>

        {/* Locations summary */}
        <div className="bg-gm-navy text-white rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-1">Showroom</span>
              <h3 className="text-xl font-black mb-2">Mahadev Ghat Chowk</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{CONTACT_INFO.showroomAddress}</p>
              <div className="text-xs font-bold text-white/90">Timings: {CONTACT_INFO.timings}</div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-1">Workshop</span>
              <h3 className="text-xl font-black mb-2">New Service Centre</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{CONTACT_INFO.serviceCenterAddress}</p>
              <div className="text-xs font-bold text-white/90">Timings: {CONTACT_INFO.serviceTimings}</div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gm-red" />
              <span className="text-xs text-slate-200">Have questions? Call us at</span>
              <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-sm font-bold text-white hover:underline">
                {CONTACT_INFO.phone}
              </a>
            </div>
            <Link
              href="/contact"
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get Directions & Contact ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
