import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  isPositive?: boolean;
}

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  badge,
  badgeColor = 'bg-blue-50 text-blue-700',
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gm-line shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-gm-muted block mb-1">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gm-navy tracking-tight">
            {value}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gm-soft border border-gm-line flex items-center justify-center text-gm-navy shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-gm-line/50">
        <span className="text-gm-muted text-[11px] font-medium">{sub || 'Updated today'}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
