'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Calendar, CheckCircle2, ArrowRight, Gift, Percent } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
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
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Tag className="w-4 h-4 text-gm-red" />
            Seasonal Deals & Promotions
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Exclusive Dealership Offers
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Save more on your new motorcycle, scooter or electric vehicle with limited-time cashback, exchange bonus, and festive kits at Raipur showroom.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[1, 2].map((n) => (
              <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-8 border border-gm-line shadow-sm hover:shadow-gm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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

                  {/* Highlights pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {offer.exchangeBonus > 0 && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Gift className="w-3 h-3 text-amber-600" />
                        ₹{offer.exchangeBonus.toLocaleString('en-IN')} Exchange Bonus
                      </span>
                    )}
                    {offer.financeOffer && (
                      <span className="text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Percent className="w-3 h-3 text-blue-600" />
                        {offer.financeOffer}
                      </span>
                    )}
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
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gm-line max-w-lg mx-auto mb-16 p-8">
            <Tag className="w-12 h-12 text-gm-red mx-auto mb-3 opacity-60" />
            <h3 className="text-xl font-black text-gm-navy mb-2">No Active Seasonal Promos Right Now</h3>
            <p className="text-xs text-gm-muted mb-6 leading-relaxed">
              Our showroom running offers are updated regularly for festive seasons. Contact our Raipur sales desk directly to enquire about current on-the-spot cash discounts and helmet schemes.
            </p>
            <button
              onClick={() => openEnquiry('Showroom current discount enquiry')}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black px-6 py-3 rounded-xl transition-colors"
            >
              Ask Showroom Team on WhatsApp ↗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
