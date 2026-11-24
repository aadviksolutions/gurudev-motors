'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PREDEFINED_SERVICES, ServiceCatalogItem, filterServiceCatalog } from '@/lib/service-catalog';

interface ServiceItemAutocompleteProps {
  serviceCode: string;
  description: string;
  itemType: 'SERVICE' | 'PARTS';
  onSelect: (item: ServiceCatalogItem) => void;
  onCodeChange: (code: string) => void;
  onDescriptionChange: (desc: string) => void;
  placeholder?: string;
}

export default function ServiceItemAutocomplete({
  serviceCode,
  description,
  itemType,
  onSelect,
  onCodeChange,
  onDescriptionChange,
  placeholder,
}: ServiceItemAutocompleteProps) {
  const [openDropdown, setOpenDropdown] = useState<'NONE' | 'CODE' | 'DESC'>('NONE');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown('NONE');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const codeMatches = React.useMemo(() => {
    if (!serviceCode.trim()) return PREDEFINED_SERVICES;
    return filterServiceCatalog(serviceCode);
  }, [serviceCode]);

  const descMatches = React.useMemo(() => {
    if (!description.trim()) return PREDEFINED_SERVICES;
    return filterServiceCatalog(description);
  }, [description]);

  const handleSelectItem = (item: ServiceCatalogItem) => {
    onSelect(item);
    setOpenDropdown('NONE');
  };

  return (
    <div ref={containerRef} className="col-span-6 grid grid-cols-6 gap-2 relative">
      {/* Service Code Column (Col span 2) */}
      <div className="col-span-2 relative">
        <input
          type="text"
          value={serviceCode}
          onChange={(e) => {
            onCodeChange(e.target.value.toUpperCase());
            setOpenDropdown('CODE');
          }}
          onFocus={() => setOpenDropdown('CODE')}
          placeholder="e.g. SRV-01"
          className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-mono font-bold uppercase focus:outline-none focus:border-gm-navy"
        />

        {/* Dropdown for Code */}
        {openDropdown === 'CODE' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl border border-gm-line shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-gm-line/50">
            <div className="p-1.5 bg-gm-soft/80 text-[9px] font-black uppercase text-gm-muted">
              Predefined Services ({codeMatches.length})
            </div>
            {codeMatches.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-gm-soft text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-mono font-black text-gm-red mr-1.5">{item.code}</span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description Column (Col span 4) */}
      <div className="col-span-4 relative">
        <input
          type="text"
          value={description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
            setOpenDropdown('DESC');
          }}
          onFocus={() => setOpenDropdown('DESC')}
          placeholder={placeholder || (itemType === 'SERVICE' ? 'Type service (e.g. Engine Oil, Brake...)' : 'Part name...')}
          className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
        />

        {/* Dropdown for Description */}
        {openDropdown === 'DESC' && (
          <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl border border-gm-line shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-gm-line/50">
            <div className="p-1.5 bg-gm-soft/80 text-[9px] font-black uppercase text-gm-muted flex justify-between">
              <span>Matching Services ({descMatches.length})</span>
              <span className="text-[8.5px] lowercase">or type custom below</span>
            </div>
            {descMatches.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-gm-soft text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-mono font-black text-gm-red text-[10px] mr-1.5">[{item.code}]</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
