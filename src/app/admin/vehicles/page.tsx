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
  Clock,
  AlertCircle,
  Check,
  X,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import VehicleMultiImageUpload from '@/components/admin/VehicleMultiImageUpload';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { VEHICLE_BRANDS } from '@/lib/constants';

type TabView = 'INVENTORY' | 'REQUESTS';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [inventoryRequests, setInventoryRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('INVENTORY');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState('PENDING');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

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
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Fetch Current User
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        const role = (data.user.roleCode || '').toUpperCase();
        const isAdmin = role === 'MAIN_ADMIN' || role === 'SUPER_ADMIN' || role === 'ADMIN';
        setIsGlobalAdmin(isAdmin);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVehicles = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/vehicles?all=true&category=${categoryFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/inventory-requests?status=${requestStatusFilter}`);
      const data = await res.json();
      if (data.success) {
        setInventoryRequests(data.requests);
        setPendingCount(data.pendingCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [categoryFilter]);

  useEffect(() => {
    fetchRequests();
  }, [requestStatusFilter]);

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
    setImages(['/images/bikes-1.jpeg']);
    setActionSuccessMsg('');
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

    // Load full multi-image gallery for new and used vehicles
    let initialImages: string[] = [];
    if (Array.isArray(v.images) && v.images.length > 0) {
      initialImages = v.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
    } else if (v.imageUrl) {
      initialImages = [v.imageUrl];
    }
    if (initialImages.length === 0) initialImages = ['/images/bikes-1.jpeg'];

    setImages(initialImages);
    setImageUrl(initialImages[0]);
    setActionSuccessMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !price) return;

    setSubmitting(true);
    const coverPhoto = images.length > 0 ? images[0] : (imageUrl || '/images/bikes-1.jpeg');
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
      imageUrl: coverPhoto,
      images: images.length > 0
        ? images.map((url, idx) => ({ url, isPrimary: idx === 0, order: idx }))
        : [{ url: coverPhoto, isPrimary: true, order: 0 }],
    };

    try {
      let res;
      if (editingVehicle) {
        res = await fetch('/api/vehicles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVehicle.id, ...payload }),
        });
      } else {
        res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      setModalOpen(false);

      if (data.pendingApproval) {
        alert(data.message || 'Request submitted to Admin for approval.');
        fetchRequests();
      } else {
        fetchVehicles();
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, vName: string) => {
    const confirmPrompt = isGlobalAdmin
      ? `Are you sure you want to permanently delete ${vName} from inventory?`
      : `Submit a request to Admin to REMOVE ${vName} from inventory?`;

    if (!confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`/api/vehicles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.pendingApproval) {
        alert(data.message || 'Removal request submitted to Admin for approval.');
        fetchRequests();
      } else {
        fetchVehicles();
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !current }),
      });
      const data = await res.json();
      if (data.pendingApproval) {
        alert('Publish status change submitted to Admin for approval.');
        fetchRequests();
      } else {
        fetchVehicles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    let rejectionReason: string | undefined = undefined;
    if (action === 'REJECT') {
      const promptReason = prompt('Enter rejection reason (optional):');
      if (promptReason === null) return; // cancelled
      rejectionReason = promptReason.trim();
    }

    setProcessingReqId(requestId);
    try {
      const res = await fetch('/api/inventory-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
        fetchVehicles();
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingReqId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-gm-red" />
              Vehicle Inventory Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Live showroom catalog for new two-wheelers, electric mobility and certified pre-owned stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchVehicles();
                fetchRequests();
              }}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openAddModal}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Tab switch: Fleet vs Pending Requests */}
        <div className="flex gap-2 border-b border-gm-line pb-3">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'INVENTORY'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Showroom Fleet Inventory ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 relative ${
              activeTab === 'REQUESTS'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-gm-red" />
            <span>Approval Requests</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gm-red text-white">
                {pendingCount} Pending
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SHOWROOM INVENTORY FLEET */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-4">
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
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Published</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line/60">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gm-muted">Loading inventory...</td>
                      </tr>
                    ) : vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gm-muted">No vehicles found.</td>
                      </tr>
                    ) : (
                      vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-gm-soft/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-10 rounded-lg overflow-hidden bg-gm-soft relative shrink-0 border border-gm-line group">
                                <Image
                                  src={v.imageUrl || '/images/hero.jpeg'}
                                  alt={v.model}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {Array.isArray(v.images) && v.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-mono px-1 rounded-tl flex items-center gap-0.5">
                                    📷{v.images.length}
                                  </span>
                                )}
                              </div>
                              <div>
                                <b className="text-gm-navy font-bold block">{v.brand} {v.model}</b>
                                <span className="text-gm-muted text-[11px]">{v.variant || v.colour} ({v.year})</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              v.category === 'ELECTRIC' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              v.category === 'PRE_OWNED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {v.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 text-gm-navy">
                            <span className="block font-medium">{v.fuel} • {v.transmission}</span>
                            <span className="text-gm-muted text-[11px]">{v.km} KM {v.engineCC ? `• ${v.engineCC}cc` : ''}</span>
                          </td>
                          <td className="p-3.5">
                            <b className="text-gm-navy font-black text-sm block">{formatCurrency(v.price)}</b>
                            {v.offerPrice && (
                              <span className="text-[10px] text-gm-red font-bold block">
                                Offer: {formatCurrency(v.offerPrice)}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(v.stockStatus)}`}>
                              {v.stockStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleTogglePublish(v.id, v.published)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                v.published
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {v.published ? 'Live' : 'Hidden'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(v)}
                                className="p-1.5 rounded-lg border border-gm-line hover:border-gm-navy text-gm-navy bg-white hover:bg-gm-soft transition-colors"
                                title={isGlobalAdmin ? 'Edit Vehicle' : 'Request Edit (Requires Admin Approval)'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(v.id, `${v.brand} ${v.model}`)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors"
                                title={isGlobalAdmin ? 'Delete Vehicle' : 'Request Delete (Requires Admin Approval)'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY APPROVAL REQUESTS */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-4">
            {/* Status Filter */}
            <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-gm-red" />
                <div>
                  <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                    Inventory Change Requests
                  </h3>
                  <span className="text-[11px] text-gm-muted">
                    {isGlobalAdmin
                      ? 'Review and approve/reject inventory updates submitted by staff'
                      : 'Track the status of your submitted vehicle requests'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                      requestStatusFilter === st
                        ? 'bg-gm-navy text-white'
                        : 'bg-gm-soft text-gm-navy hover:bg-gm-line/50 border border-gm-line'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
              {inventoryRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gm-muted border border-gm-line shadow-xs">
                  No {requestStatusFilter.toLowerCase()} inventory requests found.
                </div>
              ) : (
                inventoryRequests.map((req) => {
                  let payload: any = {};
                  try {
                    payload = req.payload ? JSON.parse(req.payload) : {};
                  } catch {}

                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            req.requestType === 'ADD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            req.requestType === 'EDIT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {req.requestType} VEHICLE
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                            req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {req.status}
                          </span>

                          <span className="text-[11px] text-gm-muted">
                            Submitted {formatDate(req.createdAt)}
                          </span>
                        </div>

                        <div>
                          <b className="text-sm font-black text-gm-navy block">{req.summary}</b>
                          <p className="text-xs text-gm-muted mt-0.5">
                            Requested by: <b className="text-gm-navy">{req.requestedBy?.name}</b> ({req.requestedBy?.role?.name || 'Staff'}) • {req.requestedBy?.email}
                          </p>
                        </div>

                        {/* Request specifics */}
                        <div className="p-3 rounded-xl bg-gm-soft border border-gm-line/70 text-xs text-gm-navy grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-gm-muted text-[10px] block uppercase font-bold">Brand & Model</span>
                            <b>{payload.brand || '-'} {payload.model || '-'}</b>
                          </div>
                          <div>
                            <span className="text-gm-muted text-[10px] block uppercase font-bold">Category</span>
                            <b>{payload.category || '-'}</b>
                          </div>
                          <div>
                            <span className="text-gm-muted text-[10px] block uppercase font-bold">Price</span>
                            <b>{payload.price ? formatCurrency(payload.price) : '-'}</b>
                          </div>
                          <div>
                            <span className="text-gm-muted text-[10px] block uppercase font-bold">Stock Status</span>
                            <b>{payload.stockStatus || 'IN_STOCK'}</b>
                          </div>
                        </div>

                        {/* Request Photo Previews */}
                        {((Array.isArray(payload.images) && payload.images.length > 0) || payload.imageUrl) && (
                          <div className="flex items-center gap-2 overflow-x-auto py-1">
                            <span className="text-[10px] font-bold text-gm-muted uppercase shrink-0">Attached Photos:</span>
                            {(Array.isArray(payload.images) && payload.images.length > 0
                              ? payload.images
                              : [{ url: payload.imageUrl }]
                            ).slice(0, 6).map((imgObj: any, pIdx: number) => {
                              const pUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url;
                              return pUrl ? (
                                <div key={pIdx} className="relative w-14 h-10 rounded-lg overflow-hidden border border-gm-line bg-gm-soft shrink-0">
                                  <Image src={pUrl} alt="Preview" fill className="object-cover" unoptimized />
                                  {pIdx === 0 && (
                                    <span className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-br">Cover</span>
                                  )}
                                </div>
                              ) : null;
                            })}
                            {Array.isArray(payload.images) && payload.images.length > 6 && (
                              <span className="text-[10px] font-bold text-gm-muted">+{payload.images.length - 6} more</span>
                            )}
                          </div>
                        )}

                        {req.rejectionReason && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                            <b>Rejection Reason:</b> {req.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Admin Action Buttons */}
                      {req.status === 'PENDING' && isGlobalAdmin && (
                        <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l md:pl-4 border-gm-line pt-3 md:pt-0">
                          <button
                            onClick={() => handleProcessRequest(req.id, 'APPROVE')}
                            disabled={processingReqId === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors w-full justify-center"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{processingReqId === req.id ? 'Processing...' : 'Approve & Apply'}</span>
                          </button>

                          <button
                            onClick={() => handleProcessRequest(req.id, 'REJECT')}
                            disabled={processingReqId === req.id}
                            className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors w-full justify-center"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Vehicle */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gm-line shadow-2xl my-6 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line">
                <div>
                  <h3 className="text-xl font-black text-gm-navy">
                    {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle to Inventory'}
                  </h3>
                  {!isGlobalAdmin && (
                    <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                      ⚠️ Note: This change requires Administrator approval before publishing to live inventory.
                    </span>
                  )}
                </div>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold text-lg">✕</button>
              </div>

              {!isGlobalAdmin && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <b>Approval Workflow:</b> When you submit, a request is sent to the Admin. The inventory will be updated immediately once approved.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Brand *</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                      required
                    >
                      {VEHICLE_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Model Name *</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Splendor+ XTEC"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Variant</label>
                    <input
                      type="text"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="e.g. Disc Bluetooth"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="NEW">New Two-Wheelers</option>
                      <option value="PRE_OWNED">Certified Pre-Owned</option>
                      <option value="ELECTRIC">Electric (EV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Ex-Showroom Price (₹) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="85000"
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
                      placeholder="81999"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Transmission</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="EV Direct">EV Direct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Stock Status</label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      <option value="IN_STOCK">IN STOCK</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="SOLD">SOLD</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <VehicleMultiImageUpload
                    images={images}
                    onChange={(newImages) => {
                      setImages(newImages);
                      if (newImages.length > 0) {
                        setImageUrl(newImages[0]);
                      }
                    }}
                    label="Vehicle Image Gallery (Multiple Images)"
                    helperText="Upload multiple photos from your mobile phone gallery or computer (exterior, interior, odometer, angles). First photo is the Primary Cover."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="e.g. Digital Speedometer, LED Headlamp, Front Disc"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Description & Overview</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed vehicle description for customers..."
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                  />
                </div>

                <div className="pt-3 flex gap-2">
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
                    className="w-2/3 bg-gm-red hover:bg-gm-red-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting
                      ? 'Submitting...'
                      : isGlobalAdmin
                      ? (editingVehicle ? 'Update Vehicle Directly' : 'Save to Live Inventory')
                      : 'Submit for Admin Approval'}
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
