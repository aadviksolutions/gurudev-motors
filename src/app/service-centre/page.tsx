'use client';
import { Clock3, MapPin, Phone, Wrench } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import PublicRequestForm from '@/components/PublicRequestForm';
import { CONTACT_INFO } from '@/lib/constants';
export default function ServiceCentrePage() {
  const today = new Date().toLocaleDateString('en-CA');
  return (
    <>
      <PageHeading
        eyebrow="SERVICE CENTRE"
        title="Keep your ride feeling right."
        description="Routine maintenance or something that needs attention. Tell our workshop team what your vehicle needs."
      />
      <div className="site-container support-layout">
        <section className="support-intro">
          <span className="support-symbol">
            <Wrench size={32} />
          </span>
          <h2>Care for the everyday miles.</h2>
          <p>
            Choose a preferred date and let us know the issue. Our team will
            confirm the slot, available services and any charges before your
            visit.
          </p>
          <div className="service-options">
            {[
              'General service',
              'Oil change',
              'Brakes & tyres',
              'Battery & electrical',
              'Engine repairs',
              'Periodic maintenance',
            ].map((item) => (
              <span key={item}>
                <Wrench size={14} />
                {item}
              </span>
            ))}
          </div>
          <div className="contact-location">
            <MapPin size={20} />
            <div>
              <h3>Gurudev Motors workshop</h3>
              <p>{CONTACT_INFO.serviceCenterAddress}</p>
            </div>
          </div>
          <div className="contact-location">
            <Clock3 size={20} />
            <p>{CONTACT_INFO.serviceTimings}</p>
          </div>
          <a className="text-link" href={'tel:' + CONTACT_INFO.phoneRaw}>
            <Phone size={16} />
            {CONTACT_INFO.phone}
          </a>
        </section>
        <section className="request-section">
          <span className="eyebrow">BOOK A LITTLE CARE</span>
          <h2>Request a service slot.</h2>
          <PublicRequestForm
            endpoint="/api/service-bookings"
            fields={[
              {
                name: 'vehicleModel',
                label: 'Vehicle model',
                required: true,
                placeholder: 'Brand and model',
              },
              {
                name: 'registrationNumber',
                label: 'Registration number',
                placeholder: 'CG 04 AB 1234',
              },
              {
                name: 'serviceType',
                label: 'Service required',
                type: 'select',
                required: true,
                options: [
                  'General Service',
                  'Oil Change',
                  'Brake Service',
                  'Tyre Service',
                  'Battery',
                  'Engine',
                  'Electrical',
                  'Periodic Maintenance',
                  'Other',
                ],
                full: true,
              },
              {
                name: 'preferredDate',
                label: 'Preferred date',
                type: 'date',
                required: true,
                min: today,
              },
              {
                name: 'preferredTime',
                label: 'Preferred time',
                type: 'select',
                required: true,
                options: [
                  '10:00 AM',
                  '12:00 PM',
                  '02:00 PM',
                  '04:00 PM',
                  '06:00 PM',
                ],
              },
              {
                name: 'additionalRequirement',
                label: 'What needs attention?',
                type: 'textarea',
                full: true,
                placeholder: 'Tell us about any issues or requests',
              },
            ]}
            buttonLabel="Request service appointment"
            successMessage="Our workshop team will call to confirm your slot and service requirements."
          />
        </section>
      </div>
    </>
  );
}
