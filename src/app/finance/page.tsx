'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IndianRupee, Calculator, CheckCircle2, ShieldCheck, Phone, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';

function FinancePageContent() {
  const searchParams = useSearchParams();
  const modelParam = searchParams.get('model');
  const amountParam = searchParams.get('amount');

  const [loanAmount, setLoanAmount] = useState(65000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(9.5);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('Hero Splendor Plus XTEC');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState('₹25,000 - ₹40,000');
  const [downPayment, setDownPayment] = useState('5000');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (modelParam) setVehicle(modelParam);
    if (amountParam && !isNaN(Number(amountParam))) {
      setLoanAmount(Math.min(150000, Math.max(20000, Number(amountParam))));
    }
  }, [modelParam, amountParam]);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - loanAmount;

  const handleFinanceSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          vehicleModel: vehicle.trim(),
          loanAmount,
          employmentType,
          monthlyIncome,
          preferredTenure: tenureMonths,
          downPayment: Number(downPayment) || 0,
          message: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit loan application');
      }

      setSubmittedData({
        applicationNumber: data.applicationNumber,
        customerName: name,
        mobile: cleanMobile,
        vehicle,
        loanAmount,
        emi,
        tenureMonths,
      });

      const text = `Hello Gurudev Motors, I have applied for two-wheeler spot finance (Application ID: ${data.applicationNumber}) for ${vehicle}. Loan Amount: ${formatCurrency(loanAmount)} for ${tenureMonths} months. My mobile: ${cleanMobile}. Please confirm documents required.`;
      setTimeout(() => {
        window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
      }, 500);
    } catch (err: any) {
      console.error('Finance submission error:', err);
      setErrorMsg(err.message || 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Calculator className="w-4 h-4 text-gm-red" />
            Easy Two-Wheeler Loans In Raipur
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Drive Home With Low EMI
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Gurudev Motors partners with premier banks and NBFCs to offer spot loan approvals, zero down payment schemes, and low monthly instalments.
          </p>
        </div>

        {/* Interactive EMI Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gm-line shadow-sm space-y-6">
            <h3 className="text-xl font-black text-gm-navy flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gm-red" />
              <span>Two-Wheeler EMI Calculator</span>
            </h3>

            {/* Slider 1: Loan Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gm-navy">Loan Amount (₹)</label>
                <span className="text-base font-black text-gm-navy bg-gm-soft px-3 py-1 rounded-lg border border-gm-line">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-gm-red cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gm-muted mt-1 font-semibold">
                <span>₹20,000</span>
                <span>₹85,000</span>
                <span>₹1,50,000</span>
              </div>
            </div>

            {/* Slider 2: Tenure */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gm-navy">Repayment Tenure (Months)</label>
                <span className="text-base font-black text-gm-navy bg-gm-soft px-3 py-1 rounded-lg border border-gm-line">
                  {tenureMonths} Months ({tenureMonths / 12} yrs)
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="6"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-gm-red cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gm-muted mt-1 font-semibold">
                <span>12 Months</span>
                <span>24 Months</span>
                <span>36 Months</span>
                <span>48 Months</span>
              </div>
            </div>

            {/* Slider 3: Interest Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gm-navy">Expected Interest Rate (% p.a.)</label>
                <span className="text-base font-black text-gm-navy bg-gm-soft px-3 py-1 rounded-lg border border-gm-line">
                  {interestRate}%
                </span>
              </div>
              <input
                type="range"
                min="7.5"
                max="15.0"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-gm-red cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gm-muted mt-1 font-semibold">
                <span>7.5%</span>
                <span>10.5%</span>
                <span>15.0%</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-gm-navy text-white rounded-3xl p-8 border border-white/10 shadow-gm">
            <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-2">
              Monthly Estimated Payment
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mb-2">
              {formatCurrency(emi)}<span className="text-lg font-medium text-white/70">/month</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Low down-payment options starting from just ₹1,999/- on select models at Raipur showroom.
            </p>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Principal Loan:</span>
                <b className="text-white">{formatCurrency(loanAmount)}</b>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Interest Payable:</span>
                <b className="text-white">{formatCurrency(totalInterest)}</b>
              </div>
              <div className="flex justify-between text-slate-300 font-bold text-sm pt-2 border-t border-white/10">
                <span>Total Amount Payable:</span>
                <b className="text-emerald-400">{formatCurrency(totalPayable)}</b>
              </div>
            </div>

            <a
              href="#apply-form"
              className="mt-8 w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>Apply For Spot Approval Below ↓</span>
            </a>
          </div>
        </div>

        {/* Spot Loan Application Form */}
        <div id="apply-form" className="bg-white rounded-3xl p-6 sm:p-10 border border-gm-line shadow-sm mb-12">
          {submittedData ? (
            <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                  Application ID: {submittedData.applicationNumber}
                </span>
                <h3 className="text-2xl font-black text-gm-navy tracking-tight">
                  Loan Application Successfully Registered!
                </h3>
                <p className="text-xs text-gm-muted mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you, {submittedData.customerName}. Your loan application of {formatCurrency(submittedData.loanAmount)} for {submittedData.vehicle} has been registered with our dealership finance desk.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gm-soft border border-gm-line text-xs max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between py-1 border-b border-gm-line">
                  <span className="text-gm-muted">Applied Vehicle:</span>
                  <b className="text-gm-navy">{submittedData.vehicle}</b>
                </div>
                <div className="flex justify-between py-1 border-b border-gm-line">
                  <span className="text-gm-muted">Loan Amount:</span>
                  <b className="text-gm-navy">{formatCurrency(submittedData.loanAmount)}</b>
                </div>
                <div className="flex justify-between py-1 border-b border-gm-line">
                  <span className="text-gm-muted">Estimated EMI:</span>
                  <b className="text-emerald-700 font-black">{formatCurrency(submittedData.emi)}/mo ({submittedData.tenureMonths} mos)</b>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gm-muted">Registered Mobile:</span>
                  <b className="text-gm-navy">{submittedData.mobile}</b>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(
                    `Hello Gurudev Motors Finance Desk, I have submitted Loan Application ${submittedData.applicationNumber} for ${submittedData.vehicle}. Please check documents.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect with Loan Desk on WhatsApp</span>
                </a>
                <button
                  onClick={() => setSubmittedData(null)}
                  className="border border-gm-line hover:border-gm-navy text-gm-navy font-bold text-xs py-3.5 px-6 rounded-xl transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinanceSubmit} className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-1">
                  Spot Financing Desk
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gm-navy">
                  Apply for Two-Wheeler Spot Loan Approval
                </h3>
                <p className="text-xs text-gm-muted mt-1">
                  Quick digital documentation with minimum paperwork. Approvals within 30 minutes at our showroom.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Applicant Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name as per Aadhaar"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Desired Vehicle Model *</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="e.g. Hero Splendor, Activa 6G"
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                  >
                    <option value="Salaried">Salaried (Private / Govt)</option>
                    <option value="Self-Employed">Self-Employed / Shop Owner</option>
                    <option value="Business">Business Owner</option>
                    <option value="Agriculture">Agriculture / Farming</option>
                    <option value="Student">Student / First-time Buyer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Approx. Monthly Income</label>
                  <select
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-semibold focus:outline-none focus:border-gm-navy bg-white"
                  >
                    <option value="Under ₹15,000">Under ₹15,000</option>
                    <option value="₹15,000 - ₹25,000">₹15,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹40,000">₹25,000 - ₹40,000</option>
                    <option value="₹40,000 - ₹75,000">₹40,000 - ₹75,000</option>
                    <option value="Above ₹75,000">Above ₹75,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1.5">Planned Down Payment (₹)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1.5">Special Requirement / Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Looking for zero down-payment or bank tie-up"
                  className="w-full px-4 py-3 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                />
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
                  <span>Submitting Loan Application...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Application For 30-Min Spot Approval ↗</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Finance Partners */}
        <div className="bg-white rounded-3xl p-8 border border-gm-line mb-12">
          <h3 className="text-base font-black text-gm-navy uppercase tracking-wider mb-6 text-center">
            Official Financing & Banking Partners
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {['HDFC Bank', 'ICICI Bank', 'IDFC FIRST', 'IndusInd Bank', 'Hero Fincorp', 'L&T Finance'].map((bank) => (
              <div key={bank} className="p-4 rounded-xl border border-gm-line bg-gm-soft/60 font-bold text-xs text-gm-navy flex items-center justify-center">
                {bank}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gm-muted">Loading Finance Calculator...</div>}>
      <FinancePageContent />
    </Suspense>
  );
}
