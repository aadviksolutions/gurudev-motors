'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IndianRupee, Calculator, CheckCircle2, ShieldCheck, Phone, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';
import { useModal } from '@/context/ModalContext';

export default function FinancePage() {
  const { openEnquiry } = useModal();
  const [loanAmount, setLoanAmount] = useState(65000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(9.5);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - loanAmount;

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
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

            <button
              onClick={() => openEnquiry(`Loan for ${formatCurrency(loanAmount)}`)}
              className="mt-8 w-full bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>Apply For Spot Approval ↗</span>
            </button>
          </div>
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
