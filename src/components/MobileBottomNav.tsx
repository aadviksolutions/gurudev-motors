'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MessageSquare, Wrench, User } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenEnquiry?: () => void;
}

export default function MobileBottomNav({ onOpenEnquiry }: MobileBottomNavProps) {
  const pathname = usePathname();

  // If in admin dashboard, don't show public bottom nav
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Vehicles', href: '/vehicles', icon: Compass },
    { label: 'Enquiry', isAction: true, icon: MessageSquare },
    { label: 'Services', href: '/services', icon: Wrench },
    { label: 'Portal', href: '/admin/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gm-line px-2 py-1.5 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={onOpenEnquiry}
                className="flex flex-col items-center justify-center py-1 text-gm-red hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-gm-red/10 flex items-center justify-center mb-0.5">
                  <Icon className="w-4 h-4 text-gm-red" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href!}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-gm-navy font-black' : 'text-gm-muted hover:text-gm-navy font-bold'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-gm-red stroke-[2.5]' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
