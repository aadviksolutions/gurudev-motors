'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  ImageIcon,
  Loader2,
  CheckCircle2,
  Smartphone,
  Laptop,
  Camera,
  Video,
  CameraOff,
  RotateCw,
} from 'lucide-react';

interface VehicleMultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
}

export default function VehicleMultiImageUpload({
  images = [],
  onChange,
  label = 'Vehicle Image Gallery (Multiple Images)',
  helperText = 'Upload multiple vehicle photos from your phone gallery or computer (exterior, interior, odometer, angles). First image is the Primary Cover.',
}: VehicleMultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [webcamLoading, setWebcamLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startWebcam = async (mode: 'environment' | 'user' = facingMode) => {
    setError('');
    setShowWebcamModal(true);
    setWebcamLoading(true);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('In-browser camera stream not supported. Opening system camera.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.warn('Webcam start error:', err);
      setShowWebcamModal(false);
      // Fallback directly to native device camera input
      cameraInputRef.current?.click();
    } finally {
      setWebcamLoading(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowWebcamModal(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startWebcam(nextMode);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const captureWebcamSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], `vehicle-snap-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopWebcam();
        await handleMultipleFiles([file]);
      },
      'image/jpeg',
      0.92
    );
  };

  // Handle uploading multiple files from device (computer or mobile gallery)
  const handleMultipleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setError('');
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a supported image format.`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 15MB file limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} from your device...`);

    try {
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append('files', file);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload images');
      }

      const newUrls: string[] = [];
      if (Array.isArray(data.files) && data.files.length > 0) {
        for (const item of data.files) {
          if (item?.url) newUrls.push(item.url);
        }
      } else if (data.url) {
        newUrls.push(data.url);
      }

      if (newUrls.length > 0) {
        const combined = [...images, ...newUrls];
        onChange(combined);
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading photos from device');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle replacing a specific image
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file to replace.');
      return;
    }

    setUploading(true);
    setUploadProgress('Replacing photo...');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to replace image');
      }

      const updated = [...images];
      updated[replacingIndex] = data.url;
      onChange(updated);
    } catch (err: any) {
      setError(err.message || 'Error replacing photo');
    } finally {
      setUploading(false);
      setUploadProgress('');
      setReplacingIndex(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Set as Primary (moves to index 0)
  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  };

  // Move image left
  const moveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Move image right
  const moveRight = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Add via URL
  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlField(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-gm-line">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gm-line pb-2.5">
        <div>
          <label className="text-xs font-black text-gm-navy uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gm-red" />
            <span>{label}</span>
            <span className="text-[11px] font-bold text-gm-muted lowercase bg-gm-soft px-2 py-0.5 rounded-full">
              {images.length} {images.length === 1 ? 'photo' : 'photos'}
            </span>
          </label>
          <p className="text-[11px] text-gm-muted mt-0.5">{helperText}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Capture directly via phone or tablet camera"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Photo (Camera)</span>
          </button>

          <button
            type="button"
            onClick={() => startWebcam()}
            disabled={uploading}
            className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            title="Open live camera viewfinder"
          >
            <Video className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gm-navy hover:bg-gm-navy/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gm-red" />
            <span>Upload from Gallery / PC</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlField(!showUrlField)}
            className="border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{showUrlField ? 'Close URL' : 'Add URL'}</span>
          </button>
        </div>
      </div>

      {/* Direct URL input if toggled */}
      {showUrlField && (
        <div className="flex gap-2 p-2 bg-gm-soft rounded-xl border border-gm-line">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image link (e.g. /images/hero.jpeg or https://...)"
            className="flex-1 px-3 py-1.5 rounded-lg border border-gm-line text-xs font-mono bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={addUrl}
            className="bg-gm-red text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gm-red-dark transition-colors"
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Uploading Progress Notification */}
      {uploading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-800 text-xs font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>{uploadProgress || 'Uploading image(s) from device...'}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-1.5">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone (Visible if no photos yet or as quick dropzone) */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="cursor-pointer border-2 border-dashed border-gm-line hover:border-gm-navy rounded-2xl p-8 transition-colors bg-gm-soft/30 hover:bg-gm-soft flex flex-col items-center justify-center text-center group"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gm-line flex items-center justify-center text-gm-navy group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5 text-gm-red" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gm-line flex items-center justify-center text-gm-navy group-hover:scale-105 transition-transform">
              <Laptop className="w-5 h-5 text-gm-navy" />
            </div>
          </div>
          <p className="text-xs font-black text-gm-navy">
            Tap / Click to choose photos from Mobile Gallery or Computer
          </p>
          <p className="text-[11px] text-gm-muted mt-1 max-w-sm">
            Select multiple photos at once (Exterior, Front, Back, Cockpit, Engine, Odometer). Drag & Drop supported.
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="px-3.5 py-1.5 bg-gm-red text-white text-[11px] font-bold rounded-lg hover:bg-gm-red-dark transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo (Camera)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-3.5 py-1.5 bg-gm-navy text-white text-[11px] font-bold rounded-lg hover:bg-gm-navy/90 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Choose from Gallery / PC</span>
            </button>
          </div>
        </div>
      ) : (
        /* Image Cards Grid */
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${url}-${index}`}
                  className={`relative rounded-xl border-2 overflow-hidden bg-gm-soft group transition-all flex flex-col ${
                    isCover ? 'border-amber-400 ring-2 ring-amber-300/40 shadow-xs' : 'border-gm-line hover:border-gm-navy'
                  }`}
                >
                  {/* Photo Display */}
                  <div className="relative aspect-[4/3] w-full bg-slate-900/5">
                    {/* Fallback to standard img if not domain-whitelisted, but Next/Image with unoptimized handles all */}
                    <Image
                      src={url}
                      alt={`Vehicle angle ${index + 1}`}
                      fill
                      unoptimized={url.startsWith('data:') || url.startsWith('/uploads/') || url.startsWith('http')}
                      className="object-cover"
                    />

                    {/* Primary / Cover Badge */}
                    {isCover ? (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-1 tracking-wider">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Cover Photo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsPrimary(index)}
                        title="Set as Cover Photo"
                        className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Set Cover</span>
                      </button>
                    )}

                    {/* Delete button (Top Right) */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md shadow transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions Bar under each photo */}
                  <div className="p-1.5 bg-white border-t border-gm-line flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveLeft(index)}
                        title="Move photo left"
                        className={`p-1 rounded hover:bg-gm-soft ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gm-navy'}`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-[10px] font-bold text-gm-muted px-1">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => moveRight(index)}
                        title="Move photo right"
                        className={`p-1 rounded hover:bg-gm-soft ${index === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-gm-navy'}`}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIndex(index);
                        replaceFileInputRef.current?.click();
                      }}
                      className="text-[10px] font-bold text-gm-navy hover:text-gm-red px-1.5 py-0.5 rounded hover:bg-gm-soft flex items-center gap-1"
                      title="Replace with another photo from device"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add via Camera Tile */}
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gm-line hover:border-gm-red rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-center p-3 bg-red-50/30 hover:bg-red-50/70 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-gm-line flex items-center justify-center text-gm-navy mb-1 group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-gm-red" />
              </div>
              <span className="text-[11px] font-bold text-gm-navy">+ Take Photo</span>
              <span className="text-[9px] text-gm-muted">Through camera</span>
            </div>

            {/* Quick Add More Tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gm-line hover:border-gm-navy rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-center p-3 bg-gm-soft/40 hover:bg-gm-soft transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-gm-line flex items-center justify-center text-gm-navy mb-1 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-gm-navy" />
              </div>
              <span className="text-[11px] font-bold text-gm-navy">+ Gallery / PC</span>
              <span className="text-[9px] text-gm-muted">Multiple files</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gm-muted pt-1">
            <span>Tip: Tap "+ Take Photo" to use your mobile camera or "+ Gallery / PC" to choose existing photos.</span>
            <span className="font-semibold text-gm-navy">Total Photos: {images.length}</span>
          </div>
        </div>
      )}

      {/* Hidden Multi-File Input for Device Gallery / Computer Explorer */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) handleMultipleFiles(e.target.files);
        }}
        className="hidden"
      />

      {/* Hidden Camera Input for Taking Photos directly from device camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultipleFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Hidden Single-File Input for Replacing a specific image */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Hidden Canvas for Live Camera Frame Grabs */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Camera Viewfinder Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full border border-gm-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gm-line">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gm-red" />
                <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                  Live Camera Viewfinder
                </h3>
              </div>
              <button
                type="button"
                onClick={stopWebcam}
                className="text-gm-muted hover:text-gm-navy p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {webcamLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-black/60 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-gm-red" />
                  <span className="text-xs font-bold">Accessing camera...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gm-line hover:border-gm-navy text-xs font-bold text-gm-navy flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-muted hover:text-gm-navy transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={captureWebcamSnapshot}
                  className="flex-1 sm:flex-none bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
