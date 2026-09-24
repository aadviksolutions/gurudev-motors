'use client';

import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function TopBar() {
  return (
    <div className="bg-gm-navy-dark text-white/90 text-xs py-2 border-b border-white/10 hidden md:block w-full">
      <div className="site-container flex items-center justify-between">
        {/* Left Links / Breadcrumb */}
        <div className="flex items-center gap-3 text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-gm-red inline-block shrink-0"></span>
          <span className="font-semibold tracking-wide text-xs">
            New • Pre-Owned • Electric • Exchange • Finance
          </span>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-5 text-xs">
          <span className="hidden lg:flex items-center gap-1.5 text-white/70">
            <MapPin className="w-3.5 h-3.5 text-gm-red shrink-0" />
            <span>Mahadev Ghat Chowk, Raipura, Raipur</span>
          </span>
          <a
            href={`tel:${CONTACT_INFO.phoneRaw}`}
            className="flex items-center gap-1.5 text-white font-bold hover:text-gm-red transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gm-red shrink-0" />
            <span>{CONTACT_INFO.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
