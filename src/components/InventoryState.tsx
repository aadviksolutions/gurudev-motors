'use client';
import { ArrowRight, RefreshCw, Search } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
export default function InventoryState({
  error,
  onRetry,
  filtered = false,
}: {
  error?: string;
  onRetry?: () => void;
  filtered?: boolean;
}) {
  const { openEnquiry } = useModal();
  return (
    <div className="inventory-state" role={error ? 'alert' : 'status'}>
      <Search size={26} />
      <div>
        <h3>
          {error
            ? 'The vehicle list is taking a break.'
            : filtered
              ? 'Let’s find another match.'
              : 'Looking for something specific?'}
        </h3>
        <p>
          {error ||
            (filtered
              ? 'Try another brand or budget, or let our team help you choose.'
              : 'Our team can help with current availability, prices and incoming vehicles.')}
        </p>
      </div>
      <div className="inline-actions">
        {onRetry && (
          <button className="button button-secondary" onClick={onRetry}>
            <RefreshCw size={15} /> {error ? 'Try again' : 'Reset filters'}
          </button>
        )}
        <button
          className="button button-primary"
          onClick={() => openEnquiry('Help me find a vehicle')}
        >
          Ask our team <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
