'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, Filter, Search } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/audit-logs?module=${moduleFilter}`);
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const modules = ['ALL', 'LEADS', 'VEHICLES', 'SERVICE', 'SALES', 'ACCOUNTS', 'ROLES', 'USERS', 'CONTENT'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gm-navy tracking-tight">
            Security & System Audit Logs
          </h1>
          <p className="text-xs text-gm-muted mt-0.5">
            Immutable tracking trail of every create, update, delete, role modification and status transition across all dealership modules.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                moduleFilter === m
                  ? 'bg-gm-navy text-white shadow-xs'
                  : 'bg-white text-gm-navy hover:bg-gm-soft border border-gm-line'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Staff User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Module</th>
                  <th className="p-3.5">Record Identifier</th>
                  <th className="p-3.5">Change Summary / Values</th>
                  <th className="p-3.5 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gm-muted">Loading audit trail...</td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5 text-gm-muted text-[11px] whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="p-3.5">
                        <b className="text-gm-navy block">{log.userName}</b>
                        <span className="text-gm-muted text-[10px]">{log.userEmail}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-800' :
                          log.action === 'UPDATE' ? 'bg-blue-50 text-blue-800' :
                          log.action === 'DELETE' ? 'bg-red-50 text-red-800' :
                          'bg-gm-soft text-gm-navy'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gm-navy font-mono text-[11px]">
                        {log.module}
                      </td>
                      <td className="p-3.5 font-mono text-gm-navy font-bold">
                        {log.recordId || '-'}
                      </td>
                      <td className="p-3.5 text-gm-navy text-xs max-w-xs">
                        {log.oldValue && (
                          <span className="text-gm-muted block text-[10px]">
                            Old: {log.oldValue}
                          </span>
                        )}
                        <span className="font-semibold block">
                          {log.newValue || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-gm-muted text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gm-muted">No audit logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
