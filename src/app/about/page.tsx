import Link from 'next/link';
import { ArrowUpRight, Bike, MapPin, RefreshCw, Wrench } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import { CONTACT_INFO, VEHICLE_BRANDS } from '@/lib/constants';
export default function AboutPage() {
  return (
    <>
      <PageHeading
        eyebrow="ABOUT GURUDEV MOTORS"
        title="Your local showroom. More possibilities."
        description="New rides, pre-owned options and everyday vehicle care, right here in Raipura, Raipur."
      />
      <section className="site-container section-space">
        <div className="about-intro">
          <h2>
            One conversation.
            <br />A world of choice.
          </h2>
          <p>
            Gurudev Motors brings together vehicles from TVS, Honda, Suzuki,
            Hero and Bajaj. Compare your options, talk through finance and
            exchange, and find the vehicle that suits your everyday life.
          </p>
        </div>
        <div className="brand-list about-brands">
          {VEHICLE_BRANDS.map((brand) => (
            <Link
              key={brand}
              className={'brand-word brand-' + brand.toLowerCase()}
              href={'/vehicles?brand=' + brand}
            >
              {brand}
            </Link>
          ))}
        </div>
        <div className="service-list">
          {[
            {
              icon: Bike,
              title: 'Find your next ride',
              text: 'Explore new bikes and scooters, pre-owned vehicles, used cars and electric options. Availability is confirmed with the showroom.',
              href: '/vehicles',
              action: 'Explore vehicles',
            },
            {
              icon: RefreshCw,
              title: 'Make the next step simpler',
              text: 'Discuss an exchange or a finance plan. Our team helps you understand the process and the documents you may need.',
              href: '/exchange',
              action: 'Explore exchange',
            },
            {
              icon: Wrench,
              title: 'Care beyond the purchase',
              text: 'Book a workshop appointment for routine maintenance, repairs or a concern you would like checked.',
              href: '/service-centre',
              action: 'Book a service',
            },
          ].map((item) => (
            <div key={item.title}>
              <item.icon size={25} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="text-link" href={item.href}>
                {item.action}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className="visit-band">
        <div className="site-container service-banner">
          <MapPin size={30} />
          <div>
            <span className="eyebrow">COME FIND US</span>
            <h2>Gurudev Motors, Raipura.</h2>
            <p>{CONTACT_INFO.showroomAddress}</p>
          </div>
          <Link className="button button-secondary" href="/contact">
            Contact & directions <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
