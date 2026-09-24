'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, LogOut, CheckCircle2, Shield, ExternalLink } from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface AdminHeaderProps {
  user: AuthUser;
  onOpenMobileSidebar: () => void;
}

export default function AdminHeader({ user, onOpenMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

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
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-gm-navy hover:bg-gm-soft rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gm-muted">
          <span>Gurudev Motors</span>
          <span>/</span>
          <span className="text-gm-navy font-black uppercase tracking-wider">{user.roleName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
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

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl text-gm-muted hover:text-gm-navy hover:bg-gm-soft relative transition-colors"
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
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gm-line p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-3">
                <span className="text-xs font-black text-gm-navy uppercase tracking-wider">
                  Internal Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-gm-red hover:underline"
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
          className="p-2 text-gm-muted hover:text-gm-red hover:bg-gm-soft rounded-xl transition-colors ml-1"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
