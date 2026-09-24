'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';
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
    { label: 'Services', href: '/services' },
    { label: 'Service Centre', href: '/service-centre' },
    { label: 'Offers', href: '/offers' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gm-line transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-44 h-14 flex items-center">
              <Image
                src="/images/logo.jpeg"
                alt="Gurudev Motors"
                width={176}
                height={56}
                priority
                className="object-contain max-h-14"
                onError={(e) => {
                  // Fallback to text styling if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-gm-navy group-hover:text-gm-red transition-colors flex items-center gap-1.5">
                  GURUDEV MOTORS
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-gm-muted">
                  Raipur • Ride Your Dream
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6 text-[13px] font-bold text-gm-ink">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 hover:text-gm-red ${
                    isActive ? 'text-gm-red border-b-2 border-gm-red' : 'text-gm-navy/85'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
              className="bg-gm-red hover:bg-gm-red-dark text-white px-5 py-2.5 rounded-full text-xs font-black tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Enquire ↗
            </button>

            <Link
              href="/admin/login"
              className="border border-gm-navy/20 hover:border-gm-navy text-gm-navy px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 hover:bg-gm-soft"
              title="Staff & Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gm-navy" />
              <span>Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
              className="bg-gm-red text-white text-xs font-bold px-3 py-1.5 rounded-full sm:hidden"
            >
              Enquire
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gm-navy hover:text-gm-red focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gm-line px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm font-bold text-gm-navy pb-4 border-b border-gm-line">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg flex items-center justify-between ${
                  pathname === link.href ? 'bg-gm-red text-white' : 'hover:bg-gm-soft'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenEnquiry) onOpenEnquiry();
              }}
              className="w-full bg-gm-red hover:bg-gm-red-dark text-white py-3 rounded-xl text-center text-sm font-bold"
            >
              Submit Vehicle Enquiry ↗
            </button>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${CONTACT_INFO.phoneRaw}`}
                className="flex items-center justify-center gap-1.5 border border-gm-line py-2.5 rounded-xl text-xs font-bold text-gm-navy bg-gm-soft"
              >
                <Phone className="w-3.5 h-3.5 text-gm-red" />
                Call Showroom
              </a>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 border border-gm-navy py-2.5 rounded-xl text-xs font-bold text-gm-navy"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
