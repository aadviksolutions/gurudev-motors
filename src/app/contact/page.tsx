import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import PageHeading from '@/components/PageHeading';
import PublicRequestForm from '@/components/PublicRequestForm';
import { CONTACT_INFO } from '@/lib/constants';
export default function ContactPage() {
  return (
    <>
      <PageHeading
        eyebrow="CONTACT & DIRECTIONS"
        title="A real conversation starts here."
        description="Call, send us a message, or stop by our showroom in Raipura. We are happy to help."
      />
      <div className="site-container support-layout">
        <section className="support-intro">
          <div className="contact-location">
            <MapPin size={23} />
            <div>
              <span className="eyebrow">THE SHOWROOM</span>
              <h2>Come say hello.</h2>
              <p>{CONTACT_INFO.showroomAddress}</p>
              <p>
                <Clock3 size={14} />
                {CONTACT_INFO.timings}
              </p>
              <a
                className="button button-secondary"
                href={CONTACT_INFO.mapLink}
                target="_blank"
                rel="noreferrer"
              >
                Get directions <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="contact-channels">
            <a href={'tel:' + CONTACT_INFO.phoneRaw}>
              <Phone size={20} />
              <span>
                <small>Call the team</small>
                {CONTACT_INFO.phone}
              </span>
              <ArrowUpRight size={17} />
            </a>
            <a
              href={'https://wa.me/' + CONTACT_INFO.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} />
              <span>
                <small>Chat with us</small>WhatsApp Gurudev Motors
              </span>
              <ArrowUpRight size={17} />
            </a>
            <a href={'mailto:' + CONTACT_INFO.email}>
              <Mail size={20} />
              <span>
                <small>Email</small>
                {CONTACT_INFO.email}
              </span>
              <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="contact-location">
            <MapPin size={20} />
            <div>
              <h3>Visiting for service?</h3>
              <p>{CONTACT_INFO.serviceCenterAddress}</p>
              <p>{CONTACT_INFO.serviceTimings}</p>
              <Link className="text-link" href="/service-centre">
                Request a service slot <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
        <section className="request-section">
          <span className="eyebrow">WE&apos;RE LISTENING</span>
          <h2>What&apos;s on your mind?</h2>
          <p>Ask about a vehicle, prices, finance or your next visit.</p>
          <PublicRequestForm
            endpoint="/api/leads"
            payload={{
              source: 'CONTACT_FORM',
              vehicleModel: 'Contact enquiry',
            }}
            fields={[
              {
                name: 'vehicleModel',
                label: 'Vehicle or requirement',
                placeholder: 'e.g. Activa, exchange or finance',
                full: true,
              },
              { name: 'email', label: 'Email', type: 'email', full: true },
              {
                name: 'notes',
                label: 'Your message',
                type: 'textarea',
                placeholder: 'How can we help?',
                full: true,
              },
            ]}
            buttonLabel="Send your enquiry"
          />
        </section>
      </div>
    </>
  );
}
