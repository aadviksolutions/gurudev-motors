'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVehicle?: string;
}

export default function EnquiryModal({ isOpen, onClose, defaultVehicle = '' }: EnquiryModalProps) {
  const [vehicle, setVehicle] = useState(defaultVehicle);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (defaultVehicle) setVehicle(defaultVehicle);
  }, [defaultVehicle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    setSubmitting(true);
    try {
      // 1. Submit lead to CRM database
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile,
          vehicleModel: vehicle || 'General Enquiry',
          budget,
          source: 'WEBSITE',
          notes,
        }),
      });

      setSubmitted(true);

      // 2. Open WhatsApp with formatted enquiry
      const text = `Hello Gurudev Motors, I am ${name}. I am interested in: ${vehicle || 'a vehicle'}. My mobile: ${mobile}. ${budget ? 'Budget: ' + budget + '. ' : ''}${notes ? notes : ''}`;
      const waUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 400);
    } catch (err) {
      console.error('Enquiry error:', err);
      // Still open WhatsApp as fallback
      const text = `Hello Gurudev Motors, I am ${name}. Interested in: ${vehicle}. Mobile: ${mobile}.`;
      window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setMobile('');
    setNotes('');
    setBudget('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gm-navy-darker/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gm-line max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-gm-navy to-gm-navy-dark text-white flex items-start justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gm-red flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3" />
              Gurudev Motors Raipur
            </div>
            <h3 className="text-2xl font-black tracking-tight">
              {vehicle ? `Enquire about ${vehicle}` : 'Tell us what you need'}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Direct connection to our Raipura showroom sales team.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-gm-navy mb-2">Enquiry Sent!</h4>
              <p className="text-xs text-gm-muted max-w-sm mx-auto mb-6">
                Your request has been logged into our dealership CRM and forwarded to our Raipur sales advisor.
              </p>
              <button
                onClick={handleReset}
                className="bg-gm-navy text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gm-navy-dark transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">
                  Vehicle / Model of Interest
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. Hero Splendor Plus, Activa 6G, E-Luna"
                  className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">
                  Budget / Buying Plan
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. ₹70,000 - ₹90,000 or EMI / Exchange"
                  className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">
                  Requirement / Exchange Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us if you want vehicle exchange valuation, specific color, or low down payment finance..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 rounded-xl border border-gm-line text-xs font-bold text-gm-muted hover:bg-gm-soft transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gm-red hover:bg-gm-red-dark text-white py-3 rounded-xl text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Send on WhatsApp ↗</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-gm-muted font-medium flex items-center justify-center gap-1.5">
                  <Phone className="w-3 h-3 text-gm-red" />
                  Or call directly: <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="font-bold text-gm-navy hover:underline">{CONTACT_INFO.phone}</a>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
