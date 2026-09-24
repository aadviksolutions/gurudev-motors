'use client';

import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Clock, Mail, CheckCircle2, ArrowUpRight, Send } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
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
          email,
          vehicleModel: vehicle || 'Contact Page Enquiry',
          source: 'WEBSITE',
          notes: message,
        }),
      });

      setSubmitted(true);
      const text = `Hello Gurudev Motors, I am ${name}. ${vehicle ? 'Interested in ' + vehicle + '. ' : ''}My mobile: ${mobile}. ${message}`;
      setTimeout(() => {
        window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
      }, 400);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red mb-2 flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-gm-red" />
            Connect With Gurudev Motors
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Visit Our Showroom In Raipur
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Reach out by phone, WhatsApp, or drop by our showroom at Mahadev Ghat Chowk, Raipura.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Location Cards */}
          <div className="lg:col-span-6 space-y-6">
            {/* Showroom Box */}
            <div className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
                Location 01
              </span>
              <h3 className="text-2xl font-black text-gm-navy mb-2">Main Showroom</h3>
              <p className="text-xs text-gm-muted leading-relaxed mb-4">
                {CONTACT_INFO.showroomAddress}
              </p>

              <div className="space-y-2 text-xs text-gm-navy font-semibold pb-4 mb-4 border-b border-gm-line">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gm-red" />
                  <span>Showroom Hours: {CONTACT_INFO.timings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gm-red" />
                  <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-gm-navy hover:text-gm-red">
                    Call: {CONTACT_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={CONTACT_INFO.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Google Maps Directions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`tel:${CONTACT_INFO.phoneRaw}`}
                  className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Service Center Box */}
            <div className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
                Location 02
              </span>
              <h3 className="text-2xl font-black text-gm-navy mb-2">New Service Centre</h3>
              <p className="text-xs text-gm-muted leading-relaxed mb-4">
                {CONTACT_INFO.serviceCenterAddress}
              </p>

              <div className="space-y-2 text-xs text-gm-navy font-semibold pb-4 mb-4 border-b border-gm-line">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gm-red" />
                  <span>Workshop Hours: {CONTACT_INFO.serviceTimings}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hello Gurudev Motors, I need directions to the service centre.')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <span>Ask Location on WhatsApp ↗</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-gm-line shadow-sm">
            <h3 className="text-xl font-black text-gm-navy mb-1">Send A Direct Message</h3>
            <p className="text-xs text-gm-muted mb-6">
              Fill in your requirement. Our representative will contact you within 30 minutes during showroom hours.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-black text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  We have forwarded your request to our showroom desk.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
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
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle of Interest</label>
                    <input
                      type="text"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      placeholder="e.g. Hero Splendor, Activa, EV"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Your Message / Requirement</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about on-road price, exchange value, loan schemes or service appointment..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-black text-xs py-3.5 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Message To Showroom ↗'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
