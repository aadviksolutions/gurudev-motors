'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, CheckCircle2, ArrowRight, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO, VEHICLE_BRANDS } from '@/lib/constants';

export default function ExchangePage() {
  const [oldBrand, setOldBrand] = useState('Hero');
  const [oldModel, setOldModel] = useState('Splendor Plus');
  const [year, setYear] = useState('2020');
  const [km, setKm] = useState('25000');
  const [condition, setCondition] = useState('GOOD');
  const [targetVehicle, setTargetVehicle] = useState('Honda Activa 6G');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Valuation Formula
  const calculateEstimatedValue = () => {
    const baseValue = 50000;
    const currentYear = 2026;
    const age = Math.max(0, currentYear - Number(year));
    const depreciationFactor = Math.max(0.25, 1 - age * 0.1);
    const kmFactor = Number(km) > 40000 ? 0.85 : Number(km) > 20000 ? 0.95 : 1.05;
    const condFactor = condition === 'EXCELLENT' ? 1.15 : condition === 'GOOD' ? 1.0 : 0.85;

    const estimated = Math.round(baseValue * depreciationFactor * kmFactor * condFactor / 500) * 500;
    return {
      min: Math.max(15000, estimated - 3000),
      max: Math.max(20000, estimated + 3000),
    };
  };

  const estimatedRange = calculateEstimatedValue();

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile) return;

    setSubmitting(true);
    try {
      const notes = `Exchange Valuation Request: ${year} ${oldBrand} ${oldModel} (${km} km, ${condition} condition). Looking to upgrade to ${targetVehicle}. Estimated quote: ${formatCurrency(estimatedRange.min)} - ${formatCurrency(estimatedRange.max)}`;
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          mobile,
          vehicleModel: targetVehicle,
          budget: `Exchange old ${oldBrand} ${oldModel}`,
          source: 'WEBSITE',
          notes,
        }),
      });

      setSubmitted(true);

      const text = `Hello Gurudev Motors, I want to exchange my old ${year} ${oldBrand} ${oldModel} (${km} km) for a new ${targetVehicle}. My mobile is ${mobile}. Please confirm exchange valuation.`;
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-gm-red" />
            Spot Vehicle Exchange Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gm-navy">
            Upgrade Your Ride Today
          </h1>
          <p className="text-sm text-gm-muted mt-3">
            Bring any old bike or scooter to Gurudev Motors Mahadev Ghat Chowk showroom. Get a fair market valuation on the spot and deduct it directly from your new ride.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gm-line shadow-sm">
            <h3 className="text-xl font-black text-gm-navy mb-6">
              1. Enter Your Old Vehicle Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Current Brand</label>
                  <select
                    value={oldBrand}
                    onChange={(e) => setOldBrand(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy bg-white"
                  >
                    {VEHICLE_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Model Name</label>
                  <input
                    type="text"
                    value={oldModel}
                    onChange={(e) => setOldModel(e.target.value)}
                    placeholder="e.g. Splendor, Activa, Pulsar"
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Registration Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy bg-white"
                  >
                    {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Kilometers Driven</label>
                  <input
                    type="number"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Vehicle Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy bg-white"
                  >
                    <option value="EXCELLENT">Excellent (Like New)</option>
                    <option value="GOOD">Good (Minor wear)</option>
                    <option value="FAIR">Fair (Needs work)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gm-navy mb-1.5">Upgrading To (New Model)</label>
                <input
                  type="text"
                  value={targetVehicle}
                  onChange={(e) => setTargetVehicle(e.target.value)}
                  placeholder="e.g. Hero Splendor XTEC, Activa 6G, Kinetic Zulu"
                  className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                />
              </div>

              <hr className="my-6 border-gm-line" />

              <h4 className="text-sm font-black text-gm-navy mb-3">
                2. Contact Details for Valuation Certificate
              </h4>

              {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Your exchange valuation request has been logged! Opening WhatsApp with our showroom team...</span>
                </div>
              ) : (
                <form onSubmit={handleExchangeSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name *"
                      className="px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                      required
                    />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number *"
                      className="px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-sm py-4 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Get Guaranteed Exchange Quote On WhatsApp ↗</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Real-time Estimated Value Display */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-gm-navy to-gm-navy-dark text-white rounded-3xl p-8 border border-white/10 shadow-gm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
                Estimated Trade-In Valuation
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white my-3">
                {formatCurrency(estimatedRange.min)} - {formatCurrency(estimatedRange.max)}*
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on current Raipur market rates for a {year} {oldBrand} {oldModel} with {km} km. Final quote subject to quick physical verification at showroom.
              </p>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant deduction from new bike on-road price</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free RTO ownership transfer handled by Gurudev Motors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Any brand or model accepted in Raipur</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gm-line">
              <h4 className="text-sm font-black text-gm-navy mb-2">Documents Required for Exchange</h4>
              <ul className="text-xs text-gm-muted space-y-1.5 list-disc list-inside">
                <li>Original Registration Certificate (RC Book / Smart Card)</li>
                <li>Valid Two-Wheeler Insurance Copy</li>
                <li>Aadhaar Card & PAN Card of Registered Owner</li>
                <li>Both vehicle keys</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
