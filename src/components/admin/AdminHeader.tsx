'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Bell,
  LogOut,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  X,
} from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface AdminHeaderProps {
  user: AuthUser;
  mobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function AdminHeader({
  user,
  mobileSidebarOpen,
  onOpenMobileSidebar,
  sidebarCollapsed = false,
  onToggleSidebar,
}: AdminHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // PWA Install State for Staff
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  // Close notification panel when clicking outside or pressing Escape
  useEffect(() => {
    if (!showNotifs) return;

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifs(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifs]);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadNotifs();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gm-line px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open business navigation"
          aria-expanded={mobileSidebarOpen}
          aria-controls="business-sidebar"
          className="p-2 text-gm-navy hover:bg-gm-soft rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle: Full Screen <-> Show Menu */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Show sidebar menu' : 'Hide sidebar menu (Full Screen)'}
            title={sidebarCollapsed ? 'Show sidebar menu' : 'Hide sidebar menu (Full Screen)'}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              sidebarCollapsed
                ? 'bg-gm-red text-white border-gm-red hover:bg-gm-red-dark shadow-sm'
                : 'border-gm-line text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            {sidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-white" />
                <span className="text-[11px] font-black uppercase tracking-wider">Show Menu</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider">Full Screen</span>
              </>
            )}
          </button>
        )}

        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="h-9 w-auto relative flex items-center">
            <Image
              src="/images/logo.jpeg"
              alt="Gurudev Motors Logo"
              width={120}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain rounded-md"
              priority
            />
          </div>
          <div className="hidden sm:block border-l border-gm-line pl-2.5">
            <span className="text-[10px] font-bold text-gm-muted uppercase tracking-wider block">Gurudev Motors</span>
            <span className="text-xs font-black text-gm-navy uppercase tracking-wider block leading-none">
              {user.roleName || 'Portal'}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Install / Download App for Staff */}
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 text-xs font-bold bg-gm-red/10 text-gm-red hover:bg-gm-red hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-gm-red/25 transition-all cursor-pointer shadow-xs"
          title="Install website as an App on PC or Mobile"
        >
          <Download className="w-3.5 h-3.5 text-gm-red group-hover:text-white" />
          <span className="hidden sm:inline font-black">
            {isInstalled ? 'App Ready' : 'Download App'}
          </span>
          <span className="sm:hidden font-black">App</span>
        </button>

        {/* Visit public site link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1 text-xs font-bold text-gm-muted hover:text-gm-navy px-3 py-1.5 rounded-lg border border-gm-line hover:bg-gm-soft transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Notifications with click-outside listener */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
            aria-expanded={showNotifs}
            aria-controls="business-notifications"
            className="p-2 rounded-xl text-gm-muted hover:text-gm-navy hover:bg-gm-soft relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gm-red text-white text-[9px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              id="business-notifications"
              className="business-notifications absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gm-line p-4 z-50 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-3">
                <span className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Internal Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-gm-red hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        n.isRead
                          ? 'bg-gm-soft/40 border-gm-line text-gm-muted'
                          : 'bg-blue-50/60 border-blue-200 text-gm-navy font-medium'
                      }`}
                    >
                      <b className="block text-gm-navy mb-0.5">{n.title}</b>
                      <p className="text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gm-muted">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User tag */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gm-line">
          <div className="text-right">
            <span className="text-xs font-black text-gm-navy block leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] font-bold text-gm-red uppercase tracking-wider block">
              {user.roleName}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-gm-muted hover:text-gm-red hover:bg-gm-soft rounded-xl transition-colors ml-1 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Staff PWA Install Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-gm-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gm-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gm-red/10 flex items-center justify-center text-gm-red">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gm-navy uppercase tracking-wider">
                    Download Gurudev Motors App
                  </h3>
                  <span className="text-[10px] text-gm-muted block">Direct install on Phone or Computer</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="text-gm-muted hover:text-gm-navy p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-gm-line rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-gm-navy font-bold">
                  <Laptop className="w-4 h-4 text-gm-red" />
                  <span>On Computer (Chrome or Edge):</span>
                </div>
                <p className="text-gm-muted text-[11px] leading-relaxed">
                  Click the <b>Install (⤓)</b> icon located in your browser address bar on the top right, or click browser menu (⋮) → <b>&quot;Install Gurudev Motors&quot;</b>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-gm-line rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-gm-navy font-bold">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>On Android Phone:</span>
                </div>
                <p className="text-gm-muted text-[11px] leading-relaxed">
                  Tap Chrome menu (<b>⋮</b>) on top right → select <b>&quot;Install App&quot;</b> or <b>&quot;Add to Home screen&quot;</b>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-gm-line rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-gm-navy font-bold">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>On iPhone / iPad (Safari):</span>
                </div>
                <p className="text-gm-muted text-[11px] leading-relaxed">
                  Tap the <b>Share button (↑)</b> at the bottom bar → scroll down and tap <b>&quot;Add to Home Screen&quot;</b>.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
