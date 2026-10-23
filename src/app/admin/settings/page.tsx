'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CONTACT_INFO } from '@/lib/constants';

export default function AdminSettingsPage() {
  const [dealershipName, setDealershipName] = useState('Gurudev Motors');
  const [tagline, setTagline] = useState('Ride Your Dream');
  const [phone, setPhone] = useState(CONTACT_INFO.phone);
  const [whatsapp, setWhatsapp] = useState(CONTACT_INFO.whatsapp);
  const [email, setEmail] = useState(CONTACT_INFO.email);
  const [gstin, setGstin] = useState('22AAAAA0000A1Z5');
  const [showroomAddress, setShowroomAddress] = useState(CONTACT_INFO.showroomAddress);
  const [serviceAddress, setServiceAddress] = useState(CONTACT_INFO.serviceCenterAddress);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gm-navy tracking-tight">
            Dealership Configuration & Settings
          </h1>
          <p className="text-xs text-gm-muted mt-0.5">
            Manage legal dealership parameters, GST registration, contact numbers, and location addresses.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gm-line shadow-xs max-w-3xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Dealership Business Name</label>
                <input
                  type="text"
                  value={dealershipName}
                  onChange={(e) => setDealershipName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm font-bold focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">Direct Calling Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">WhatsApp Business #</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm font-mono focus:outline-none focus:border-gm-navy uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1">Main Showroom Address</label>
              <textarea
                value={showroomAddress}
                onChange={(e) => setShowroomAddress(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1">New Service Centre Address</label>
              <textarea
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy resize-none"
                required
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gm-line">
              {saved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings saved successfully!
                </span>
              ) : (
                <span className="text-xs text-gm-muted">
                  Last updated by Main Admin
                </span>
              )}

              <button
                type="submit"
                className="bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
