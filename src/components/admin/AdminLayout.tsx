'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AuthUser } from '@/lib/auth';
import './admin-mobile.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore sidebar state from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gm-admin-sidebar-collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gm-admin-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error(err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gm-soft flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gm-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gm-navy uppercase tracking-wider">
            Loading Gurudev Motors Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="business-portal min-h-screen bg-[#F8FAFC] print:bg-white print:min-h-0">
      <div className="print:hidden">
        <AdminSidebar
          user={user}
          mobileOpen={mobileSidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      <div
        className={`print:pl-0 flex flex-col min-h-screen print:min-h-0 transition-[padding] duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-64'
        }`}
      >
        <div className="print:hidden">
          <AdminHeader
            user={user}
            mobileSidebarOpen={mobileSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onToggleSidebar={toggleSidebar}
          />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
