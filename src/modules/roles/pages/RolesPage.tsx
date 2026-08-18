import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { rolesApi } from '../../../services/rolesApi';

const AVAILABLE_PERMISSIONS = [
  { code: 'MANAGE_SITES', label: 'Manage Sites & Security Posts' },
  { code: 'MANAGE_EMPLOYEES', label: 'Onboard & Manage Security Guards' },
  { code: 'APPROVE_ATTENDANCE', label: 'Approve Exceptions & Manual Punches' },
  { code: 'MANAGE_ROSTER', label: 'Define Shifts & Guard Roster' },
  { code: 'RUN_PAYROLL', label: 'View & Run Salary Payroll' },
  { code: 'VIEW_REPORTS', label: 'View Attendance & Compliance Analytics' },
  { code: 'MANAGE_ROLES', label: 'Manage Custom Roles & RBAC Matrix' },
  { code: 'MANAGE_SETTINGS', label: 'Configure Geofence & System Parameters' },
  { code: 'PERFORM_CHECKIN', label: 'Perform Field GPS/QR Punch Check-ins' },
  { code: 'VIEW_SELF_ROSTER', label: 'View Personal Shift Schedule' }
];

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'VIEW_SITES',
    'VIEW_EMPLOYEES',
    'APPROVE_ATTENDANCE'
  ]);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);
      const data = await rolesApi.getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  }

  const togglePermission = (permCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permCode) ? prev.filter((p) => p !== permCode) : [...prev, permCode]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setErrorMsg('');
    try {
      const newRole = await rolesApi.createRole({
        name,
        code,
        description,
        permissions: selectedPermissions
      });
      setRoles((prev) => [...prev, newRole]);
      setIsModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create custom role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await rolesApi.deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <KeyRound className="w-4 h-4 text-brand-primary" /> ROLE-BASED ACCESS CONTROL (RBAC)
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Organization Roles & Permissions ({roles.length})
          </h1>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading RBAC permission matrix from database...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-txt-primary">{role.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary font-mono">
                      {role.code}
                    </span>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-txt-secondary">{role.description || 'Custom organization role'}</p>
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold text-txt-secondary">Granted Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {role.permissions?.map((p: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-bg-surface-2 text-txt-primary border border-border">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {role.isSystem && (
                <div className="pt-2 text-[10px] font-mono text-txt-secondary flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" /> Default System Role
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary border-b border-border pb-3">
              Create Custom Organization Role
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-txt-secondary">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Shift Supervisor"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!code) setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'));
                    }}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-txt-secondary">Role Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SHIFT_SUP_SR"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-txt-secondary">Description</label>
                <input
                  type="text"
                  placeholder="Describe responsibility scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="font-bold text-txt-secondary block mb-2">Assign Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.code);
                    return (
                      <div
                        key={perm.code}
                        onClick={() => togglePermission(perm.code)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                            : 'border-border bg-bg-surface-2 text-txt-secondary hover:text-txt-primary'
                        }`}
                      >
                        <span className="text-[11px]">{perm.label}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white font-bold">
                  Save Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
