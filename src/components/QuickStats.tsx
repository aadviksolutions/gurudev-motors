import React from 'react';

export default function QuickStats() {
  const stats = [
    { value: '05+', label: 'Major Brands', sub: 'Hero, Honda, Suzuki, Bajaj, Kinetic' },
    { value: '30+', label: 'Listed Models', sub: 'Motorcycles & Scooters' },
    { value: 'NEW + USED', label: 'Vehicle Options', sub: 'Certified pre-owned' },
    { value: 'EV', label: 'Electric Mobility', sub: 'Kinetic Green range' },
  ];

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 lg:-mt-12 site-container section-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gm-line rounded-2xl shadow-gm divide-y sm:divide-y-0 sm:divide-x divide-gm-line overflow-hidden w-full">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 sm:p-6 lg:p-7 flex flex-col justify-between hover:bg-gm-soft/60 transition-colors">
            <div>
              <b className="text-2xl sm:text-3xl lg:text-4xl font-black text-gm-navy tracking-tight block">
                {stat.value}
              </b>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-gm-muted mt-1.5 sm:mt-2 block">
                {stat.label}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gm-muted/80 mt-1.5 sm:mt-2 font-medium line-clamp-1">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
