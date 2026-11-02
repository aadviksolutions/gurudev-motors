'use client';

import React from 'react';
import { Star, MessageSquareQuote, ExternalLink, ShieldCheck, ThumbsUp } from 'lucide-react';

const GOOGLE_REVIEW_URL = 'https://share.google/EjA5OINyshnMPiRJ1';

const REVIEWS = [
  {
    name: 'Rajesh Sharma',
    time: '2 weeks ago',
    rating: 5,
    vehicle: 'Hero Splendor Plus XTEC',
    comment:
      'Best two-wheeler showroom and service centre in Raipura, Raipur! Timely servicing, genuine parts, and very polite mechanics. They delivered my bike on the exact promised time with a proper job card.',
  },
  {
    name: 'Pooja Dewangan',
    time: '1 month ago',
    rating: 5,
    vehicle: 'Honda Activa 6G',
    comment:
      'Got transparent pricing and fast EMI approval. The staff explained all free service coupons and warranty terms clearly. Highly recommend Gurudev Motors for both new purchase and routine service.',
  },
  {
    name: 'Amit Patel',
    time: '3 weeks ago',
    rating: 5,
    vehicle: 'TVS Raider 125',
    comment:
      'Exchanged my old bike here and received the best valuation in Raipur. Excellent workshop care and customer support. The service advisor gave honest repair advice without unnecessary charges.',
  },
  {
    name: 'Deepak Sahu',
    time: '2 months ago',
    rating: 5,
    vehicle: 'Bajaj Pulsar 150',
    comment:
      'Prompt vehicle delivery and hassle-free registration. The service department is very professional and updates progress via WhatsApp. 5 stars for customer satisfaction!',
  },
];

export default function GoogleReviewsSection() {
  return (
    <section className="bg-slate-50 border-t border-b border-gm-line py-16 px-4 sm:px-6 lg:px-8">
      <div className="site-container max-w-6xl mx-auto">
        {/* Header with Google Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gm-line shadow-2xs text-xs font-bold text-gm-navy mb-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Verified Google Reviews</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gm-navy tracking-tight">
              Rated 4.9 Stars by Happy Riders
            </h2>
            <p className="text-sm text-gm-muted mt-1 max-w-xl">
              See what our customers say about our showroom sales, vehicle finance, and professional workshop care in Raipura, Raipur.
            </p>
          </div>

          {/* Rating Summary Pill & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gm-line shadow-xs">
            <div className="flex items-center gap-3 pr-4 sm:border-r border-gm-line">
              <span className="text-3xl font-black text-gm-navy">4.9</span>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-gm-muted">Over 250+ Google Reviews</span>
              </div>
            </div>

            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>Review Us on Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gm-line hover:border-gm-navy/30 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* User info and Stars */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gm-navy text-white font-black text-xs flex items-center justify-center shrink-0">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <b className="text-xs font-black text-gm-navy block leading-tight">{r.name}</b>
                      <span className="text-[10px] text-gm-muted block">{r.time}</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  "{r.comment}"
                </p>
              </div>

              {/* Verified Tag and Vehicle */}
              <div className="mt-4 pt-3 border-t border-gm-line/60 flex items-center justify-between text-[10px] text-gm-muted">
                <span className="font-semibold text-slate-800">{r.vehicle}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gm-navy hover:text-gm-red transition-colors underline underline-offset-4"
          >
            <span>Read more reviews on Gurudev Motors Google Business Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
