export interface ModulePermission {
  module: string;
  moduleLabel: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  usersCount: number;
  isSystemRole: boolean;
  accessLevel: 'SUPER_ADMIN' | 'FULL_ACCESS' | 'LIMITED' | 'READ_ONLY';
  permissions: ModulePermission[];
  createdAt: string;
}

export const MODULE_LIST = [
  { module: 'dashboard', label: 'Dashboard & Pulse Analytics' },
  { module: 'attendance', label: 'Attendance Register & Logs' },
  { module: 'exceptions', label: 'Exceptions Approval Queue' },
  { module: 'employees', label: 'Employee & Guard Directory' },
  { module: 'sites', label: 'Sites, Posts & Geofencing' },
  { module: 'roster', label: 'Shift Templates & Roster Planner' },
  { module: 'leave', label: 'Leave Requests & Balances' },
  { module: 'reports', label: 'Reports Builder & Exports' },
  { module: 'roles', label: 'Roles & Access Control' },
  { module: 'settings', label: 'System Configuration & Rules' },
  { module: 'audit', label: 'Audit Logs & History' }
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'Organization Admin',
    code: 'ORG_ADMIN',
    description: 'Full un-restricted administrative control across all workforce modules, sites, and settings.',
    usersCount: 3,
    isSystemRole: true,
    accessLevel: 'SUPER_ADMIN',
    createdAt: '2025-01-01',
    permissions: MODULE_LIST.map(m => ({
      module: m.module,
      moduleLabel: m.label,
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      export: true
    }))
  },
  {
    id: 'role-2',
    name: 'Regional Operations Manager',
    code: 'REGIONAL_MGR',
    description: 'Manages multi-site guard rosters, approves attendance exceptions, and views regional reports.',
    usersCount: 8,
    isSystemRole: false,
    accessLevel: 'FULL_ACCESS',
    createdAt: '2025-03-15',
    permissions: MODULE_LIST.map(m => ({
      module: m.module,
      moduleLabel: m.label,
      view: true,
      create: m.module !== 'roles' && m.module !== 'settings',
      edit: m.module !== 'roles' && m.module !== 'settings',
      delete: false,
      approve: true,
      export: true
    }))
  },
  {
    id: 'role-3',
    name: 'Field Attendance Supervisor',
    code: 'SITE_SUPERVISOR',
    description: 'Monitors site post check-ins, submits manual attendance overrides, and manages local shift rosters.',
    usersCount: 24,
    isSystemRole: false,
    accessLevel: 'LIMITED',
    createdAt: '2025-05-10',
    permissions: MODULE_LIST.map(m => ({
      module: m.module,
      moduleLabel: m.label,
      view: ['dashboard', 'attendance', 'exceptions', 'employees', 'roster', 'leave'].includes(m.module),
      create: ['attendance', 'roster', 'leave'].includes(m.module),
      edit: ['attendance', 'roster'].includes(m.module),
      delete: false,
      approve: ['exceptions'].includes(m.module),
      export: false
    }))
  },
  {
    id: 'role-4',
    name: 'Auditor & Compliance Clerk',
    code: 'AUDITOR',
    description: 'Read-only access to attendance registers, exception audit trails, and compliance reports.',
    usersCount: 5,
    isSystemRole: false,
    accessLevel: 'READ_ONLY',
    createdAt: '2025-08-01',
    permissions: MODULE_LIST.map(m => ({
      module: m.module,
      moduleLabel: m.label,
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      export: true
    }))
  }
];
