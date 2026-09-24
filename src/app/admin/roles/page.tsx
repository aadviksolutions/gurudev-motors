'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Save, Lock, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { MODULES, PERMISSION_ACTIONS } from '@/lib/constants';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New role modal
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Matrix state: module -> action -> boolean
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
        if (!selectedRole && data.roles.length > 0) {
          selectRole(data.roles[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const selectRole = (role: any) => {
    setSelectedRole(role);
    setSaveSuccess(false);

    // Build matrix from role permissions
    const m: Record<string, Record<string, boolean>> = {};
    MODULES.forEach((mod) => {
      m[mod.key] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        assign: false,
        approve: false,
        export: false,
      };
    });

    if (role.permissions) {
      role.permissions.forEach((p: any) => {
        if (m[p.module]) {
          m[p.module] = {
            view: Boolean(p.view),
            create: Boolean(p.create),
            edit: Boolean(p.edit),
            delete: Boolean(p.delete),
            assign: Boolean(p.assign),
            approve: Boolean(p.approve),
            export: Boolean(p.export),
          };
        }
      });
    }

    setMatrix(m);
  };

  const handleToggle = (moduleKey: string, action: string) => {
    if (selectedRole?.code === 'MAIN_ADMIN') return; // Cannot disable main admin permissions
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setSaveSuccess(false);

    const permissionsPayload = Object.entries(matrix).map(([mod, actions]) => ({
      module: mod,
      ...actions,
    }));

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole.id,
          permissions: permissionsPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleCode) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          code: newRoleCode,
          description: newRoleDesc,
          permissions: MODULES.map((m) => ({
            module: m.key,
            view: true,
            create: false,
            edit: false,
            delete: false,
            assign: false,
            approve: false,
            export: false,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewRoleModal(false);
        setNewRoleName('');
        setNewRoleCode('');
        setNewRoleDesc('');
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Roles & Granular Permissions
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Enforce server-side security by configuring granular VIEW, CREATE, EDIT, DELETE, ASSIGN, APPROVE, and EXPORT access per module.
            </p>
          </div>
          <button
            onClick={() => setNewRoleModal(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        {/* Roles Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRole(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                selectedRole?.id === r.id
                  ? 'bg-gm-navy text-white shadow-sm'
                  : 'bg-white text-gm-navy hover:bg-gm-soft border border-gm-line'
              }`}
            >
              <span>{r.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {r._count?.users || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Permission Matrix Grid */}
        {selectedRole && (
          <div className="bg-white rounded-2xl border border-gm-line shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gm-line">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gm-navy">
                    {selectedRole.name} Permissions Matrix
                  </h3>
                  {selectedRole.code === 'MAIN_ADMIN' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 text-gm-red border border-red-200">
                      SUPER ADMIN (ALL PERMISSIONS)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gm-muted mt-0.5">
                  {selectedRole.description || 'Configurable module authorization settings'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Permissions Saved
                  </span>
                )}
                {selectedRole.code !== 'MAIN_ADMIN' && (
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="bg-gm-navy hover:bg-gm-navy-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save Permissions'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gm-soft/70 text-gm-muted font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">System Module</th>
                    {PERMISSION_ACTIONS.map((act) => (
                      <th key={act} className="p-3.5 text-center">
                        {act}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line/60">
                  {MODULES.map((mod) => (
                    <tr key={mod.key} className="hover:bg-gm-soft/30 transition-colors">
                      <td className="p-3.5 font-bold text-gm-navy">
                        {mod.label}
                      </td>
                      {PERMISSION_ACTIONS.map((act) => {
                        const isGranted =
                          selectedRole.code === 'MAIN_ADMIN' || Boolean(matrix[mod.key]?.[act]);
                        return (
                          <td key={act} className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggle(mod.key, act)}
                              disabled={selectedRole.code === 'MAIN_ADMIN'}
                              className={`w-6 h-6 rounded-lg border transition-colors inline-flex items-center justify-center ${
                                isGranted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white border-gm-line text-transparent hover:border-gm-navy'
                              } ${selectedRole.code === 'MAIN_ADMIN' ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Role Modal */}
        {newRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Create Custom Role</h3>
                <button onClick={() => setNewRoleModal(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateRole} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Role Display Name *</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Workshop Supervisor"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Unique Role Code *</label>
                  <input
                    type="text"
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value)}
                    placeholder="e.g. WORKSHOP_SUPERVISOR"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Description</label>
                  <textarea
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Define responsibilities..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRoleModal(false)}
                    className="w-1/3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2 rounded-xl shadow transition-colors"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
