'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@gurudevmotors.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Main Admin', email: 'admin@gurudevmotors.com', pass: 'Admin@123', role: 'Full Control' },
    { label: 'Sales Manager', email: 'sales.manager@gurudevmotors.com', pass: 'Sales@123', role: 'Sales & CRM' },
    { label: 'Sales Executive', email: 'rahul.sales@gurudevmotors.com', pass: 'Sales@123', role: 'Assigned Leads' },
    { label: 'Accounts User', email: 'accounts@gurudevmotors.com', pass: 'Accounts@123', role: 'Billing & GST' },
    { label: 'Service Manager', email: 'service.manager@gurudevmotors.com', pass: 'Service@123', role: 'Workshop & Jobs' },
  ];

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

  const setDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#031330] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gm-red/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gm-red text-white font-black text-2xl mb-3 shadow-lg shadow-gm-red/30">
          GM
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
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
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@gurudevmotors.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-navy mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gm-line text-sm focus:outline-none focus:border-gm-navy focus:ring-1 focus:ring-gm-navy"
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

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-gm-line">
            <span className="text-[10px] font-black uppercase tracking-wider text-gm-muted block mb-3 text-center">
              Quick Demo Staff Accounts (Click to test RBAC)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => setDemo(acc.email, acc.pass)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    email === acc.email
                      ? 'border-gm-red bg-red-50/50 text-gm-red font-bold'
                      : 'border-gm-line hover:border-gm-navy text-gm-navy hover:bg-gm-soft'
                  }`}
                >
                  <b className="block text-[11px] leading-tight">{acc.label}</b>
                  <span className="text-[10px] text-gm-muted block">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

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
