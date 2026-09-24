import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-[#04132F] text-slate-300 pt-16 pb-28 lg:pb-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                GURUDEV MOTORS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raipur&apos;s trusted multi-brand mobility destination. Bringing new motorcycles, scooters, electric mobility, and certified pre-owned vehicles with finance and exchange under one roof.
            </p>
            <div className="text-xs text-slate-300 font-semibold pt-1">
              <span className="text-gm-red font-bold">Ride Your Dream</span> • Raipur, Chhattisgarh
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Explore Vehicles
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-300">
              <li>
                <Link href="/vehicles" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>All Vehicles & Inventory</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/vehicles/new" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>New Motorcycles & Scooters</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/vehicles/pre-owned" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>Certified Pre-Owned</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/vehicles/electric" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>Electric Mobility (EV)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/exchange" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>Old Vehicle Exchange</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
              <li>
                <Link href="/finance" className="hover:text-gm-red transition-colors flex items-center justify-between">
                  <span>Finance & EMI Schemes</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Service & Facilities */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Workshop & Care
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-300">
              <li>
                <Link href="/services" className="hover:text-gm-red transition-colors">
                  Routine Maintenance & Care
                </Link>
              </li>
              <li>
                <Link href="/service-centre" className="hover:text-gm-red transition-colors">
                  New Service Centre & Lounge
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gm-red transition-colors">
                  Doorstep Service Facility
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-gm-red transition-colors">
                  Offers & Seasonal Dhamaka
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gm-red transition-colors">
                  Showroom & Workshop Gallery
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-gm-red transition-colors flex items-center gap-1.5 text-white/90 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-gm-red" />
                  Staff Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Showroom & Service
            </h4>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gm-red shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block font-bold">Main Showroom:</b>
                  <span>{CONTACT_INFO.showroomAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block font-bold">New Service Centre:</b>
                  <span>{CONTACT_INFO.serviceCenterAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-gm-red shrink-0" />
                <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-white font-bold hover:underline">
                  {CONTACT_INFO.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{CONTACT_INFO.timings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 Gurudev Motors • Mahadev Ghat Chowk, Raipura, Raipur (C.G.) • All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <a href={CONTACT_INFO.mapLink} target="_blank" rel="noreferrer" className="hover:underline text-gm-red">
              Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
