'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';

export default function OffersPage() {
  const { openEnquiry } = useModal();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/offers');
        const data = await res.json();
        if (data.success) {
          setOffers(data.offers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="py-12 bg-gm-soft min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Tag className="w-4 h-4 text-gm-red" />
            Seasonal Deals & Promotions
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gm-navy">
            Exclusive Dealership Offers
          </h1>
          <p className="text-sm text-gm-muted mt-3">
            Save more on your new motorcycle, scooter or electric vehicle with limited-time cashback, exchange bonus, and festive kits at Raipur showroom.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm hover:shadow-gm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gm-red text-white px-3 py-1 rounded-full">
                      {offer.badge || 'SPECIAL DEAL'}
                    </span>
                    {offer.validTill && (
                      <span className="text-xs text-gm-muted flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-gm-red" />
                        Valid till {formatDate(offer.validTill)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-gm-navy mb-2 tracking-tight">
                    {offer.title}
                  </h3>
                  <div className="text-xl font-black text-gm-red mb-3">
                    {offer.discountText}
                  </div>
                  <p className="text-xs sm:text-sm text-gm-muted leading-relaxed mb-6">
                    {offer.description}
                  </p>

                  {offer.terms && (
                    <div className="p-3 rounded-xl bg-gm-soft text-[11px] text-gm-muted border border-gm-line/60">
                      <b>Terms:</b> {offer.terms}
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => openEnquiry(`Claim Offer: ${offer.title}`)}
                    className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white font-black text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Claim Offer On WhatsApp ↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
