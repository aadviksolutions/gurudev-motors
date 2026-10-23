'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardCheck, RefreshCw, Search } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import PublicRequestForm from '@/components/PublicRequestForm';
import { VEHICLE_BRANDS } from '@/lib/constants';
function ExchangeContent() {
  const params = useSearchParams();
  return (
    <>
      <PageHeading
        eyebrow="VEHICLE EXCHANGE"
        title="New plans. A new ride."
        description="Tell us about your current vehicle. Our team will arrange an inspection and discuss your upgrade."
      />
      <div className="site-container support-layout">
        <section className="support-intro">
          <span className="support-symbol">
            <RefreshCw size={32} />
          </span>
          <h2>Your next chapter starts here.</h2>
          <p>
            Bring your current bike or scooter and explore the options for your
            next one. A showroom inspection helps us give you a considered
            valuation.
          </p>
          <div className="process-list">
            {[
              {
                icon: ClipboardCheck,
                title: 'Share the basics',
                text: 'Your vehicle, its age and the ride you have in mind.',
              },
              {
                icon: Search,
                title: 'Meet for an inspection',
                text: 'We review the condition and vehicle documents with you.',
              },
              {
                icon: RefreshCw,
                title: 'Discuss your upgrade',
                text: 'Confirm the exchange value and the balance for your next ride.',
              },
            ].map((item, i) => (
              <div key={item.title}>
                <item.icon size={21} />
                <div>
                  <span>0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="form-note">
            Exchange values are confirmed after inspection. No instant or
            guaranteed valuation is shown.
          </p>
        </section>
        <section className="request-section">
          <span className="eyebrow">TELL US ABOUT YOUR RIDE</span>
          <h2>Start your exchange.</h2>
          <PublicRequestForm
            endpoint="/api/exchange"
            key={params.get('upgrade') || 'exchange'}
            defaults={{ upgradingVehicle: params.get('upgrade') || '' }}
            fields={[
              {
                name: 'currentBrand',
                label: 'Current brand',
                type: 'select',
                required: true,
                options: [...VEHICLE_BRANDS, 'Other'],
              },
              {
                name: 'currentModel',
                label: 'Current model',
                required: true,
                placeholder: 'e.g. Activa',
              },
              {
                name: 'registrationYear',
                label: 'Registration year',
                required: true,
                type: 'number',
                min: 1980,
                max: new Date().getFullYear(),
              },
              {
                name: 'kmDriven',
                label: 'Kilometres driven',
                required: true,
                type: 'number',
                min: 0,
                max: 1000000,
              },
              {
                name: 'condition',
                label: 'Condition',
                type: 'select',
                options: ['EXCELLENT', 'GOOD', 'FAIR'],
              },
              {
                name: 'upgradingVehicle',
                label: 'Your next vehicle',
                required: true,
                placeholder: 'Model or help me choose',
              },
              {
                name: 'message',
                label: 'Anything else?',
                type: 'textarea',
                full: true,
                placeholder: 'Condition, documents or questions',
              },
            ]}
            buttonLabel="Request an evaluation"
          />
        </section>
      </div>
    </>
  );
}
export default function ExchangePage() {
  return (
    <Suspense
      fallback={<div className="site-container section-space">Loading...</div>}
    >
      <ExchangeContent />
    </Suspense>
  );
}
