import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Two-Wheeler Loan & EMI Calculator | Gurudev Motors Raipur',
  description:
    'Calculate two-wheeler loan monthly EMI with Reducing Balance and Flat Rate options. Low down payment finance, instant approval, and low interest rates in Raipur.',
  keywords: [
    'Two wheeler loan Raipur',
    'Bike EMI calculator Raipur',
    'Low down payment bike finance Raipur',
    'Scooty loan Raipur',
    'Two wheeler finance Chhattisgarh',
  ],
  alternates: {
    canonical: 'https://gurudevmotors.com/finance',
  },
  openGraph: {
    title: 'Two-Wheeler Loan & EMI Calculator | Gurudev Motors Raipur',
    description: 'Estimate your monthly EMI and apply for quick two-wheeler financing in Raipur.',
    url: 'https://gurudevmotors.com/finance',
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

