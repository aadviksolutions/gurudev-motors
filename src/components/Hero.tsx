'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

interface HeroProps {
  onOpenEnquiry?: () => void;
}

export default function Hero({ onOpenEnquiry }: HeroProps) {
  const modal = useModal();
  const handleEnquiry = onOpenEnquiry || (() => modal.openEnquiry());
  return (
    <header className="relative min-h-[640px] md:min-h-[720px] flex items-center overflow-hidden bg-gm-navy-dark">
      {/* Background with automotive visual styling */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: `url('/images/hero.jpeg')` }}
      />
      
      {/* Radial and gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#031330] via-[#031330]/90 to-[#031330]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#031330] via-transparent to-transparent" />
      
      {/* Subtle brand glow accent */}
      <div className="absolute -right-24 top-20 w-96 h-96 bg-gm-red/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 text-xs md:text-sm uppercase font-black tracking-widest text-white/90 mb-6">
            <span className="w-10 h-1 bg-gm-red rounded-full" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gm-red" />
              Raipur&apos;s multi-brand mobility destination
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.88] mb-6">
            RIDE YOUR<br />
            <span className="text-gm-red">DREAM.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#DBE4F4] max-w-2xl leading-relaxed mb-9">
            New motorcycles, scooters, electric mobility and carefully selected pre-owned vehicles — with finance, exchange and workshop support in Raipur.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/vehicles"
              className="bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-sm px-7 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 group"
            >
              <span>Explore Vehicles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="bg-white hover:bg-gm-soft text-gm-navy font-extrabold text-sm px-7 py-4 rounded-xl shadow transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-gm-red" />
              <span>Visit Showroom</span>
            </Link>

            <button
              onClick={handleEnquiry}
              className="border border-white/30 hover:border-white text-white font-extrabold text-sm px-6 py-4 rounded-xl transition-all hover:bg-white/10"
            >
              Quick Enquiry ↗
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
