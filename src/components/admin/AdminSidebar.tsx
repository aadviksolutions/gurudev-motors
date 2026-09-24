'use client';

import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface AdminSidebarProps {
  user: AuthUser;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ user, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const isMainAdmin = user.roleCode === 'MAIN_ADMIN';

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#031330] text-slate-300 border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gm-red text-white font-black flex items-center justify-center text-sm shadow">
                GM
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
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
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
