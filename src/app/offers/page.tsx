'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import PageHeading from '@/components/PageHeading';
import { useModal } from '@/context/ModalContext';
import { IS_DESIGN_PREVIEW } from '@/lib/showroom';
interface Offer {
  id: string;
  title: string;
  description: string;
  discountText: string;
  terms?: string;
}
export default function OffersPage() {
  const { openEnquiry } = useModal();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    if (IS_DESIGN_PREVIEW) {
      setLoading(false);
      return;
    }
    fetch('/api/offers', { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            'Current offers could not be loaded. Please contact our team.',
          );
        const data = await res.json();
        if (!data.success)
          throw new Error('Current offers could not be loaded.');
        setOffers(data.offers);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, []);
  return (
    <>
      <PageHeading
        eyebrow="SHOWROOM OFFERS"
        title="A little more to look forward to."
        description="Ask our team about current vehicle, finance and exchange offers."
      />
      <section className="site-container section-space">
        {loading ? (
          <p role="status">Loading offers...</p>
        ) : offers.length ? (
          <div className="offers-grid">
            {offers.map((offer) => (
              <article className="offer-item" key={offer.id}>
                <Tag size={24} />
                <h2>{offer.title}</h2>
                <strong>{offer.discountText}</strong>
                <p>{offer.description}</p>
                {offer.terms && (
                  <p className="form-note">Terms: {offer.terms}</p>
                )}
                <button
                  className="button button-primary"
                  onClick={() => openEnquiry('Offer: ' + offer.title)}
                >
                  Enquire about this offer <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="inventory-state" role={error ? 'alert' : 'status'}>
            <Tag size={30} />
            <h2>
              {error ? 'Let us check for you.' : 'Looking for a good deal?'}
            </h2>
            <p>
              {error ||
                'No confirmed offers are listed at the moment. Speak to our showroom team about options for your next vehicle.'}
            </p>
            <button
              className="button button-primary"
              onClick={() => openEnquiry('Current offers')}
            >
              Ask about current offers <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
