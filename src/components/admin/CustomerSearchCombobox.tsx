'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Phone, CheckCircle2, X, Bike } from 'lucide-react';

interface CustomerSearchComboboxProps {
  customers: any[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: any) => void;
  onClearCustomer: () => void;
  selectedCustomerName?: string;
  selectedVehicleInfo?: string;
}

export default function CustomerSearchCombobox({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onClearCustomer,
  selectedCustomerName,
  selectedVehicleInfo,
}: CustomerSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers based on user query
  const filteredCustomers = React.useMemo(() => {
    if (!query.trim()) {
      // Show first 15 if no query
      return customers.slice(0, 15);
    }
    const q = query.trim().toLowerCase();
    const cleanQ = q.replace(/[^0-9]/g, '');

    return customers
      .filter((c) => {
        const nameMatch = c.name && c.name.toLowerCase().includes(q);
        const mobileMatch = c.mobile && (c.mobile.includes(q) || (cleanQ && c.mobile.replace(/[^0-9]/g, '').includes(cleanQ)));
        const regMatch = (c.vehicleRegNo || c.jobCards?.[0]?.vehicleRegNumber || '').toLowerCase().includes(q);
        const modelMatch = (c.vehicleModel || c.jobCards?.[0]?.vehicleModel || '').toLowerCase().includes(q);
        return nameMatch || mobileMatch || regMatch || modelMatch;
      })
      .sort((a, b) => {
        // Prioritize exact start match on name (e.g. "Aa" -> "Aasha", "Aabha")
        const aStarts = (a.name || '').toLowerCase().startsWith(q);
        const bStarts = (b.name || '').toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, 25);
  }, [customers, query]);

  const handleSelect = (c: any) => {
    onSelectCustomer(c);
    setQuery(c.name || '');
    setIsOpen(false);
  };

  const handleClear = () => {
    onClearCustomer();
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <label className="block text-[11px] font-black uppercase text-gm-navy flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-gm-red" />
          <span>Search / Select Customer (Type Name or Mobile)</span>
        </span>
        {selectedCustomerId && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-gm-red font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Clear / Change</span>
          </button>
        )}
      </label>

      {/* Input box */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Type to search existing customer (e.g. Aa, Rahul, 9826...)"
          className="w-full pl-9 pr-9 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none focus:border-gm-navy shadow-2xs"
        />
        <Search className="w-4 h-4 text-gm-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gm-muted hover:text-gm-navy rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Indicator Pill */}
      {selectedCustomerId && selectedCustomerName && (
        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Customer: <b>{selectedCustomerName}</b> {selectedVehicleInfo ? `(${selectedVehicleInfo})` : ''}
            </span>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white">
            Matched &amp; Populated
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gm-line shadow-2xl z-40 max-h-64 overflow-y-auto divide-y divide-gm-line/50">
          <div className="p-2 bg-gm-soft/70 text-[10px] font-bold uppercase text-gm-muted flex items-center justify-between">
            <span>Recorded Customers ({filteredCustomers.length})</span>
            {query && <span>Filter: &ldquo;{query}&rdquo;</span>}
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-xs text-gm-muted space-y-1">
              <p className="font-semibold text-slate-700">No registered customer found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px]">You can enter new customer details manually in the fields below.</p>
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const vDisplay =
                c.vehicleModel ||
                c.jobCards?.[0]?.vehicleModel ||
                (c.sales?.[0]?.vehicle ? `${c.sales[0].vehicle.brand} ${c.sales[0].vehicle.model}` : null) ||
                '';
              const rDisplay = c.vehicleRegNo || c.jobCards?.[0]?.vehicleRegNumber || '';
              const isSelected = selectedCustomerId === c.id;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full text-left p-2.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected ? 'bg-gm-soft font-bold' : 'hover:bg-gm-soft/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gm-navy shrink-0" />
                      <span className="text-xs font-black text-gm-navy truncate">{c.name}</span>
                      <span className="text-[10px] text-gm-muted flex items-center gap-1 font-mono">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        {c.mobile}
                      </span>
                    </div>

                    {(vDisplay || rDisplay) && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-600 font-medium">
                        <Bike className="w-3 h-3 text-gm-red shrink-0" />
                        <span className="truncate">
                          {vDisplay || 'Vehicle'} {rDisplay ? `• ${rDisplay}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-gm-navy font-bold px-2 py-0.5 rounded bg-gm-soft shrink-0">
                      Select
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
