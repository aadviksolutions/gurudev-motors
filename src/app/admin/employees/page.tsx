'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Gurudev@123');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        if (rData.roles.length > 0) setRoleId(rData.roles[0].id);
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
    fetchEmployees();
    fetchLookups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !roleId) return;

    setSubmitting(true);
    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          roleId,
          departmentId,
          active: true,
        }),
      });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchEmployees();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight">
              Employees & Staff Directory
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Manage dealership workforce across Executive Management, Sales, Accounts and Workshop departments.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gm-soft/70 text-gm-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email & Phone</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-center">Active Leads</th>
                  <th className="p-3.5 text-center">Sales Closed</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gm-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gm-muted">Loading employees...</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gm-soft/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gm-navy text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <b className="text-gm-navy font-bold">{emp.name}</b>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-gm-navy block font-medium">{emp.email}</span>
                        <span className="text-gm-muted text-[11px]">{emp.phone || '-'}</span>
                      </td>
                      <td className="p-3.5 font-bold text-gm-navy">
                        {emp.department?.name || 'General'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {emp.role?.name}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-gm-navy">
                        {emp._count?.assignedLeads || 0}
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-600">
                        {emp._count?.sales || 0}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gm-line shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gm-line mb-4">
                <h3 className="text-xl font-black text-gm-navy">Add New Employee</h3>
                <button onClick={() => setModalOpen(false)} className="text-gm-muted font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunil Verma"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sunil@gurudevmotors.com"
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Initial Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gm-navy mb-1">Role *</label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
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

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    {submitting ? 'Saving...' : 'Create Staff Member'}
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
