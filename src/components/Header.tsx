'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageSquare, ShieldCheck, ChevronRight, Phone, Home, Sparkles, Car, Zap, RefreshCw, Landmark, Wrench, Tag, Image as ImageIcon, Info, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

interface HeaderProps {
  onOpenEnquiry?: (vehicle?: string) => void;
}

export default function Header({ onOpenEnquiry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Vehicles', href: '/vehicles', icon: Car },
    { label: 'Pre-Owned', href: '/vehicles/pre-owned', icon: RefreshCw },
    { label: 'Electric', href: '/vehicles/electric', icon: Zap },
    { label: 'Exchange', href: '/exchange', icon: Sparkles },
    { label: 'Finance', href: '/finance', icon: Landmark },
    { label: 'Service Centre', href: '/service-centre', icon: Wrench },
    { label: 'Offers', href: '/offers', icon: Tag },
    { label: 'Gallery', href: '/gallery', icon: ImageIcon },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: MapPin },
  ];

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleEnquireClick = () => {
    setMobileMenuOpen(false);
    if (onOpenEnquiry) {
      onOpenEnquiry();
    }
  };

  return (
    <>
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
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg text-gm-navy hover:text-gm-red hover:bg-gm-soft transition-colors focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open mobile navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER - PORTALED TO DOCUMENT.BODY TO PREVENT ANY PARENT CONTAINER/FILTER CLIPPING */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-[9999] min-[1160px]:hidden transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Dark Translucent Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Right-Side Navigation Drawer */}
          <aside
            className={`fixed top-0 right-0 bottom-0 h-full w-[85vw] max-w-[380px] bg-white shadow-2xl flex flex-col z-[10000] transform transition-transform duration-300 ease-out border-l border-gm-line ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header with Logo & Close Button */}
            <div className="p-4 border-b border-gm-line flex items-center justify-between bg-white shrink-0">
              <Link
                href="/"
                onClick={handleNavClick}
                className="w-[145px] sm:w-[160px] flex items-center"
                aria-label="Gurudev Motors Home"
              >
                <Image
                  src="/images/logo.jpeg"
                  alt="Gurudev Motors"
                  width={160}
                  height={45}
                  priority
                  className="w-full h-auto object-contain max-h-12"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gm-navy hover:text-gm-red hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 divide-y divide-gm-line/60">
              {/* Core Nav Items: Home, Vehicles, Pre-Owned, Electric, Exchange, Finance, Service Centre, Offers, Gallery, About, Contact */}
              <div className="space-y-1 pb-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-red-50 text-gm-red font-black border-l-4 border-gm-red shadow-xs'
                          : 'text-gm-navy hover:bg-slate-50 hover:text-gm-red'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-gm-red' : 'text-gm-muted'}`} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-gm-red' : 'text-gm-muted'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons: Enquire & Portal */}
              <div className="pt-4 space-y-2.5">
                {/* 12. Enquire */}
                <button
                  type="button"
                  onClick={handleEnquireClick}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire Online</span>
                  <span className="text-white/80">↗</span>
                </button>

                {/* 13. Portal */}
                <Link
                  href="/admin/login"
                  onClick={handleNavClick}
                  className="w-full border border-gm-navy/25 hover:border-gm-navy text-gm-navy font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-gm-soft"
                >
                  <ShieldCheck className="w-4 h-4 text-gm-navy" />
                  <span>Dealership Portal Login</span>
                </Link>

                {/* Direct Call Assistance */}
                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="w-full bg-gm-soft text-gm-navy hover:text-gm-red font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gm-line"
                >
                  <Phone className="w-3.5 h-3.5 text-gm-red" />
                  <span>Call {CONTACT_INFO.phone}</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer with Showroom Address */}
            <div className="p-3 bg-gm-soft/80 border-t border-gm-line text-center text-[10px] text-gm-muted shrink-0">
              <span className="font-bold text-gm-navy block">Gurudev Motors • Raipur</span>
              <span className="text-[10px] text-gm-muted">Mahadev Ghat Chowk, Raipura, Raipur (CG)</span>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
