'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  KeyRound,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Building2,
  Briefcase,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { MODULES, PERMISSION_ACTIONS } from '@/lib/constants';

type PermissionKey = 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'approve' | 'export';
type PermMatrix = Record<string, Record<PermissionKey, boolean>>;

function createEmptyMatrix(): PermMatrix {
  const m: PermMatrix = {};
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
  return m;
}

function buildMatrixFromRole(role: any): PermMatrix {
  const m = createEmptyMatrix();
  if (role?.permissions && Array.isArray(role.permissions)) {
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
  return m;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Create Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Gurudev@123');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [createMatrix, setCreateMatrix] = useState<PermMatrix>(createEmptyMatrix());
  const [showCreateRights, setShowCreateRights] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editMatrix, setEditMatrix] = useState<PermMatrix>(createEmptyMatrix());
  const [showEditRights, setShowEditRights] = useState(false);

  // Reset Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchEmployees = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [rRes, dRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/departments'),
      ]);
      const rData = await rRes.json();
      const dData = await dRes.json();
      if (rData.success) {
        setRoles(rData.roles);
        if (rData.roles.length > 0) {
          const first = rData.roles[0];
          setRoleId(first.id);
          setCreateMatrix(buildMatrixFromRole(first));
        }
      }
      if (dData.success) {
        setDepartments(dData.departments);
        if (dData.departments.length > 0) setDepartmentId(dData.departments[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleRoleChangeForCreate = (newRoleId: string) => {
    setRoleId(newRoleId);
    const selected = roles.find((r) => r.id === newRoleId);
    if (selected) {
      setCreateMatrix(buildMatrixFromRole(selected));
    }
  };

  const handleRoleChangeForEdit = (newRoleId: string) => {
    setEditRoleId(newRoleId);
    const selected = roles.find((r) => r.id === newRoleId);
    if (selected) {
      setEditMatrix(buildMatrixFromRole(selected));
    }
  };

  const toggleCreatePerm = (mod: string, action: PermissionKey) => {
    setCreateMatrix((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod]?.[action],
      },
    }));
  };

  const toggleEditPerm = (mod: string, action: PermissionKey) => {
    setEditMatrix((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod]?.[action],
      },
    }));
  };

  const setAllPermsInMatrix = (matrixSetter: React.Dispatch<React.SetStateAction<PermMatrix>>, value: boolean) => {
    matrixSetter(() => {
      const updated: PermMatrix = {};
      MODULES.forEach((mod) => {
        updated[mod.key] = {
          view: value,
          create: value,
          edit: value,
          delete: value,
          assign: value,
          approve: value,
          export: value,
        };
      });
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !roleId) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          roleId,
          departmentId: departmentId || null,
          active: true,
          customPermissions: createMatrix,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setShowCreateRights(false);
        fetchEmployees();
      } else {
        setErrorMsg(data.error || 'Failed to create employee');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (emp: any) => {
    setSelectedUser(emp);
    setEditName(emp.name);
    setEditPhone(emp.phone || '');
    setEditRoleId(emp.roleId);
    setEditDepartmentId(emp.departmentId || '');
    setEditActive(emp.active);
    setErrorMsg('');
    setShowEditRights(false);

    // Initialize edit matrix:
    // If employee has customPermissions stored, load it. Otherwise load from their role.
    let m = createEmptyMatrix();
    if (emp.customPermissions) {
      try {
        const parsed = typeof emp.customPermissions === 'string' ? JSON.parse(emp.customPermissions) : emp.customPermissions;
        MODULES.forEach((mod) => {
          m[mod.key] = {
            view: Boolean(parsed[mod.key]?.view),
            create: Boolean(parsed[mod.key]?.create),
            edit: Boolean(parsed[mod.key]?.edit),
            delete: Boolean(parsed[mod.key]?.delete),
            assign: Boolean(parsed[mod.key]?.assign),
            approve: Boolean(parsed[mod.key]?.approve),
            export: Boolean(parsed[mod.key]?.export),
          };
        });
      } catch {
        m = buildMatrixFromRole(emp.role);
      }
    } else {
      const roleObj = roles.find((r) => r.id === emp.roleId) || emp.role;
      m = buildMatrixFromRole(roleObj);
    }
    setEditMatrix(m);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          name: editName,
          phone: editPhone,
          roleId: editRoleId,
          departmentId: editDepartmentId || null,
          active: editActive,
          customPermissions: editMatrix,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        fetchEmployees();
      } else {
        setErrorMsg(data.error || 'Failed to update employee');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const openPasswordModal = (emp: any) => {
    setSelectedUser(emp);
    setNewPassword('');
    setPasswordSuccess('');
    setErrorMsg('');
    setPasswordModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('Password has been securely reset successfully.');
        setTimeout(() => {
          setPasswordModalOpen(false);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (emp: any) => {
    const nextStatus = !emp.active;
    const confirmMsg = nextStatus
      ? `Activate ${emp.name}'s account?`
      : `Deactivate ${emp.name}'s account? They will not be able to log in.`;
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: emp.id,
          active: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error || 'Failed to toggle account status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeStyle = (code: string) => {
    switch (code) {
      case 'MAIN_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SALES_MANAGER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SALES_EXECUTIVE':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SERVICE_MANAGER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SERVICE_EXECUTIVE':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'ACCOUNTS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-gm-red" />
              Centralized User & Access Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Manage workforce accounts, assign base roles, and configure individual module rights for each user.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmployees}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setErrorMsg('');
                setShowCreateRights(false);
                setCreateModalOpen(true);
              }}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
            />
            <Search className="w-4 h-4 text-gm-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="MAIN_ADMIN">Admin</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="SALES_EXECUTIVE">Sales Executive</option>
              <option value="SERVICE_MANAGER">Service Manager</option>
              <option value="SERVICE_EXECUTIVE">Service Executive</option>
              <option value="ACCOUNTS">Accounts</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Users</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Role & Rights</th>
                  <th className="p-3.5 text-center">Active Leads</th>
                  <th className="p-3.5 text-center">Sales Closed</th>
                  <th className="p-3.5 text-center">Service Jobs</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">Loading user accounts...</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gm-muted">No users found matching filter.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gm-navy text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <b className="text-gm-navy font-bold block">{emp.name}</b>
                            <span className="text-gm-muted text-[11px] font-mono">{emp.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gm-navy block font-medium">{emp.email}</span>
                        <span className="text-gm-muted text-[11px]">{emp.phone || 'No phone'}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getRoleBadgeStyle(emp.role?.code)}`}>
                            {emp.role?.name}
                          </span>
                          {emp.customPermissions && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Custom Rights
                            </span>
                          )}
                        </div>
                        <span className="text-gm-muted text-[11px] block mt-0.5">
                          {emp.department?.name || 'General Operations'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-gm-navy">
                        {emp._count?.assignedLeads || 0}
                      </td>
                      <td className="p-3.5 text-center font-black text-emerald-600">
                        {emp._count?.sales || 0}
                      </td>
                      <td className="p-3.5 text-center font-bold text-indigo-600">
                        {emp._count?.serviceJobCards || 0}
                      </td>
                      <td className="p-3.5">
                        {emp.active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg border border-gm-line hover:border-gm-navy text-gm-navy bg-white hover:bg-gm-soft transition-colors"
                            title="Edit user details & custom rights"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openPasswordModal(emp)}
                            className="p-1.5 rounded-lg border border-gm-line hover:border-gm-navy text-gm-navy bg-white hover:bg-gm-soft transition-colors"
                            title="Reset user password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(emp)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              emp.active
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={emp.active ? 'Deactivate account' : 'Activate account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create User with Individual Rights Customization */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-gm-line shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <div>
                  <h3 className="text-xl font-black text-gm-navy">Add New Staff Member</h3>
                  <p className="text-xs text-gm-muted">Configure profile, assign base role, and set custom permissions.</p>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="text-gm-muted font-bold text-lg">✕</button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Basic User Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sunil Verma"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Email Address (Login ID) *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sunil@gurudevmotors.com"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Initial Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gm-navy">Base Role *</label>
                      <a
                        href="/admin/roles?create=true"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-gm-red hover:underline"
                        title="Open Roles Management to create a new custom role"
                      >
                        + Create Role
                      </a>
                    </div>
                    <select
                      value={roleId}
                      onChange={(e) => handleRoleChangeForCreate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                      required
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Individual Rights Customization Toggle & Matrix */}
                <div className="pt-2 border-t border-gm-line">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gm-soft/70 border border-gm-line">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-gm-red" />
                      <div>
                        <b className="text-xs text-gm-navy block">Individual Module Rights & Permissions</b>
                        <span className="text-[11px] text-gm-muted">Customize individual rights for this user beyond base role defaults</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateRights(!showCreateRights)}
                      className="px-3 py-1.5 rounded-xl border border-gm-line bg-white text-xs font-bold text-gm-navy flex items-center gap-1 hover:border-gm-navy transition-colors"
                    >
                      <span>{showCreateRights ? 'Hide Rights Matrix' : 'Customize Rights'}</span>
                      {showCreateRights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showCreateRights && (
                    <div className="mt-3 p-4 rounded-2xl border border-gm-line bg-white space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gm-line/60">
                        <span className="text-[11px] font-bold text-gm-muted uppercase">
                          Check or uncheck individual rights:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const sel = roles.find((r) => r.id === roleId);
                              if (sel) setCreateMatrix(buildMatrixFromRole(sel));
                            }}
                            className="px-2.5 py-1 rounded-lg border border-gm-line text-[10px] font-bold text-gm-navy hover:bg-gm-soft"
                          >
                            Reset to Role Defaults
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermsInMatrix(setCreateMatrix, true)}
                            className="px-2.5 py-1 rounded-lg bg-gm-navy text-white text-[10px] font-bold"
                          >
                            Grant All Rights
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermsInMatrix(setCreateMatrix, false)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-gm-soft text-gm-muted uppercase font-bold text-[9px] sticky top-0">
                            <tr>
                              <th className="p-2">Module</th>
                              {PERMISSION_ACTIONS.map((act) => (
                                <th key={act} className="p-2 text-center uppercase">{act}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gm-line/50">
                            {MODULES.map((mod) => (
                              <tr key={mod.key} className="hover:bg-gm-soft/30 transition-colors">
                                <td className="p-2 font-bold text-gm-navy">{mod.label}</td>
                                {PERMISSION_ACTIONS.map((act) => {
                                  const isChecked = Boolean(createMatrix[mod.key]?.[act as PermissionKey]);
                                  return (
                                    <td key={act} className="p-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleCreatePerm(mod.key, act as PermissionKey)}
                                        className="rounded border-gm-line text-gm-navy focus:ring-gm-navy cursor-pointer"
                                      />
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
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Creating...' : 'Create Account & Apply Rights'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User with Individual Rights Customization */}
        {editModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-gm-line shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <div>
                  <h3 className="text-xl font-black text-gm-navy">Edit User Account & Rights</h3>
                  <span className="text-xs text-gm-muted">{selectedUser.email}</span>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="text-gm-muted font-bold text-lg">✕</button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gm-navy">Base Role</label>
                      <a
                        href="/admin/roles?create=true"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-gm-red hover:underline"
                        title="Open Roles Management to create a new custom role"
                      >
                        + Create Role
                      </a>
                    </div>
                    <select
                      value={editRoleId}
                      onChange={(e) => handleRoleChangeForEdit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                      required
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Department</label>
                    <select
                      value={editDepartmentId}
                      onChange={(e) => setEditDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="rounded text-gm-navy"
                  />
                  <label htmlFor="editActive" className="text-xs font-bold text-gm-navy">
                    Account is Active and allowed to sign in
                  </label>
                </div>

                {/* Individual Rights Customization Toggle & Matrix for Edit */}
                <div className="pt-2 border-t border-gm-line">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gm-soft/70 border border-gm-line">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-gm-red" />
                      <div>
                        <b className="text-xs text-gm-navy block">Individual Module Rights & Permissions</b>
                        <span className="text-[11px] text-gm-muted">Modify specific module access for this employee</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditRights(!showEditRights)}
                      className="px-3 py-1.5 rounded-xl border border-gm-line bg-white text-xs font-bold text-gm-navy flex items-center gap-1 hover:border-gm-navy transition-colors"
                    >
                      <span>{showEditRights ? 'Hide Rights Matrix' : 'Modify Rights Matrix'}</span>
                      {showEditRights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showEditRights && (
                    <div className="mt-3 p-4 rounded-2xl border border-gm-line bg-white space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gm-line/60">
                        <span className="text-[11px] font-bold text-gm-muted uppercase">
                          Toggle permissions for {editName}:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const sel = roles.find((r) => r.id === editRoleId);
                              if (sel) setEditMatrix(buildMatrixFromRole(sel));
                            }}
                            className="px-2.5 py-1 rounded-lg border border-gm-line text-[10px] font-bold text-gm-navy hover:bg-gm-soft"
                          >
                            Reset to Role Defaults
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermsInMatrix(setEditMatrix, true)}
                            className="px-2.5 py-1 rounded-lg bg-gm-navy text-white text-[10px] font-bold"
                          >
                            Grant All Rights
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermsInMatrix(setEditMatrix, false)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-gm-soft text-gm-muted uppercase font-bold text-[9px] sticky top-0">
                            <tr>
                              <th className="p-2">Module</th>
                              {PERMISSION_ACTIONS.map((act) => (
                                <th key={act} className="p-2 text-center uppercase">{act}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gm-line/50">
                            {MODULES.map((mod) => (
                              <tr key={mod.key} className="hover:bg-gm-soft/30 transition-colors">
                                <td className="p-2 font-bold text-gm-navy">{mod.label}</td>
                                {PERMISSION_ACTIONS.map((act) => {
                                  const isChecked = Boolean(editMatrix[mod.key]?.[act as PermissionKey]);
                                  return (
                                    <td key={act} className="p-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleEditPerm(mod.key, act as PermissionKey)}
                                        className="rounded border-gm-line text-gm-navy focus:ring-gm-navy cursor-pointer"
                                      />
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
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Saving...' : 'Save Changes & Update Rights'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Reset Password */}
        {passwordModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h3 className="text-xl font-black text-gm-navy">Reset Password</h3>
                </div>
                <button onClick={() => setPasswordModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <p className="text-xs text-gm-muted mb-4">
                Reset login password for <b>{selectedUser.name}</b> ({selectedUser.email}).
              </p>

              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                    required
                    minLength={6}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Resetting...' : 'Update Password'}
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
