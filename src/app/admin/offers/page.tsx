'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tag, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import { formatDate } from '@/lib/utils';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('SPECIAL DEAL');
  const [discountText, setDiscountText] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [exchangeBonus, setExchangeBonus] = useState('');
  const [terms, setTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/offers?all=true');
      const data = await res.json();
      if (data.success) setOffers(data.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !discountText || !description) return;

    setSubmitting(true);
    try {
      await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          badge,
          discountText,
          description,
          imageUrl: imageUrl || null,
          exchangeBonus: exchangeBonus ? Number(exchangeBonus) : 0,
          terms,
          active: true,
        }),
      });
      setModalOpen(false);
      setTitle('');
      setDiscountText('');
      setDescription('');
      setImageUrl('');
      setExchangeBonus('');
      setTerms('');
      fetchOffers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !current }),
      });
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional offer?')) return;
    try {
      await fetch(`/api/offers?id=${id}`, { method: 'DELETE' });
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Promotional Offers & Festive Deals
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Configure cashback, zero-down payment schemes, and festival discounts visible on the public website.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {offer.imageUrl && (
                  <div className="relative h-40 w-full bg-gm-soft border-b border-gm-line">
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      fill
                      className="object-cover"
                      unoptimized={offer.imageUrl.startsWith('data:') || offer.imageUrl.startsWith('/uploads/')}
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gm-red/10 text-gm-red">
                      {offer.badge || 'OFFER'}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${offer.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gm-navy">{offer.title}</h3>
                  <p className="text-xs font-bold text-gm-red mt-1">{offer.discountText}</p>
                  <p className="text-xs text-gm-muted mt-2 line-clamp-3">{offer.description}</p>
                  {offer.exchangeBonus > 0 && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-2">
                      Exchange Bonus: ₹{offer.exchangeBonus.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-gm-line/50 mt-4">
                <button
                  onClick={() => handleToggle(offer.id, offer.active)}
                  className="text-xs font-bold text-gm-navy hover:underline"
                >
                  {offer.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gm-line shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Add Promotional Deal</h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Badge</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. FESTIVE OFFER"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Discount Headline *</label>
                    <input
                      type="text"
                      value={discountText}
                      onChange={(e) => setDiscountText(e.target.value)}
                      placeholder="e.g. Save ₹5,000 + Free Helmet"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Offer Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Navratri Super Dhamaka"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Exchange Bonus (₹ Optional)</label>
                  <input
                    type="number"
                    value={exchangeBonus}
                    onChange={(e) => setExchangeBonus(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>

                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Offer Banner / Graphic Poster"
                  aspectRatio="wide"
                  helperText="Upload promotional flyer, festive banner or discount poster (PNG, JPG, WebP)"
                />

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about eligible models and finance terms..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Terms & Conditions</label>
                  <input
                    type="text"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="e.g. Valid till stocks last. T&C apply."
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy text-white font-bold text-xs py-2 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Saving...' : 'Publish Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
