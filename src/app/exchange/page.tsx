'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, CheckCircle2, ArrowRight, Sparkles, Phone, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO, VEHICLE_BRANDS } from '@/lib/constants';

function ExchangePageContent() {
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');

  const [oldBrand, setOldBrand] = useState('Hero');
  const [oldModel, setOldModel] = useState('Splendor Plus');
  const [year, setYear] = useState('2020');
  const [km, setKm] = useState('25000');
  const [condition, setCondition] = useState('GOOD');
  const [targetVehicle, setTargetVehicle] = useState('Honda Activa 6G');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (upgradeParam) {
      setTargetVehicle(upgradeParam);
    }
  }, [upgradeParam]);

  // Dynamic Valuation Formula
  const calculateEstimatedValue = () => {
    const baseValue = 50000;
    const currentYear = 2026;
    const age = Math.max(0, currentYear - Number(year));
    const depreciationFactor = Math.max(0.25, 1 - age * 0.1);
    const kmFactor = Number(km) > 40000 ? 0.85 : Number(km) > 20000 ? 0.95 : 1.05;
    const condFactor = condition === 'EXCELLENT' ? 1.15 : condition === 'GOOD' ? 1.0 : 0.85;

    const estimated = Math.round((baseValue * depreciationFactor * kmFactor * condFactor) / 500) * 500;
    return {
      min: Math.max(15000, estimated - 3000),
      max: Math.max(20000, estimated + 3000),
    };
  };

  const estimatedRange = calculateEstimatedValue();

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          currentBrand: oldBrand,
          currentModel: oldModel,
          registrationYear: year,
          kmDriven: km,
          condition,
          upgradingVehicle: targetVehicle,
          message: message.trim() || undefined,
          estimatedValuation: (estimatedRange.min + estimatedRange.max) / 2,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit exchange request');
      }

      setSubmittedData({
        exchangeNumber: data.exchangeNumber,
        customerName,
        mobile: cleanMobile,
        targetVehicle,
        oldVehicle: `${year} ${oldBrand} ${oldModel}`,
        estimatedRange,
      });

      const text = `Hello Gurudev Motors, I have submitted Exchange Request ${data.exchangeNumber} for my old ${year} ${oldBrand} ${oldModel} (${km} km) upgrading to ${targetVehicle}. My mobile is ${cleanMobile}. Please confirm inspection.`;
      setTimeout(() => {
        window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
      }, 500);
    } catch (err: any) {
      console.error('Exchange submission error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-gm-red" />
            Spot Vehicle Exchange Program
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Upgrade Your Ride Today
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Bring any old bike or scooter to Gurudev Motors Mahadev Ghat Chowk showroom. Get a fair market valuation on the spot and deduct it directly from your new ride.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gm-line shadow-sm">
            {submittedData ? (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                    Request ID: {submittedData.exchangeNumber}
                  </span>
                  <h3 className="text-2xl font-black text-gm-navy tracking-tight">
                    Exchange Request Registered!
                  </h3>
                  <p className="text-xs text-gm-muted mt-1 max-w-md mx-auto leading-relaxed">
                    Thank you, {submittedData.customerName}. Your exchange request has been saved in our dealership system. Our vehicle evaluator will inspect your vehicle and provide the guaranteed trade-in amount.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gm-soft border border-gm-line space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gm-line">
                    <span className="text-gm-muted">Existing Vehicle:</span>
                    <b className="text-gm-navy">{submittedData.oldVehicle}</b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gm-line">
                    <span className="text-gm-muted">Upgrading Vehicle:</span>
                    <b className="text-gm-navy">{submittedData.targetVehicle}</b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gm-line">
                    <span className="text-gm-muted">Estimated Valuation:</span>
                    <b className="text-emerald-700 font-black">
                      {formatCurrency(submittedData.estimatedRange.min)} - {formatCurrency(submittedData.estimatedRange.max)}
                    </b>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gm-muted">Registered Mobile:</span>
                    <b className="text-gm-navy">{submittedData.mobile}</b>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(
                      `Hello Gurudev Motors, I have submitted Exchange Request ${submittedData.exchangeNumber} for my ${submittedData.oldVehicle}. Please confirm valuation.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setCustomerName('');
                      setMobile('');
                      setMessage('');
                    }}
                    className="border border-gm-line hover:border-gm-navy text-gm-navy font-bold text-xs py-3.5 rounded-xl transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExchangeSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gm-navy mb-4">
                    1. Enter Your Old Vehicle Details
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Current Brand *</label>
                        <select
                          value={oldBrand}
                          onChange={(e) => setOldBrand(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                        >
                          {VEHICLE_BRANDS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Model Name *</label>
                        <input
                          type="text"
                          value={oldModel}
                          onChange={(e) => setOldModel(e.target.value)}
                          placeholder="e.g. Splendor, Activa, Pulsar"
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Reg. Year *</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                        >
                          {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Kilometers Run *</label>
                        <input
                          type="number"
                          value={km}
                          onChange={(e) => setKm(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Condition *</label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                        >
                          <option value="EXCELLENT">Excellent (Like New)</option>
                          <option value="GOOD">Good (Minor wear)</option>
                          <option value="FAIR">Fair (Needs service)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gm-navy mb-1.5">Upgrading To (Desired Model) *</label>
                      <input
                        type="text"
                        value={targetVehicle}
                        onChange={(e) => setTargetVehicle(e.target.value)}
                        placeholder="e.g. Hero Splendor Plus XTEC, Activa 6G, Kinetic Zulu"
                        className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gm-line">
                  <h3 className="text-lg font-black text-gm-navy mb-4">
                    2. Contact Details for Valuation Certificate
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">10-Digit Mobile *</label>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. 9826123456"
                          maxLength={10}
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Email (Optional)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gm-navy mb-1.5">Additional Notes</label>
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="e.g. 1st owner, new tyre, single hand"
                          className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Registering Exchange Request...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Get Guaranteed Exchange Quote On WhatsApp ↗</span>
                    </>
                  )}
                </button>
              </form>
            )}
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

export default function ExchangePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gm-muted">Loading Exchange Form...</div>}>
      <ExchangePageContent />
    </Suspense>
  );
}
