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
    <header className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden bg-gm-navy-dark w-full section-full">
      {/* Background image with automotive visual styling */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-100 transition-transform duration-1000 ease-out pointer-events-none"
        style={{ backgroundImage: `url('/images/hero.jpeg')` }}
      />
      
      {/* Radial and gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#031330] via-[#031330]/90 to-[#031330]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#031330] via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle brand glow accent - contained within overflow-hidden */}
      <div className="absolute right-0 top-10 w-72 h-72 sm:w-96 sm:h-96 bg-gm-red/20 rounded-full blur-3xl pointer-events-none" />

      {/* Centered max-width container */}
      <div className="relative z-10 site-container py-14 sm:py-20 lg:py-24 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-white/90 mb-4 sm:mb-6 flex-wrap">
            <span className="w-8 sm:w-10 h-1 bg-gm-red rounded-full shrink-0" />
            <span className="flex items-center gap-1.5 break-words">
              <Sparkles className="w-3.5 h-3.5 text-gm-red shrink-0" />
              Raipur&apos;s multi-brand mobility destination
            </span>
          </div>

          {/* Heading with responsive clamp */}
          <h1
            className="font-black uppercase tracking-tight text-white leading-[0.9] mb-5 sm:mb-6 break-words"
            style={{ fontSize: 'clamp(2.35rem, 6.5vw + 0.5rem, 5.5rem)' }}
          >
            RIDE YOUR<br />
            <span className="text-gm-red">DREAM.</span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-[#DBE4F4] max-w-2xl leading-relaxed mb-8 sm:mb-9">
            New motorcycles, scooters, electric mobility and carefully selected pre-owned vehicles — with finance, exchange and workshop support in Raipur.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/vehicles"
              className="bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs sm:text-sm px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 group shrink-0"
            >
              <span>Explore Vehicles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="bg-white hover:bg-gm-soft text-gm-navy font-extrabold text-xs sm:text-sm px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl shadow transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 shrink-0"
            >
              <MapPin className="w-4 h-4 text-gm-red shrink-0" />
              <span>Visit Showroom</span>
            </Link>

            <button
              onClick={handleEnquiry}
              className="border border-white/30 hover:border-white text-white font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all hover:bg-white/10 shrink-0"
            >
              Quick Enquiry ↗
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
