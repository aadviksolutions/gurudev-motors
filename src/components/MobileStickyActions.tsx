'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function MobileStickyActions() {
  const pathname = usePathname();

  // Hide in admin panel
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <aside aria-label="Quick contact actions" className="fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:hidden pointer-events-none">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-2 pointer-events-auto">
        <a
          href={`tel:${CONTACT_INFO.phoneRaw}`}
          className="bg-white text-gm-navy font-black text-xs py-2.5 px-4 rounded-xl shadow-lg border border-gm-line flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5 text-gm-red" />
          <span>Call Now</span>
        </a>

        <a
          href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hello Gurudev Motors, I would like to enquire about a vehicle.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>WhatsApp ↗</span>
        </a>
      </div>
    </aside>
  );
}
