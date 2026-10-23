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
  const r = rate / 1200;
  const emi =
    r === 0
      ? amount / months
      : (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
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
              <span>Estimated monthly EMI</span>
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
                  <strong>{formatCurrency(Math.round(total - amount))}</strong>
                </span>
                <span>
                  Total payable
                  <strong>{formatCurrency(Math.round(total))}</strong>
                </span>
              </div>
            </div>
            <p className="form-note">
              Illustrative reducing-balance calculation only. Actual rate, fees,
              down payment and eligibility depend on the lender. This is not a
              loan offer or approval.
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
              message:
                'Customer calculator assumption: ' +
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
