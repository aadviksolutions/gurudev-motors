'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageSquare, ShieldCheck, ChevronRight, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

interface HeaderProps {
  onOpenEnquiry?: (vehicle?: string) => void;
}

export default function Header({ onOpenEnquiry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Vehicles', href: '/vehicles' },
    { label: 'Pre-Owned', href: '/vehicles/pre-owned' },
    { label: 'Electric', href: '/vehicles/electric' },
    { label: 'Exchange', href: '/exchange' },
    { label: 'Finance', href: '/finance' },
    { label: 'Service Centre', href: '/service-centre' },
    { label: 'Offers', href: '/offers' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gm-line w-full section-full">
      <div className="site-container">
        <div className="flex items-center justify-between h-20">
          {/* LEFT: Gurudev Motors Logo (controlled responsive width, no text duplicates) */}
          <Link href="/" className="shrink-0 flex items-center" aria-label="Gurudev Motors Home">
            <div className="w-[145px] sm:w-[165px] lg:w-[185px] xl:w-[200px] max-w-[210px] flex items-center">
              <Image
                src="/images/logo.jpeg"
                alt="Gurudev Motors"
                width={210}
                height={58}
                priority
                className="w-full h-auto object-contain max-h-14"
              />
            </div>
          </Link>

          {/* CENTER: Navigation Links (visible on large viewports >= 1160px) */}
          <div className="hidden min-[1160px]:flex items-center gap-3 lg:gap-3.5 xl:gap-4.5 2xl:gap-5 text-[12px] xl:text-[13px] font-bold text-gm-navy shrink min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 whitespace-nowrap hover:text-gm-red ${
                    isActive ? 'text-gm-red border-b-2 border-gm-red' : 'text-gm-navy/85'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Enquire + Portal (Visible on desktop) */}
          <div className="hidden min-[1160px]:flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
              className="bg-gm-red hover:bg-gm-red-dark text-white px-3.5 xl:px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enquire</span>
              <span className="text-white/80">↗</span>
            </button>

            <Link
              href="/admin/login"
              className="border border-gm-navy/25 hover:border-gm-navy text-gm-navy px-3 xl:px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-gm-soft whitespace-nowrap shrink-0"
              title="Staff & Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gm-navy" />
              <span>Portal</span>
            </Link>
          </div>

          {/* MOBILE/TABLET CONTROLS (< 1160px) */}
          <div className="flex min-[1160px]:hidden items-center gap-2">
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm sm:hidden"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Enquire</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gm-navy hover:text-gm-red hover:bg-gm-soft transition-colors focus:outline-none"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER (SLIDES IN FROM THE RIGHT) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 min-[1160px]:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container (Right side) */}
          <div className="fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gm-line flex items-center justify-between bg-gm-soft/50">
              <div className="w-[140px]">
                <Image
                  src="/images/logo.jpeg"
                  alt="Gurudev Motors"
                  width={140}
                  height={40}
                  className="w-full h-auto object-contain"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gm-navy hover:text-gm-red rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-gm-line/50">
              <div className="space-y-1 pb-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gm-navy text-white shadow-sm'
                          : 'text-gm-navy hover:bg-gm-soft hover:text-gm-red'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gm-muted'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons inside Drawer */}
              <div className="pt-4 space-y-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenEnquiry) onOpenEnquiry();
                  }}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enquire Online</span>
                  <span>↗</span>
                </button>

                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full border border-gm-navy/30 hover:border-gm-navy text-gm-navy font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 hover:bg-gm-soft"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Staff & Admin Portal</span>
                </Link>

                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="w-full bg-gm-soft text-gm-navy hover:text-gm-red font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-gm-line"
                >
                  <Phone className="w-3.5 h-3.5 text-gm-red" />
                  <span>Call {CONTACT_INFO.phone}</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer Info */}
            <div className="p-3 bg-gm-soft/80 border-t border-gm-line text-center text-[10px] text-gm-muted">
              <span>Mahadev Ghat Chowk, Raipura, Raipur (CG)</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
