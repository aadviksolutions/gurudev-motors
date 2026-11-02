'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#031330] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gm-red/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        {/* Actual Gurudev Motors Logo (Preserving white background cleanly in intentional premium container) */}
        <div className="inline-flex items-center justify-center bg-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 mb-4 mx-auto">
          <div className="w-[190px] sm:w-[240px] max-w-[260px] flex items-center justify-center">
            <Image
              src="/images/logo.jpeg"
              alt="Gurudev Motors"
              width={260}
              height={70}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Gurudev Motors
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest font-extrabold text-slate-400">
          Dealership Management Portal • Raipur
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="staff-email" className="block text-xs font-bold text-gm-navy mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@gurudevmotors.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gm-line text-base sm:text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-xs font-bold text-gm-navy mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gm-line text-base sm:text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gm-navy hover:bg-gm-navy-dark text-white font-black text-xs py-3.5 rounded-xl shadow transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gm-muted hover:text-gm-navy font-bold">
              ← Return to Gurudev Motors Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
