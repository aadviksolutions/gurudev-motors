'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, MessageCircle, Phone } from 'lucide-react';
import Dialog from './Dialog';
import { CONTACT_INFO } from '@/lib/constants';
import { IS_DESIGN_PREVIEW, submitPublicRequest } from '@/lib/showroom';

export default function EnquiryModal({
  isOpen,
  onClose,
  defaultVehicle = '',
  source = 'VEHICLE_ENQUIRY',
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultVehicle?: string;
  source?: string;
}) {
  const [vehicle, setVehicle] = useState(defaultVehicle);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  useEffect(() => {
    requestVersion.current += 1;
    setVehicle(defaultVehicle);
    setSubmitted(false);
    setError('');
    setSubmitting(false);
    setName('');
    setMobile('');
  }, [isOpen, defaultVehicle]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    const version = requestVersion.current;
    setSubmitting(true);
    setError('');
    try {
      await submitPublicRequest('/api/leads', {
        customerName: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        vehicleModel: vehicle || 'Help me choose a vehicle',
        source,
        notes: 'Callback requested from ' + window.location.pathname,
      });
      if (version === requestVersion.current) setSubmitted(true);
    } catch (err) {
      if (version === requestVersion.current)
        setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      if (version === requestVersion.current) setSubmitting(false);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="enquiry"
      className="enquiry-dialog"
    >
      <div className="enquiry-intro">
        <span className="eyebrow">GURUDEV MOTORS / RAIPUR</span>
        <h2>
          {submitted
            ? IS_DESIGN_PREVIEW
              ? 'Your draft enquiry is ready.'
              : 'We will be in touch.'
            : defaultVehicle
              ? 'Let’s talk about your ride.'
              : 'A little help. A better ride.'}
        </h2>
        <p>
          {submitted
            ? IS_DESIGN_PREVIEW
              ? 'This is a preview. No enquiry was sent to the showroom.'
              : 'Thanks, ' +
                name +
                '. Our team will call you about your requirement.'
            : 'Tell us what you’re looking for. We’ll help with prices, options and the next step.'}
        </p>
      </div>
      {submitted ? (
        <div className="form-success" role="status">
          <span className="success-mark">
            <Check />
          </span>
          <button className="button button-primary" onClick={onClose}>
            Continue exploring <ArrowRight size={17} />
          </button>
          {!IS_DESIGN_PREVIEW && (
            <a
              className="text-link"
              href={'https://wa.me/' + CONTACT_INFO.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="gm-form">
          <label htmlFor="enquiry-interest">
            I’m interested in <span className="optional">Optional</span>
          </label>
          <input
            id="enquiry-interest"
            list="enquiry-interests"
            value={vehicle}
            onChange={(event) => setVehicle(event.target.value)}
            placeholder="Help me choose"
            autoComplete="off"
          />
          <datalist id="enquiry-interests">
            {[
              'New bike or scooter',
              'Pre-owned two-wheeler',
              'Used car',
              'Electric vehicle',
              'Finance and EMI',
              'Exchange my vehicle',
            ].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <div className="form-row">
            <div>
              <label htmlFor="enquiry-name">Your name</label>
              <input
                id="enquiry-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="enquiry-mobile">Mobile number</label>
              <div className="phone-input">
                <span>+91</span>
                <input
                  id="enquiry-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(/\D/g, '').slice(0, 10),
                    )
                  }
                  required
                  pattern="[6-9][0-9]{9}"
                  title="A 10-digit Indian mobile number"
                  placeholder="Mobile number"
                  aria-describedby={error ? 'enquiry-error' : undefined}
                />
              </div>
            </div>
          </div>
          {error && (
            <p className="form-error" id="enquiry-error" role="alert">
              {error} <a href={'tel:' + CONTACT_INFO.phoneRaw}>Call us</a>
            </p>
          )}
          <p className="form-note">
            By requesting a callback, you agree to be contacted by Gurudev
            Motors about your enquiry.
          </p>
          <button
            className="button button-primary button-wide"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Sending request…' : 'Request a callback'}{' '}
            <ArrowRight size={18} />
          </button>
          <button type="button" className="continue-button" onClick={onClose}>
            I’ll explore first
          </button>
          <div className="dialog-foot">
            <Phone size={14} />
            <span>Prefer a call?</span>
            <a href={'tel:' + CONTACT_INFO.phoneRaw}>{CONTACT_INFO.phone}</a>
          </div>
        </form>
      )}
    </Dialog>
  );
}
