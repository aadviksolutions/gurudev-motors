'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bike, MessageCircle, Wrench, MapPin } from 'lucide-react';
export default function MobileBottomNav({
  onOpenEnquiry,
}: {
  onOpenEnquiry?: () => void;
}) {
  const path = usePathname();
  if (
    path.startsWith('/admin') ||
    (/^\/vehicles\/[^/]+$/.test(path) &&
      ![
        '/vehicles/new',
        '/vehicles/pre-owned',
        '/vehicles/used-cars',
        '/vehicles/electric',
      ].includes(path))
  )
    return null;
  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Vehicles', href: '/vehicles', icon: Bike },
    { label: 'Ask price', href: '', icon: MessageCircle },
    { label: 'Service', href: '/service-centre', icon: Wrench },
    { label: 'Visit us', href: '/contact', icon: MapPin },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const isActive =
          path === item.href ||
          (item.href === '/vehicles' && path.startsWith('/vehicles/'));
        return item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={isActive ? 'active' : ''}
            aria-current={isActive ? (path === item.href ? 'page' : 'location') : undefined}
          >
            <span className="mobile-nav-icon"><item.icon size={21} aria-hidden="true" /></span>
            <span>{item.label}</span>
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={onOpenEnquiry}
            className="nav-enquiry"
            aria-haspopup="dialog"
          >
            <span className="mobile-nav-icon"><item.icon size={21} aria-hidden="true" /></span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
