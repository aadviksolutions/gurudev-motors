import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="wordmark" aria-label="Gurudev Motors home">
              <Image
                src="/images/logo-footer.png"
                alt="Gurudev Motors - Ride Your Dream"
                width={1310}
                height={745}
                sizes="156px"
                className="brand-logo"
              />
            </Link>
            <p>
              Your next ride. Your local showroom.
              <br />
              Raipura, Raipur, Chhattisgarh.
            </p>
            <a className="text-link" href={'tel:' + CONTACT_INFO.phoneRaw}>
              <Phone size={15} /> {CONTACT_INFO.phone}
            </a>
          </div>
          <div>
            <h3>Find your ride</h3>
            <Link href="/vehicles/new">New vehicles</Link>
            <Link href="/vehicles/pre-owned">Used bikes</Link>
            <Link href="/vehicles/used-cars">Used cars</Link>
            <Link href="/vehicles/electric">Electric vehicles</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link href="/finance">Finance & EMI</Link>
            <Link href="/exchange">Exchange your vehicle</Link>
            <Link href="/service-centre">Book a service</Link>
            <Link href="/offers">Latest offers</Link>
          </div>
          <div>
            <h3>Visit Gurudev Motors</h3>
            <p>{CONTACT_INFO.showroomAddress}</p>
            <a
              className="text-link"
              href={CONTACT_INFO.mapLink}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={15} /> Get directions <ArrowUpRight size={14} />
            </a>
            <p className="footer-hours">{CONTACT_INFO.timings}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gurudev Motors</span>
          <div>
            <Link href="/about">About</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin/login">Staff login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
