'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, Check, Phone } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import PublicRequestForm from '@/components/PublicRequestForm';
import { formatCurrency } from '@/lib/utils';
import { CONTACT_INFO } from '@/lib/constants';
function FinanceContent() {
  const params = useSearchParams();
  const requested = Number(params.get('amount'));
  const [amount, setAmount] = useState(
    requested > 0 && Number.isFinite(requested)
      ? Math.min(1000000, Math.max(20000, requested))
      : 80000,
  );
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(9.5);
  const [method, setMethod] = useState<'reducing' | 'flat'>('reducing');

  // Reducing Balance Method
  const r = rate / 1200;
  const emiReducing =
    r === 0
      ? amount / months
      : (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalReducing = emiReducing * months;
  const interestReducing = totalReducing - amount;

  // Flat Rate Method
  const years = months / 12;
  const interestFlat = amount * (rate / 100) * years;
  const totalFlat = amount + interestFlat;
  const emiFlat = totalFlat / months;

  // Active method values
  const emi = method === 'reducing' ? emiReducing : emiFlat;
  const total = method === 'reducing' ? totalReducing : totalFlat;
  const interest = method === 'reducing' ? interestReducing : interestFlat;
  return (
    <>
      <PageHeading
        eyebrow="FINANCE & EMI"
        title="A plan that fits your life."
        description="Estimate your monthly payments, then talk to our team about available finance options."
      />
      <div className="site-container support-layout">
        <section>
          <div className="section-heading">
            <h2>Your EMI estimate.</h2>
            <Calculator size={22} />
          </div>
          <div className="emi-calculator">
            {/* Calculation Method Toggle */}
            <div className="mb-6 p-1 bg-slate-200/80 rounded-xl">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2 py-1 mb-1">
                Calculation Method
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMethod('reducing')}
                  className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                    method === 'reducing'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>Reducing Balance</span>
                  <span className="text-[10px] font-normal opacity-75">Calculated on remaining principal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('flat')}
                  className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                    method === 'flat'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>Flat Rate</span>
                  <span className="text-[10px] font-normal opacity-75">Calculated on total initial loan</span>
                </button>
              </div>
            </div>

            <label htmlFor="loan-amount">
              <span>Loan amount</span>
              <strong>{formatCurrency(amount)}</strong>
            </label>
            <input
              id="loan-amount"
              type="range"
              min={20000}
              max={1000000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="range-endpoints">
              <span>Rs. 20,000</span>
              <span>Rs. 10 lakh</span>
            </div>
            <label htmlFor="loan-tenure">
              <span>Loan tenure</span>
              <strong>{months} months</strong>
            </label>
            <input
              id="loan-tenure"
              type="range"
              min={12}
              max={60}
              step={6}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            />
            <div className="range-endpoints">
              <span>12 months</span>
              <span>60 months</span>
            </div>
            <label htmlFor="loan-rate">
              <span>Annual interest rate</span>
              <strong>{rate}%</strong>
            </label>
            <input
              id="loan-rate"
              type="range"
              min={0}
              max={24}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <div className="range-endpoints">
              <span>0%</span>
              <span>24%</span>
            </div>
            <div className="emi-result" aria-live="polite">
              <div className="flex items-center justify-between mb-1">
                <span>Estimated monthly EMI</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {method === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}
                </span>
              </div>
              <strong>
                {formatCurrency(Math.round(emi))}
                <small>/ month</small>
              </strong>
              <div>
                <span>
                  Principal<strong>{formatCurrency(amount)}</strong>
                </span>
                <span>
                  Total interest
                  <strong>{formatCurrency(Math.round(interest))}</strong>
                </span>
                <span>
                  Total payable
                  <strong>{formatCurrency(Math.round(total))}</strong>
                </span>
              </div>
            </div>

            {/* Comparison summary between both methods */}
            <div className="mt-4 p-3 bg-white/70 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-800">Quick Comparison: </span>
                Reducing EMI: <strong className="text-slate-900">{formatCurrency(Math.round(emiReducing))}</strong> (Int: {formatCurrency(Math.round(interestReducing))}) vs Flat EMI: <strong className="text-slate-900">{formatCurrency(Math.round(emiFlat))}</strong> (Int: {formatCurrency(Math.round(interestFlat))})
              </div>
            </div>

            <p className="form-note">
              {method === 'reducing'
                ? 'Illustrative reducing-balance calculation (interest decreases as principal is paid off). Actual rate, processing fees, and eligibility depend on the financing partner.'
                : 'Illustrative flat-rate calculation (interest is calculated on the initial principal for the entire loan tenure). Actual rate, processing fees, and eligibility depend on the financing partner.'}
            </p>
          </div>
          <ul className="support-points">
            <li>
              <Check size={17} />
              Discuss eligibility and documents with our team.
            </li>
            <li>
              <Check size={17} />
              Choose your vehicle and a comfortable repayment plan.
            </li>
          </ul>
        </section>
        <section className="request-section">
          <span className="eyebrow">TAKE THE NEXT STEP</span>
          <h2>Let&apos;s talk finance.</h2>
          <p>Leave a few details. We will help you understand your options.</p>
          <PublicRequestForm
            endpoint="/api/finance"
            key={params.get('model') || 'finance'}
            defaults={{
              vehicleModel: params.get('model') || '',
              employmentType: 'Salaried',
            }}
            payload={{
              loanAmount: amount,
              preferredTenure: months,
              calculationMethod: method,
              message:
                `Customer calculator assumption (${method === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}): ` +
                rate +
                '% annual interest; displayed EMI ' +
                Math.round(emi),
            }}
            fields={[
              {
                name: 'vehicleModel',
                label: 'Vehicle of interest',
                required: true,
                placeholder: 'Brand and model',
                full: true,
              },
              {
                name: 'employmentType',
                label: 'Employment',
                type: 'select',
                required: true,
                options: ['Salaried', 'Self-employed', 'Business', 'Other'],
              },
              {
                name: 'monthlyIncome',
                label: 'Monthly income',
                type: 'select',
                options: [
                  'Below Rs. 15,000',
                  'Rs. 15,000 - 25,000',
                  'Rs. 25,000 - 40,000',
                  'Above Rs. 40,000',
                ],
              },
              {
                name: 'downPayment',
                label: 'Planned down payment (Rs.)',
                type: 'number',
                min: 0,
                max: 10000000,
              },
              {
                name: 'email',
                label: 'Email',
                type: 'email',
                placeholder: 'you@example.com',
              },
            ]}
            buttonLabel="Request finance assistance"
          />
          <a className="support-call" href={'tel:' + CONTACT_INFO.phoneRaw}>
            <Phone size={15} />
            Prefer to speak? {CONTACT_INFO.phone}
          </a>
        </section>
      </div>
    </>
  );
}
export default function FinancePage() {
  return (
    <Suspense
      fallback={<div className="site-container section-space">Loading...</div>}
    >
      <FinanceContent />
    </Suspense>
  );
}
