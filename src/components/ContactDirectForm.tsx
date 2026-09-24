'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function ContactDirectForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile,
          vehicleModel: vehicle || 'Website Contact Form',
          source: 'WEBSITE',
          notes: message || 'Direct message from showroom contact form',
        }),
      });

      setSubmitted(true);
      const text = `Hello Gurudev Motors, I am ${name}. ${vehicle ? 'Requirement: ' + vehicle + '. ' : ''}Mobile: ${mobile}. ${message}`;
      setTimeout(() => {
        window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
      }, 300);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
        <h4 className="text-base font-black text-emerald-900">Message Received!</h4>
        <p className="text-xs text-emerald-700 mt-1">
          Thank you {name}. Our showroom team has received your inquiry and will contact you shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName('');
            setMobile('');
            setVehicle('');
            setMessage('');
          }}
          className="mt-4 text-xs font-bold text-gm-navy hover:underline"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gm-navy mb-1.5">
          Your Name <span className="text-gm-red">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm text-gm-ink placeholder:text-gm-muted/60 focus:outline-none focus:border-gm-navy transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gm-navy mb-1.5">
          Mobile Number <span className="text-gm-red">*</span>
        </label>
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="10-digit mobile number"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm text-gm-ink placeholder:text-gm-muted/60 focus:outline-none focus:border-gm-navy transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gm-navy mb-1.5">
          Vehicle / Requirement
        </label>
        <input
          type="text"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          placeholder="e.g. Splendor Plus, Activa, Electric, Exchange"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm text-gm-ink placeholder:text-gm-muted/60 focus:outline-none focus:border-gm-navy transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gm-navy mb-1.5">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about on-road price, discount, finance EMI, or exchange..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm text-gm-ink placeholder:text-gm-muted/60 focus:outline-none focus:border-gm-navy transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{submitting ? 'Sending...' : 'Send Message To Showroom ↗'}</span>
      </button>
    </form>
  );
}
