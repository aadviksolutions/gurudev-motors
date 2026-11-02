'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Save, Check, Sparkles, Building2, User, Phone, MapPin, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminContentPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('hero');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success && data.sections) {
        setSections(data.sections);
        const active = data.sections.find((s: any) => s.sectionKey === selectedKey) || data.sections[0];
        if (active) {
          applySectionData(active);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applySectionData = (sec: any) => {
    setSelectedKey(sec.sectionKey);
    setTitle(sec.title || '');
    setSubtitle(sec.subtitle || '');
    setContent(sec.content || '');
    let parsedMeta: Record<string, any> = {};
    if (sec.metadata) {
      try {
        parsedMeta = typeof sec.metadata === 'string' ? JSON.parse(sec.metadata) : sec.metadata;
      } catch (e) {
        console.warn('Failed parsing metadata', e);
      }
    }
    setMetadata(parsedMeta);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSelectSection = (key: string) => {
    setSelectedKey(key);
    setSaveSuccess(false);
    const sec = sections.find((s) => s.sectionKey === key);
    if (sec) {
      applySectionData(sec);
    } else {
      setTitle('');
      setSubtitle('');
      setContent('');
      setMetadata({});
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: selectedKey,
          title,
          subtitle,
          content,
          metadata,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        fetchSections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateMetaField = (field: string, val: any) => {
    setMetadata((prev) => ({ ...prev, [field]: val }));
  };

  const cmsKeys = [
    { key: 'hero', label: 'Hero Banner & Artwork' },
    { key: 'about', label: 'About Us & Founder Message' },
    { key: 'showroom', label: 'Showroom Location & Contact' },
    { key: 'serviceCenter', label: 'Service Centre & Workshop' },
    { key: 'stats', label: 'Counters & Dealership Stats' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gm-navy tracking-tight">
            Website Content & Graphics Management
          </h1>
          <p className="text-xs text-gm-muted mt-0.5">
            Full administrative control over website headlines, hero artwork, founder note, showroom timings, and contact details live in PostgreSQL.
          </p>
        </div>

        {/* Section selection tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {cmsKeys.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectSection(item.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedKey === item.key
                  ? 'bg-gm-navy text-white shadow-xs'
                  : 'bg-white text-gm-navy hover:bg-gm-soft border border-gm-line'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-xs max-w-3xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gm-line">
              <span className="text-xs font-black uppercase text-gm-red tracking-wider">
                Editing: {cmsKeys.find((k) => k.key === selectedKey)?.label}
              </span>
              <span className="text-[11px] font-mono text-gm-muted">key: {selectedKey}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1.5">
                  Eyebrow / Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. YOUR MULTI-BRAND SHOWROOM IN RAIPUR"
                  className="w-full px-4 py-2 rounded-xl border border-gm-line text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gm-navy mb-1.5">
                  Main Headline / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gurudev Motors."
                  className="w-full px-4 py-2 rounded-xl border border-gm-line text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Main Body Text / Description *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Enter section description or details..."
                className="w-full px-4 py-2.5 rounded-xl border border-gm-line text-xs leading-relaxed resize-none"
                required
              />
            </div>

            {/* Custom fields per section */}
            {selectedKey === 'hero' && (
              <div className="space-y-4 pt-3 border-t border-gm-line">
                <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Hero Graphics & Actions
                </h4>
                <ImageUpload
                  value={metadata.imageUrl || '/images/hero/raipur-road-wide.webp'}
                  onChange={(url) => updateMetaField('imageUrl', url)}
                  label="Hero Raipur Road Background Artwork"
                  aspectRatio="wide"
                  helperText="Upload custom landscape or panoramic background (JPG, PNG, WebP)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Primary CTA Button</label>
                    <input
                      type="text"
                      value={metadata.primaryCtaText || 'Explore vehicles'}
                      onChange={(e) => updateMetaField('primaryCtaText', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">CTA Destination URL</label>
                    <input
                      type="text"
                      value={metadata.primaryCtaLink || '/vehicles'}
                      onChange={(e) => updateMetaField('primaryCtaLink', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedKey === 'about' && (
              <div className="space-y-4 pt-3 border-t border-gm-line">
                <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Founder Message & Photo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Founder Full Name</label>
                    <input
                      type="text"
                      value={metadata.founderName || 'Rajesh Sharma'}
                      onChange={(e) => updateMetaField('founderName', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Founder Title</label>
                    <input
                      type="text"
                      value={metadata.founderTitle || 'Founder (Gurudev Motors)'}
                      onChange={(e) => updateMetaField('founderTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Founder Message</label>
                  <textarea
                    value={metadata.founderMessage || 'We want choosing a vehicle to feel simple. Tell us what you need, and we will help you compare your options, understand the price and find what suits you.'}
                    onChange={(e) => updateMetaField('founderMessage', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs resize-none"
                  />
                </div>
                <ImageUpload
                  value={metadata.founderImageUrl || '/images/desk.jpeg'}
                  onChange={(url) => updateMetaField('founderImageUrl', url)}
                  label="Founder Portrait Photo"
                  aspectRatio="square"
                  helperText="Upload professional portrait of founder or leadership (JPG, PNG, WebP)"
                />
              </div>
            )}

            {selectedKey === 'showroom' && (
              <div className="space-y-4 pt-3 border-t border-gm-line">
                <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Dealership Contact & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Direct Phone Number</label>
                    <input
                      type="text"
                      value={metadata.phone || '+91 93006 70006'}
                      onChange={(e) => updateMetaField('phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">WhatsApp Chat Number</label>
                    <input
                      type="text"
                      value={metadata.whatsapp || '919300670006'}
                      onChange={(e) => updateMetaField('whatsapp', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Opening Hours & Days</label>
                  <input
                    type="text"
                    value={metadata.timings || '10:00 AM - 8:30 PM, Open all 7 days'}
                    onChange={(e) => updateMetaField('timings', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Google Maps Directions Link</label>
                  <input
                    type="text"
                    value={metadata.mapLink || 'https://www.google.com/maps/search/?api=1&query=Gurudev+Motors+Mahadev+Ghat+Tiraha+Chowk+Raipur'}
                    onChange={(e) => updateMetaField('mapLink', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {selectedKey === 'serviceCenter' && (
              <div className="space-y-4 pt-3 border-t border-gm-line">
                <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Workshop Details
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Workshop Address</label>
                  <input
                    type="text"
                    value={metadata.serviceAddress || 'In front of New Raipura Hospital & Shri Ganesh Mandir lane, Raipura, Raipur, Chhattisgarh'}
                    onChange={(e) => updateMetaField('serviceAddress', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Workshop Timings</label>
                  <input
                    type="text"
                    value={metadata.timings || 'Monday to Saturday: 9:00 AM - 7:00 PM'}
                    onChange={(e) => updateMetaField('timings', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-gm-line">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Saved and active live in database!
                </span>
              ) : (
                <span className="text-xs text-gm-muted">
                  Saved immediately to database and active across website.
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs px-7 py-3 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
