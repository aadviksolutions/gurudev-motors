'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Compass,
  CalendarCheck,
  BadgeDollarSign,
  Wrench,
  Receipt,
  BarChart3,
  UserCheck,
  ShieldAlert,
  Globe,
  Camera,
  Tag,
  History,
  Settings,
  ChevronRight,
  LogOut,
  X,
  RefreshCw,
  Landmark,
  PanelLeftClose,
} from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface AdminSidebarProps {
  user: AuthUser;
  mobileOpen: boolean;
  collapsed?: boolean;
  onCloseMobile: () => void;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  user,
  mobileOpen,
  collapsed = false,
  onCloseMobile,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isMainAdmin = user.roleCode === 'MAIN_ADMIN' || user.roleCode === 'SUPER_ADMIN';

  // Check permission helper
  const canAccess = (module: string) => {
    if (isMainAdmin) return true;
    return Boolean(user.permissions[module]?.view);
  };

  const menuSections = [
    {
      title: 'OPERATIONS & CRM',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: 'dashboard' },
        { label: 'Leads CRM', href: '/admin/leads', icon: Users, module: 'leads' },
        { label: 'Exchange Requests', href: '/admin/exchange', icon: RefreshCw, module: 'exchange' },
        { label: 'Customers', href: '/admin/customers', icon: UserCheck, module: 'customers' },
        { label: 'Vehicles Inventory', href: '/admin/vehicles', icon: Compass, module: 'vehicles' },
        { label: 'Bookings & Rides', href: '/admin/bookings', icon: CalendarCheck, module: 'bookings' },
        { label: 'Sales & Delivery', href: '/admin/sales', icon: BadgeDollarSign, module: 'sales' },
      ],
    },
    {
      title: 'WORKSHOP & FINANCE',
      items: [
        { label: 'Service & Job Cards', href: '/admin/service', icon: Wrench, module: 'service' },
        { label: 'Finance Applications', href: '/admin/finance', icon: Landmark, module: 'finance' },
        { label: 'Accounts & Invoices', href: '/admin/accounts', icon: Receipt, module: 'accounts' },
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, module: 'reports' },
      ],
    },
    {
      title: 'MANAGEMENT & CMS',
      items: [
        { label: 'Employees & Staff', href: '/admin/employees', icon: Users, module: 'employees' },
        { label: 'Roles & Permissions', href: '/admin/roles', icon: ShieldAlert, module: 'roles' },
        { label: 'Website CMS', href: '/admin/content', icon: Globe, module: 'content' },
        { label: 'Gallery', href: '/admin/gallery', icon: Camera, module: 'content' },
        { label: 'Offers & Promos', href: '/admin/offers', icon: Tag, module: 'content' },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: History, module: 'audit_logs' },
        { label: 'Settings', href: '/admin/settings', icon: Settings, module: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="business-sidebar"
        aria-label="Business navigation"
        data-open={mobileOpen}
        data-collapsed={collapsed}
        className={`business-sidebar fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#031330] text-slate-300 border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          collapsed
            ? '-translate-x-full lg:-translate-x-full opacity-0 pointer-events-none'
            : 'translate-x-0 lg:translate-x-0 opacity-100'
        } ${mobileOpen ? '!translate-x-0 !opacity-100 !pointer-events-auto' : ''}`}
      >
        <div>
          {/* Logo / Brand header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="h-8 w-auto px-1.5 rounded-lg bg-white flex items-center justify-center shadow">
                <Image
                  src="/images/logo.jpeg"
                  alt="Gurudev Motors"
                  width={90}
                  height={30}
                  className="h-6 w-auto object-contain rounded"
                  priority
                />
              </span>
              <div>
                <b className="text-sm font-black text-white tracking-tight block">
                  GURUDEV MOTORS
                </b>
                <span className="text-[9px] font-bold text-gm-red uppercase tracking-wider block">
                  Business Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop collapse button */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Hide sidebar menu (Full Screen)"
                  title="Hide sidebar menu (Full Screen)"
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}

              {/* Mobile close button */}
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close business navigation"
                className="p-1 text-slate-400 hover:text-white lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav links */}
          <div className="business-sidebar-links p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuSections.map((section, sIdx) => {
              const visibleItems = section.items.filter((item) => canAccess(item.module));
              if (visibleItems.length === 0) return null;

              return (
                <div key={sIdx}>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onCloseMobile}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-gm-red text-white shadow-sm'
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info with user quick info */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gm-red/20 text-gm-red font-black text-xs flex items-center justify-center border border-gm-red/30">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white truncate block">
                {user.name}
              </span>
              <span className="text-[10px] text-gm-muted uppercase font-bold tracking-wide truncate block">
                {user.roleName}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
