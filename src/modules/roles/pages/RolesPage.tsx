import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Check, Lock, Edit3, Users, KeyRound, Copy, Trash2, CheckCircle2, ShieldAlert, FileText, CheckSquare, Square, Building2, UserCheck, Shield } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_ROLES, Role, MODULE_LIST, ModulePermission } from '../../../mockData/roles';
import confetti from 'canvas-confetti';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'members'>('roles');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New/Edit Role Form State
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [accessLevel, setAccessLevel] = useState<Role['accessLevel']>('FULL_ACCESS');
  const [permissions, setPermissions] = useState<ModulePermission[]>(
    MODULE_LIST.map(m => ({
      module: m.module,
      moduleLabel: m.label,
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      export: false
    }))
  );

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const openCreateModal = () => {
    setSelectedRole(null);
    setRoleName('');
    setRoleCode('');
    setRoleDesc('');
    setAccessLevel('FULL_ACCESS');
    setPermissions(
      MODULE_LIST.map(m => ({
        module: m.module,
        moduleLabel: m.label,
        view: true,
        create: false,
        edit: false,
        delete: false,
        approve: false,
        export: false
      }))
    );
    setIsCreateOpen(true);
  };

  const openEditDrawer = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleCode(role.code);
    setRoleDesc(role.description);
    setAccessLevel(role.accessLevel);
    setPermissions(role.permissions);
    setIsCreateOpen(true);
  };

  const handleTogglePermission = (moduleKey: string, action: keyof Omit<ModulePermission, 'module' | 'moduleLabel'>) => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.module === moduleKey) {
          return { ...p, [action]: !p[action] };
        }
        return p;
      })
    );
  };

  const handleApplyPreset = (preset: 'all' | 'readonly' | 'none') => {
    setPermissions(prev =>
      prev.map(p => ({
        ...p,
        view: preset !== 'none',
        create: preset === 'all',
        edit: preset === 'all',
        delete: preset === 'all',
        approve: preset === 'all',
        export: preset === 'all' || preset === 'readonly'
      }))
    );
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    if (selectedRole) {
      setRoles(prev =>
        prev.map(r =>
          r.id === selectedRole.id
            ? { ...r, name: roleName, description: roleDesc, accessLevel, permissions }
            : r
        )
      );
      triggerToast(`Updated role "${roleName}" successfully!`);
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleName,
        code: roleCode || roleName.toUpperCase().replace(/\s+/g, '_'),
        description: roleDesc || 'Custom role permissions',
        usersCount: 0,
        isSystemRole: false,
        accessLevel,
        permissions,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles(prev => [...prev, newRole]);
      confetti({ particleCount: 50, spread: 60 });
      triggerToast(`Created role "${roleName}" successfully!`);
    }

    setIsCreateOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              Role-Based Access Control (RBAC) & Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Roles & Granular Permissions</h1>
          <p className="text-xs text-txt-secondary mt-1">Configure role capabilities, module level permissions (View, Create, Edit, Delete, Approve, Export), and team member assignments</p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Custom Role
        </Button>
      </div>

      {/* Toast Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Configured System Roles</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{roles.length} Roles</div>
            <span className="text-[11px] text-txt-secondary">RBAC Governance</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Assigned Team Members</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">18 Admins</div>
            <span className="text-[11px] text-txt-secondary">Active User Accounts</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Guarded Modules</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">{MODULE_LIST.length} Modules</div>
            <span className="text-[11px] text-txt-secondary">Granular Scope Enabled</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Security Compliance</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">100%</div>
            <span className="text-[11px] text-brand-teal font-semibold">Strict Scope Enforced</span>
          </div>
          <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border gap-6">
        {(['roles', 'matrix', 'members'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {tab === 'roles' ? 'Roles Directory' : tab === 'matrix' ? 'Permissions Matrix' : 'Role Assignments'}
          </button>
        ))}
      </div>

      {/* TAB 1: Roles Directory Cards */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map(role => (
            <div key={role.id} className="wt-card wt-card-interactive p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand-primary" />
                    <span className="font-mono text-xs font-bold text-brand-primary px-2.5 py-0.5 rounded-md bg-brand-primary-050 border border-brand-primary/20">
                      {role.code}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    role.accessLevel === 'SUPER_ADMIN' ? 'bg-status-absent/10 text-status-absent border border-status-absent/20' :
                    role.accessLevel === 'FULL_ACCESS' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' :
                    'bg-bg-surface-2 text-txt-secondary border border-border'
                  }`}>
                    {role.accessLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-txt-primary mt-3">{role.name}</h3>
                <p className="text-xs text-txt-secondary mt-1 leading-relaxed">{role.description}</p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-txt-secondary">
                  <Users className="w-4 h-4" />
                  <span className="font-bold text-txt-primary">{role.usersCount} Active Members</span>
                </div>

                <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditDrawer(role)}>
                  Configure Permissions
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Full Matrix View */}
      {activeTab === 'matrix' && (
        <div className="wt-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-txt-primary">Module Access Matrix Overview</h3>
            <p className="text-xs text-txt-secondary">Comparative matrix view of active permissions per system role</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th>MODULE</th>
                  {roles.map(r => (
                    <th key={r.id} className="text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULE_LIST.map(m => (
                  <tr key={m.module}>
                    <td className="font-bold text-xs text-txt-primary">{m.label}</td>
                    {roles.map(r => {
                      const perm = r.permissions.find(p => p.module === m.module);
                      const hasAccess = perm?.view;
                      return (
                        <td key={r.id} className="text-center">
                          {hasAccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-teal/10 text-brand-teal">
                              <Check className="w-3 h-3" /> Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-absent/10 text-status-absent">
                              <Lock className="w-3 h-3" /> Restricted
                            </span>
                          )}
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

      {/* TAB 3: Role Assignments */}
      {activeTab === 'members' && (
        <div className="wt-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-txt-primary">Assigned Team Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th>MEMBER NAME</th>
                  <th>EMAIL ADDRESS</th>
                  <th>ASSIGNED ROLE</th>
                  <th>DEPLOYMENT SCOPE</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-bg-surface-2/40">
                  <td className="font-bold text-xs text-txt-primary">Olivia Chen</td>
                  <td className="text-xs text-txt-secondary font-mono">admin@watchtower.dev</td>
                  <td><Badge status="ACTIVE" label="Organization Admin" /></td>
                  <td className="text-xs text-txt-primary font-bold">All Sites & Corporate Accounts</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost">Reassign Role</Button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-surface-2/40">
                  <td className="font-bold text-xs text-txt-primary">Vikramaditya Rao</td>
                  <td className="text-xs text-txt-secondary font-mono">manager@watchtower.dev</td>
                  <td><Badge status="PENDING" label="Regional Manager" /></td>
                  <td className="text-xs text-txt-primary font-bold">Pune Region (3 Sites)</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost">Reassign Role</Button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-surface-2/40">
                  <td className="font-bold text-xs text-txt-primary">Priya Sharma</td>
                  <td className="text-xs text-txt-secondary font-mono">supervisor@watchtower.dev</td>
                  <td><Badge status="LATE_IN" label="Site Supervisor" /></td>
                  <td className="text-xs text-txt-primary font-bold">HDFC Bank FC Road Campus</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost">Reassign Role</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Role Drawer */}
      <Sheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={selectedRole ? `Configure Role: ${selectedRole.name}` : 'Create Custom Role'}
      >
        <form onSubmit={handleSaveRole} className="space-y-6 text-xs">
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Role Display Name</label>
              <input
                type="text"
                required
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                placeholder="e.g. Compliance Auditor"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Role Code (Unique identifier)</label>
              <input
                type="text"
                value={roleCode}
                onChange={e => setRoleCode(e.target.value.toUpperCase())}
                placeholder="e.g. COMPLIANCE_AUDITOR"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Role Description</label>
              <textarea
                rows={2}
                value={roleDesc}
                onChange={e => setRoleDesc(e.target.value)}
                placeholder="Briefly explain the responsibilities of this role..."
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Access Level Preset</label>
              <select
                value={accessLevel}
                onChange={e => setAccessLevel(e.target.value as any)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              >
                <option value="SUPER_ADMIN">Super Admin (Full Rights)</option>
                <option value="FULL_ACCESS">Full Access (Standard)</option>
                <option value="LIMITED">Limited Operational Access</option>
                <option value="READ_ONLY">Read-Only Viewer</option>
              </select>
            </div>
          </div>

          {/* Granular Permission Checkboxes Matrix */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-txt-primary text-sm">Granular Module Permissions</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('all')}
                  className="text-[11px] font-bold text-brand-primary hover:underline"
                >
                  Select All
                </button>
                <span className="text-txt-tertiary">•</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('readonly')}
                  className="text-[11px] font-bold text-txt-secondary hover:underline"
                >
                  Read Only
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {permissions.map(p => (
                <div key={p.module} className="p-3 bg-bg-surface-2 border border-border rounded-xl space-y-2">
                  <div className="font-bold text-txt-primary">{p.moduleLabel}</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.view}
                        onChange={() => handleTogglePermission(p.module, 'view')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">View</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.create}
                        onChange={() => handleTogglePermission(p.module, 'create')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">Create</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.edit}
                        onChange={() => handleTogglePermission(p.module, 'edit')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">Edit</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.delete}
                        onChange={() => handleTogglePermission(p.module, 'delete')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">Delete</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.approve}
                        onChange={() => handleTogglePermission(p.module, 'approve')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">Approve</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.export}
                        onChange={() => handleTogglePermission(p.module, 'export')}
                        className="w-3.5 h-3.5 accent-brand-primary"
                      />
                      <span className="text-txt-secondary font-medium">Export</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              {selectedRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
