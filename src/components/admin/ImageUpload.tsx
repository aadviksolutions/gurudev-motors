'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  aspectRatio = 'video',
  helperText = 'Supports PNG, JPG, JPEG, WEBP, SVG up to 10MB',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'h-48';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gm-navy">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-gm-red hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Enter URL directly'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/hero.jpeg or https://..."
            className="w-full px-3 py-1.5 rounded-xl border border-gm-line text-xs font-mono"
          />
        </div>
      )}

      {value ? (
        <div className="relative rounded-2xl border-2 border-gm-line overflow-hidden bg-gm-soft group">
          <div className={`relative w-full ${aspectClass}`}>
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain p-2"
              unoptimized={value.startsWith('data:') || value.startsWith('/uploads/')}
            />
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gm-navy text-xs font-bold rounded-xl shadow hover:bg-gm-soft transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {success && (
            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
              <Check className="w-3 h-3" />
              <span>Uploaded!</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-gm-line hover:border-gm-navy rounded-2xl p-6 transition-colors bg-white hover:bg-gm-soft/30 flex flex-col items-center justify-center text-center group"
        >
          {uploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-8 h-8 text-gm-red animate-spin mb-2" />
              <p className="text-xs font-bold text-gm-navy">Uploading image to server...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-gm-soft group-hover:bg-gm-navy/5 flex items-center justify-center text-gm-navy mb-2 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gm-navy">
                Click to upload image <span className="font-normal text-gm-muted">or drag & drop</span>
              </p>
              <p className="text-[11px] text-gm-muted mt-0.5">{helperText}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
    </div>
  );
}

