import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function TopBar() {
  return (
    <div className="bg-gm-navy-dark text-white/90 text-xs py-2 px-4 border-b border-white/10 hidden sm:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-medium tracking-wide flex items-center gap-1.5 text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-gm-red"></span>
            New • Pre-Owned • Electric • Exchange • Finance
          </span>
          <span className="hidden lg:flex items-center gap-1 text-white/60">
            <MapPin className="w-3.5 h-3.5 text-gm-red" />
            Mahadev Ghat Chowk, Raipura, Raipur
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden md:flex items-center gap-1 text-white/60">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            {CONTACT_INFO.timings}
          </span>
          <a
            href={`tel:${CONTACT_INFO.phoneRaw}`}
            className="flex items-center gap-1.5 text-white font-bold hover:text-gm-red transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gm-red" />
            {CONTACT_INFO.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
