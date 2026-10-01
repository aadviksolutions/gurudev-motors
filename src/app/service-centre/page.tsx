'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Clock, Wrench, CheckCircle2, Calendar, Coffee, Wifi, Shield, AlertCircle, MessageSquare } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function ServiceCentrePage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [serviceType, setServiceType] = useState('General Service');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Morning Slot (9:30 AM - 12:30 PM)');
  const [requirement, setRequirement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const serviceOptions = [
    'General Service',
    'Oil Change',
    'Brake Service',
    'Tyre Service',
    'Battery',
    'Engine',
    'Electrical',
    'Periodic Maintenance',
    'Pickup & Drop',
    'Doorstep Service',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!vehicleModel.trim()) {
      setErrorMsg('Please enter your vehicle model');
      return;
    }

    if (!date) {
      setErrorMsg('Please select a preferred service date');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          vehicleModel: vehicleModel.trim(),
          registrationNumber: regNumber.trim().toUpperCase() || undefined,
          serviceType,
          preferredDate: date,
          preferredTime: time,
          additionalRequirement: requirement.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book service appointment');
      }

      setSubmittedData({
        bookingNumber: data.bookingNumber,
        customerName: name,
        mobile: cleanMobile,
        vehicleModel,
        serviceType,
        date,
        time,
      });

      const text = `Hello Gurudev Motors Workshop, I have booked a service appointment (Booking ID: ${data.bookingNumber}) for my ${vehicleModel} (${regNumber || 'No Plate'}) for ${serviceType} on ${date} (${time}). My mobile: ${cleanMobile}. Please confirm appointment.`;
      setTimeout(() => {
        window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
      }, 500);
    } catch (err: any) {
      console.error('Service booking error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Wrench className="w-4 h-4 text-gm-red" />
            Raipura Facility
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            New Service Centre & Lounge
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
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

            {submittedData ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-white/80 px-3 py-1 rounded-full border border-emerald-300 inline-block mb-1.5">
                    Booking ID: {submittedData.bookingNumber}
                  </span>
                  <h4 className="text-lg font-black text-emerald-950">Appointment Registered!</h4>
                  <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
                    Your appointment for {submittedData.serviceType} on {submittedData.date} ({submittedData.time}) has been scheduled.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(
                      `Hello Gurudev Motors, I have booked service ${submittedData.bookingNumber} for ${submittedData.vehicleModel} on ${submittedData.date}. Please confirm.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmittedData(null)}
                    className="border border-emerald-300 bg-white text-emerald-900 font-bold text-xs py-3 px-5 rounded-xl"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">10-Digit Mobile *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. 9826123456"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
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
                      placeholder="e.g. Activa 6G, Splendor, Pulsar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Service Type *</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Preferred Time Slot</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                    >
                      <option value="Morning Slot (9:30 AM - 12:30 PM)">Morning Slot (9:30 AM - 12:30 PM)</option>
                      <option value="Afternoon Slot (1:00 PM - 3:30 PM)">Afternoon Slot (1:00 PM - 3:30 PM)</option>
                      <option value="Evening Slot (3:30 PM - 6:30 PM)">Evening Slot (3:30 PM - 6:30 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Specific Complaints / Requirements</label>
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. Brake noise, oil change, pickup check"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-black text-xs py-3.5 rounded-xl shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Registering Service Slot...</span>
                  ) : (
                    <span>Book Workshop Appointment ↗</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
