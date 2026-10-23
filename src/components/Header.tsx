'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Menu,
  Phone,
  ArrowRight,
  Bike,
  CarFront,
  Zap,
  Wrench,
  RefreshCw,
  CircleHelp,
  Tag,
  Images,
  ShieldCheck,
} from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import Dialog from './Dialog';

const links = [
  { label: 'Explore vehicles', href: '/vehicles' },
  { label: 'Used bikes', href: '/vehicles/pre-owned' },
  { label: 'Finance', href: '/finance' },
  { label: 'Service', href: '/service-centre' },
];
const moreLinks = [
  { label: 'Electric vehicles', href: '/vehicles/electric', icon: Zap },
  { label: 'Used cars', href: '/vehicles/used-cars', icon: CarFront },
  { label: 'Exchange', href: '/exchange', icon: RefreshCw },
  { label: 'Offers', href: '/offers', icon: Tag },
  { label: 'About us', href: '/about', icon: CircleHelp },
  { label: 'Gallery', href: '/gallery', icon: Images },
  { label: 'Contact & directions', href: '/contact', icon: MapPin },
];
export default function Header({
  onOpenEnquiry,
}: {
  onOpenEnquiry?: (vehicle?: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  return (
    <>
      <div className="utility-bar">
        <div className="site-container utility-inner">
          <span className="utility-offer">New bikes <span aria-hidden="true">|</span> Used bikes <span aria-hidden="true">|</span> EMI & exchange</span>
          <div className="utility-contact">
            <Link href="/contact"><MapPin size={13} /> Raipura, Raipur</Link>
            <a href={'tel:' + CONTACT_INFO.phoneRaw}><Phone size={13} /> {CONTACT_INFO.phone}</a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/" className="wordmark" aria-label="Gurudev Motors home">
            <Image
              src="/images/logo.jpeg"
              alt="Gurudev Motors - Ride Your Dream"
              width={1310}
              height={745}
              sizes="(max-width: 900px) 112px, 120px"
              className="brand-logo"
              priority
            />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="more-nav">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                aria-controls="more-links"
              >
                More <ChevronDown size={14} />
              </button>
              {moreOpen && (
                <>
                  <button
                    className="menu-backdrop"
                    onClick={() => setMoreOpen(false)}
                    tabIndex={-1}
                    aria-label="Close more navigation"
                  />
                  <div id="more-links" className="more-menu">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                      >
                        <link.icon size={16} />
                        {link.label}
                        <ArrowUpRight size={14} />
                      </Link>
                    ))}
                    <Link href="/admin/login" className="more-staff-link" onClick={() => setMoreOpen(false)}><ShieldCheck size={16} /> Staff login <ArrowUpRight size={14} /></Link>
                  </div>
                </>
              )}
            </div>
          </nav>
          <Link href="/admin/login" className="header-staff-link">Staff login</Link>
          <button
            className="button button-primary header-enquiry"
            onClick={() => onOpenEnquiry?.()}
          >
            Ask for price <ArrowUpRight size={17} />
          </button>
          <div className="mobile-header-actions">
            <a
              href={'tel:' + CONTACT_INFO.phoneRaw}
              className="icon-button"
              aria-label="Call Gurudev Motors"
            >
              <Phone size={20} />
            </a>
            <button
              className="icon-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="navigation"
        className="navigation-dialog"
      >
        <span className="eyebrow">GURUDEV MOTORS</span>
        <h2>Where to?</h2>
        <div className="mobile-menu-links">
          {[
            { label: 'Explore vehicles', href: '/vehicles', icon: Bike },
            {
              label: 'Used bikes',
              href: '/vehicles/pre-owned',
              icon: RefreshCw,
            },
            { label: 'Finance', href: '/finance', icon: CircleHelp },
            { label: 'Service centre', href: '/service-centre', icon: Wrench },
            ...moreLinks,
          ].map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setMenuOpen(false)}
            >
              <link.icon size={19} />
              <span>{link.label}</span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
        <Link
          href="/admin/login"
          className="staff-link"
          onClick={() => setMenuOpen(false)}
        >
          <ShieldCheck size={16} /> Staff login
        </Link>
      </Dialog>
    </>
  );
}
