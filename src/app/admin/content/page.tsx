'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Save, Check, Sparkles } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminContentPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('hero');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success) {
        setSections(data.sections);
        const active = data.sections.find((s: any) => s.sectionKey === selectedKey) || data.sections[0];
        if (active) {
          setSelectedKey(active.sectionKey);
          setTitle(active.title);
          setSubtitle(active.subtitle || '');
          setContent(active.content);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSelectSection = (key: string) => {
    setSelectedKey(key);
    setSaveSuccess(false);
    const sec = sections.find((s) => s.sectionKey === key);
    if (sec) {
      setTitle(sec.title);
      setSubtitle(sec.subtitle || '');
      setContent(sec.content);
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const cmsKeys = [
    { key: 'hero', label: 'Hero Section Banner' },
    { key: 'about', label: 'About Us Section' },
    { key: 'showroom', label: 'Showroom Location & Timings' },
    { key: 'serviceCenter', label: 'Service Centre & Workshop Info' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gm-navy tracking-tight">
            Website Content Management (CMS)
          </h1>
          <p className="text-xs text-gm-muted mt-0.5">
            Modify text, banners, showroom information, and timings live on the public website without editing code.
          </p>
        </div>

        {/* Section buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {cmsKeys.map((item) => (
            <button
              key={item.key}
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

        {/* Editor Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gm-line shadow-xs max-w-3xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Eyebrow / Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Raipur's multi-brand mobility destination"
                className="w-full px-4 py-2.5 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Main Heading Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. RIDE YOUR DREAM."
                className="w-full px-4 py-2.5 rounded-xl border border-gm-line text-sm font-bold focus:outline-none focus:border-gm-navy"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Main Body Content / Details *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Enter section description or address..."
                className="w-full px-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy leading-relaxed"
                required
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Website updated live!
                </span>
              ) : (
                <span className="text-xs text-gm-muted">
                  Changes take effect immediately on public site.
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-gm-red hover:bg-gm-red-dark text-white font-extrabold text-xs px-7 py-3 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish Update'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
