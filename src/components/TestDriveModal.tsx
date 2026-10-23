'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import {
  ShowroomVehicle,
  IS_DESIGN_PREVIEW,
  submitPublicRequest,
} from '@/lib/showroom';
import Dialog from './Dialog';

export default function TestDriveModal({
  isOpen,
  onClose,
  vehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: ShowroomVehicle | null;
}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:30 AM');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const version = useRef(0);
  const today = new Date().toLocaleDateString('en-CA');
  useEffect(() => {
    version.current++;
    setName('');
    setMobile('');
    setDate('');
    setTime('10:30 AM');
    setSubmitted(false);
    setSubmitting(false);
    setError('');
  }, [isOpen, vehicle?.id]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vehicle || vehicle.stockStatus !== 'IN_STOCK') return;
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter your name and a valid 10-digit Indian mobile number.');
      return;
    }
    if (!date || date < today) {
      setError('Choose today or a later date.');
      return;
    }
    const request = version.current;
    setSubmitting(true);
    setError('');
    try {
      await submitPublicRequest('/api/test-drives', {
        customerName: name.trim(),
        mobile,
        vehicleId: vehicle.id,
        preferredDate: date,
        preferredTime: time,
        notes: 'Showroom test ride requested',
      });
      if (request === version.current) setSubmitted(true);
    } catch (err) {
      if (request === version.current)
        setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      if (request === version.current) setSubmitting(false);
    }
  };
  return (
    <Dialog
      open={isOpen && !!vehicle}
      onClose={onClose}
      title="test ride"
      className="enquiry-dialog"
    >
      <div className="enquiry-intro">
        <span className="eyebrow">MEET YOUR NEXT RIDE</span>
        <h2>
          {submitted
            ? IS_DESIGN_PREVIEW
              ? 'Your draft request is ready.'
              : 'Test ride requested.'
            : 'Try it. Feel the difference.'}
        </h2>
        <p>
          {submitted
            ? IS_DESIGN_PREVIEW
              ? 'This is a preview. No test ride has been booked.'
              : 'Our team will call to confirm your preferred slot and vehicle availability.'
            : vehicle?.brand +
              ' ' +
              vehicle?.model +
              ' at Gurudev Motors, Raipura.'}
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
        </div>
      ) : (
        <form className="gm-form" onSubmit={submit}>
          <div className="form-row">
            <div>
              <label htmlFor="ride-name">Your name</label>
              <input
                id="ride-name"
                required
                autoComplete="name"
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="ride-mobile">Mobile number</label>
              <input
                id="ride-mobile"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="10-digit mobile"
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="ride-date">Preferred date</label>
              <input
                id="ride-date"
                type="date"
                required
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ride-time">Preferred time</label>
              <select
                id="ride-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {[
                  '10:30 AM',
                  '12:00 PM',
                  '02:30 PM',
                  '04:30 PM',
                  '06:00 PM',
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <p className="form-note">
            Your preferred slot is subject to confirmation. By requesting a test
            ride, you agree to be contacted about this request.
          </p>
          <button
            className="button button-primary button-wide"
            disabled={submitting}
          >
            {submitting ? 'Sending request...' : 'Request a test ride'}
            <ArrowRight size={17} />
          </button>
          <div className="dialog-foot">
            <MapPin size={14} />
            Gurudev Motors, Raipura, Raipur
          </div>
        </form>
      )}
    </Dialog>
  );
}
