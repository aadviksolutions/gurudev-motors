'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { key: 'ALL', label: 'All Photos' },
    { key: 'SHOWROOM', label: 'Showroom' },
    { key: 'VEHICLES', label: 'Vehicles' },
    { key: 'WORKSHOP', label: 'Workshop' },
    { key: 'DELIVERY', label: 'Delivery' },
    { key: 'EVENTS', label: 'Events' },
    { key: 'OTHER', label: 'Other' },
  ];

  const filtered = items.filter((item) => {
    if (category === 'ALL') return true;
    return item.category?.toUpperCase() === category;
  });

  return (
    <div className="py-8 sm:py-12 bg-gm-soft min-h-screen section-full w-full">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-gm-red block mb-2 flex items-center justify-center gap-1.5">
            <Camera className="w-4 h-4 text-gm-red" />
            Inside Gurudev Motors
          </span>
          <h1
            className="font-black uppercase tracking-tight text-gm-navy break-words"
            style={{ fontSize: 'clamp(1.85rem, 4vw, 3rem)' }}
          >
            Photo Gallery
          </h1>
          <p className="text-sm text-gm-muted mt-3 max-w-xl mx-auto">
            Real photos from our Mahadev Ghat Chowk showroom, motorcycle pavilion, customer delivery moments, and modern service workshop.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                category === cat.key
                  ? 'bg-gm-navy text-white shadow-md'
                  : 'bg-white text-gm-navy hover:bg-gm-navy hover:text-white border border-gm-line'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-white rounded-2xl animate-pulse border border-gm-line" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group relative h-72 rounded-3xl overflow-hidden border border-gm-line shadow-sm bg-white"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gm-red block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-black tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gm-line max-w-md mx-auto mb-16 p-8">
            <ImageIcon className="w-12 h-12 text-gm-muted mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-black text-gm-navy mb-1">No Photos in this Category</h3>
            <p className="text-xs text-gm-muted mb-4">
              Photos for this section will be added soon. Browse other gallery categories.
            </p>
            <button
              onClick={() => setCategory('ALL')}
              className="bg-gm-navy text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gm-navy-dark transition-colors"
            >
              View All Photos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
