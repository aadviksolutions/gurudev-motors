import Link from 'next/link';
import { ArrowUpRight, BatteryCharging, Settings2, Wrench } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
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
