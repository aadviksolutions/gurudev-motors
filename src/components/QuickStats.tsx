import React from 'react';

export default function QuickStats() {
  const stats = [
    { value: '05+', label: 'Major Brands', sub: 'Hero, Honda, Suzuki, Bajaj, Kinetic' },
    { value: '30+', label: 'Listed Models', sub: 'Motorcycles & Scooters' },
    { value: 'NEW + USED', label: 'Vehicle Options', sub: 'Certified pre-owned with warranty' },
    { value: 'EV', label: 'Electric Mobility', sub: 'Kinetic Green E-Luna & Zulu' },
  ];

  return (
    <section className="relative z-20 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gm-line rounded-2xl shadow-gm divide-y sm:divide-y-0 sm:divide-x divide-gm-line overflow-hidden">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 sm:p-7 flex flex-col justify-between hover:bg-gm-soft/60 transition-colors">
            <div>
              <b className="text-3xl sm:text-4xl font-black text-gm-navy tracking-tight block">
                {stat.value}
              </b>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-gm-muted mt-2 block">
                {stat.label}
              </span>
            </div>
            <p className="text-xs text-gm-muted/80 mt-2 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
