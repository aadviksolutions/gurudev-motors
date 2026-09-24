'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { VehicleData } from './VehicleCard';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleData | null;
}

export default function TestDriveModal({ isOpen, onClose, vehicle }: TestDriveModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00 AM');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !date) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile,
          vehicleId: vehicle.id,
          preferredDate: date,
          preferredTime: time,
          notes,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Test drive booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setMobile('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gm-navy-darker/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gm-line">
        <div className="px-6 pt-6 pb-4 bg-gm-navy text-white flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
              Book A Ride Experience
            </span>
            <h3 className="text-xl font-black">
              Test Drive {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              Available at Mahadev Ghat Showroom or doorstep in Raipur.
            </p>
          </div>
          <button onClick={handleReset} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-gm-navy mb-1">Test Drive Requested!</h4>
              <p className="text-xs text-gm-muted mb-6">
                Our sales representative will call you at {mobile} to confirm the slot and bring the vehicle.
              </p>
              <button
                onClick={handleReset}
                className="bg-gm-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Preferred Time</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy bg-white"
                  >
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Location Preference / Address</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Visit Showroom OR Doorstep address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white py-2.5 rounded-xl text-xs font-bold shadow transition-all"
                >
                  {submitting ? 'Confirming...' : 'Confirm Test Drive'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
