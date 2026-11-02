import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BatteryCharging, Settings2, Wrench } from 'lucide-react';
import PageHeading from '@/components/PageHeading';

export const metadata: Metadata = {
  title: 'Two-Wheeler Service & Workshop in Raipur | Gurudev Motors',
  description:
    'Authorised two-wheeler servicing, periodic maintenance, engine repairs, battery diagnostics, and genuine spare parts at Gurudev Motors Raipura, Raipur.',
  keywords: [
    'Bike service Raipur',
    'Two wheeler service Raipura',
    'Scooty repair Raipur',
    'Motorcycle workshop Raipur',
    'Activa servicing Raipur',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/services',
  },
  openGraph: {
    title: 'Two-Wheeler Service & Workshop in Raipur | Gurudev Motors',
    description: 'Expert servicing, genuine spares, and transparent estimates at Raipura, Raipur.',
    url: 'https://gurudevmotors.com/services',
  },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeading
        eyebrow="WORKSHOP SERVICES"
        title="A little attention. A better ride."
        description="Explore workshop care for your two-wheeler. Our team will confirm the work and charges before proceeding."
      />
      <section className="site-container section-space">
        <div className="service-list">
          {[
            {
              icon: Wrench,
              title: 'Routine maintenance',
              text: 'General servicing, oil changes, chain care and periodic checks.',
            },
            {
              icon: Settings2,
              title: 'Repairs & inspections',
              text: 'Brakes, tyres, engine concerns and issues that need a closer look.',
            },
            {
              icon: BatteryCharging,
              title: 'Electrical & battery',
              text: 'Battery health, starting problems and electrical diagnostics.',
            },
          ].map((item) => (
            <div key={item.title}>
              <item.icon size={27} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="text-link" href="/service-centre">
                Request a service <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
        <div className="service-banner">
          <div>
            <span className="eyebrow">LET&apos;S TAKE A LOOK</span>
            <h2>Tell us what needs attention.</h2>
            <p>Choose a preferred time to visit our Raipura workshop.</p>
          </div>
          <Link className="button button-primary" href="/service-centre">
            Book a service <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
