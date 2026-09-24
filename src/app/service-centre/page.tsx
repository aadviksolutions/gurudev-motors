'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Clock, Wrench, CheckCircle2, Calendar, Coffee, Wifi, Shield } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function ServiceCentrePage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [serviceType, setServiceType] = useState('REGULAR');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !vehicleModel) return;

    setSubmitting(true);
    try {
      const notes = `Service Booking Appointment: ${serviceType} for ${vehicleModel} (${regNumber || 'No plate'}). Preferred date: ${date}`;
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile,
          vehicleModel,
          budget: serviceType,
          source: 'WEBSITE',
          notes,
        }),
      });

      setSubmitted(true);
      const text = `Hello Gurudev Motors Workshop, I want to book a ${serviceType} appointment for my ${vehicleModel} (${regNumber}) on ${date}. My name: ${name}, mobile: ${mobile}.`;
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
    <div className="py-12 bg-gm-soft min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Wrench className="w-4 h-4 text-gm-red" />
            Raipura Facility
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gm-navy">
            New Service Centre & Lounge
          </h1>
          <p className="text-sm text-gm-muted mt-3">
            In front of New Raipura Hospital & Shri Ganesh Mandir lane, Raipura, Raipur, Chhattisgarh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Facility Info & Lounge */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm">
              <h3 className="text-xl font-black text-gm-navy mb-4">
                Service Centre Highlights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line">
                  <Coffee className="w-5 h-5 text-gm-red mb-2" />
                  <b className="text-xs font-bold text-gm-navy block">Customer Lounge</b>
                  <span className="text-[11px] text-gm-muted">A/C waiting area with seating</span>
                </div>
                <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line">
                  <Wifi className="w-5 h-5 text-gm-red mb-2" />
                  <b className="text-xs font-bold text-gm-navy block">High Speed Wi-Fi</b>
                  <span className="text-[11px] text-gm-muted">Work while you wait</span>
                </div>
                <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line">
                  <Wrench className="w-5 h-5 text-gm-red mb-2" />
                  <b className="text-xs font-bold text-gm-navy block">Certified Techs</b>
                  <span className="text-[11px] text-gm-muted">Trained on all brand engines</span>
                </div>
                <div className="p-4 rounded-2xl bg-gm-soft border border-gm-line">
                  <Shield className="w-5 h-5 text-gm-red mb-2" />
                  <b className="text-xs font-bold text-gm-navy block">Genuine Spares</b>
                  <span className="text-[11px] text-gm-muted">100% authentic oil & parts</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gm-line space-y-3 text-xs text-gm-navy font-semibold">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gm-red shrink-0 mt-0.5" />
                  <span>{CONTACT_INFO.serviceCenterAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-gm-red shrink-0" />
                  <span>{CONTACT_INFO.serviceTimings}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gm-red shrink-0" />
                  <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-gm-red hover:underline">
                    Direct Workshop Call: {CONTACT_INFO.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-gm-line shadow-sm">
            <h3 className="text-xl font-black text-gm-navy mb-2">
              Book Service Appointment
            </h3>
            <p className="text-xs text-gm-muted mb-6">
              Reserve your priority slot to avoid queueing.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-black text-emerald-900">Appointment Booked!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Our service advisor will call you to confirm your slot time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
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
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle Model *</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Activa 6G, Splendor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Vehicle Reg No.</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. CG 04 AB 1234"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Service Type</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy bg-white"
                    >
                      <option value="REGULAR">Routine General Service</option>
                      <option value="REPAIR">Major Engine / Clutch Repair</option>
                      <option value="INSPECTION">Inspection & Diagnostic</option>
                      <option value="DOORSTEP">Doorstep Raipur Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-black text-xs py-3.5 rounded-xl shadow transition-colors"
                >
                  {submitting ? 'Booking...' : 'Book Workshop Appointment ↗'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
