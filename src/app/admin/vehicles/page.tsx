'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Fuel,
  Upload,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { VEHICLE_BRANDS } from '@/lib/constants';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  // Form state
  const [brand, setBrand] = useState('Hero');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [category, setCategory] = useState('NEW');
  const [year, setYear] = useState('2026');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [km, setKm] = useState('0');
  const [colour, setColour] = useState('Standard');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [emi, setEmi] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [stockStatus, setStockStatus] = useState('IN_STOCK');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState('/images/hero.jpeg');
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`/api/vehicles?all=true&category=${categoryFilter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [categoryFilter]);

  const openAddModal = () => {
    setEditingVehicle(null);
    setBrand('Hero');
    setModel('');
    setVariant('');
    setCategory('NEW');
    setYear('2026');
    setFuel('Petrol');
    setTransmission('Manual');
    setKm('0');
    setColour('Black');
    setPrice('');
    setOfferPrice('');
    setEmi('');
    setDescription('');
    setFeatures('');
    setStockStatus('IN_STOCK');
    setFeatured(false);
    setPublished(true);
    setImageUrl('/images/bikes-1.jpeg');
    setModalOpen(true);
  };

  const openEditModal = (v: any) => {
    setEditingVehicle(v);
    setBrand(v.brand);
    setModel(v.model);
    setVariant(v.variant || '');
    setCategory(v.category);
    setYear(String(v.year));
    setFuel(v.fuel);
    setTransmission(v.transmission);
    setKm(String(v.km));
    setColour(v.colour);
    setPrice(String(v.price));
    setOfferPrice(v.offerPrice ? String(v.offerPrice) : '');
    setEmi(v.emi ? String(v.emi) : '');
    setDescription(v.description || '');
    setFeatures(v.features || '');
    setStockStatus(v.stockStatus);
    setFeatured(Boolean(v.featured));
    setPublished(Boolean(v.published));
    setImageUrl(v.imageUrl || '/images/hero.jpeg');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !price) return;

    setSubmitting(true);
    const payload = {
      brand,
      model,
      variant,
      category,
      year: Number(year),
      fuel,
      transmission,
      km: Number(km),
      colour,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      emi: emi ? Number(emi) : null,
      description,
      features,
      stockStatus,
      featured,
      published,
      imageUrl,
    };

    try {
      if (editingVehicle) {
        await fetch('/api/vehicles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVehicle.id, ...payload }),
        });
      } else {
        await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await fetch(`/api/vehicles?id=${id}`, { method: 'DELETE' });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await fetch('/api/vehicles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !current }),
      });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Vehicle Inventory Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Live showroom catalog for new two-wheelers, electric mobility and certified pre-owned stock.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVehicles()}
              placeholder="Search brand, model, variant..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['ALL', 'NEW', 'PRE_OWNED', 'ELECTRIC'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-gm-navy text-white'
                    : 'bg-gm-soft text-gm-navy hover:bg-gm-line/50 border border-gm-line'
                }`}
              >
                {cat === 'ALL' ? 'All Inventory' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Fuel & Specs</th>
                  <th className="p-3.5">Ex-Showroom Price</th>
                  <th className="p-3.5">Est. EMI</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5">Published</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      Loading inventory...
                    </td>
                  </tr>
                ) : vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-gm-soft shrink-0 border border-gm-line">
                            <Image
                              src={v.imageUrl || '/images/hero.jpeg'}
                              alt={v.model}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <b className="text-gm-navy block font-black">
                              {v.brand} {v.model}
                            </b>
                            <span className="text-gm-muted text-[10px]">
                              {v.variant || v.colour} ({v.year})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gm-soft text-gm-navy border border-gm-line">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-gm-navy">
                        <span className="font-semibold">{v.fuel}</span>
                        {v.category === 'PRE_OWNED' && (
                          <span className="block text-[10px] text-gm-muted">
                            {v.km.toLocaleString()} km
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-black text-gm-navy">
                        {formatCurrency(v.offerPrice || v.price)}
                        {v.offerPrice && (
                          <span className="block text-[10px] text-gm-muted line-through font-normal">
                            {formatCurrency(v.price)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gm-muted font-bold">
                        {v.emi ? `${formatCurrency(v.emi)}/mo` : '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(v.stockStatus)}`}>
                          {v.stockStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleTogglePublish(v.id, v.published)}
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            v.published ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                          }`}
                        >
                          {v.published ? 'Live' : 'Hidden'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg text-gm-navy hover:bg-gm-soft transition-colors"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Vehicle Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gm-line shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">
                  {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle To Inventory'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted hover:text-gm-navy font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Brand *</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      {VEHICLE_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Model *</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Splendor Plus, Activa 6G"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Variant</label>
                    <input
                      type="text"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="e.g. Disc Smart, Deluxe"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="NEW">NEW</option>
                      <option value="PRE_OWNED">PRE_OWNED</option>
                      <option value="ELECTRIC">ELECTRIC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Fuel Type</label>
                    <select
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Stock Status</label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="IN_STOCK">IN_STOCK</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="SOLD">SOLD</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 78500"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Offer Price (₹)</label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Discounted price"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Estimated EMI (₹/mo)</label>
                    <input
                      type="number"
                      value={emi}
                      onChange={(e) => setEmi(e.target.value)}
                      placeholder="e.g. 2200"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Image URL / Path</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/images/hero.jpeg or https://..."
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Colour</label>
                    <input
                      type="text"
                      value={colour}
                      onChange={(e) => setColour(e.target.value)}
                      placeholder="e.g. Pearl Siren Blue"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Key Features (Comma separated)</label>
                  <input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="i3S Technology, Bluetooth, CBS, Tubeless Tyres"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter sales overview and highlights..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs resize-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gm-navy">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded accent-gm-red"
                    />
                    <span>Featured On Home Page</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gm-navy">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded accent-gm-red"
                    />
                    <span>Publish To Website Catalog</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save To Inventory'}
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
