'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SHOWROOM');
  const [imageUrl, setImageUrl] = useState('/images/showroom-1.jpeg');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setSubmitting(true);
    try {
      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          imageUrl,
          description,
          order: items.length + 1,
        }),
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchGallery();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from gallery?')) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      fetchGallery();
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
              Showroom & Workshop Gallery
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Manage public gallery photos and customer celebration moments.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-gm-soft">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <b className="text-xs font-black text-gm-navy block mb-1">{item.title}</b>
                  <p className="text-[11px] text-gm-muted line-clamp-2">{item.description || 'No description'}</p>
                </div>
              </div>
              <div className="p-4 pt-0 text-right">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Add Gallery Photo</h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Photo Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hero Delivery Celebration"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="SHOWROOM">SHOWROOM</option>
                      <option value="VEHICLES">VEHICLES</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="EVENTS">EVENTS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Image URL / Path *</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/images/hero.jpeg"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief caption..."
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
                    {submitting ? 'Saving...' : 'Add To Gallery'}
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
