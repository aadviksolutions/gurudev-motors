'use client';
import PublicRequestForm from './PublicRequestForm';
export default function ContactDirectForm() {
  return (
    <PublicRequestForm
      endpoint="/api/leads"
      payload={{ source: 'CONTACT_FORM' }}
      fields={[
        { name: 'vehicleModel', label: 'Vehicle or requirement', full: true },
        { name: 'notes', label: 'Your message', type: 'textarea', full: true },
      ]}
      buttonLabel="Send enquiry"
    />
  );
}
