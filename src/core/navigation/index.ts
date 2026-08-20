import type React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  KeyRound,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from 'lucide-react';

/**
 * The navigation model.
 *
 * Each destination declares the module it belongs to and the permission it
 * needs. The sidebar renders what the signed-in user can actually reach, and
 * the router refuses the rest — but neither is the real gate: the API enforces
 * the same rules independently, so hiding a link is presentation, not security.
 */
export interface NavDestination {
  label: string;
  path: string;
  icon: React.ElementType;
  section: string;
  /** Module the client must own for this destination to exist at all. */
  module: string;
  /** Permission the signed-in role must hold. */
  permission: string;
}

export const WORKSPACE_NAV: NavDestination[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, section: 'OVERVIEW', module: 'DASHBOARD', permission: 'DASHBOARD_VIEW' },
  { label: 'Attendance Register', path: '/attendance', icon: CalendarCheck, section: 'OVERVIEW', module: 'ATTENDANCE', permission: 'ATTENDANCE_VIEW' },
  { label: 'Exceptions Queue', path: '/exceptions', icon: AlertTriangle, section: 'OVERVIEW', module: 'ATTENDANCE', permission: 'EXCEPTION_VIEW' },

  { label: 'Sites & Posts', path: '/sites', icon: Building2, section: 'WORKFORCE', module: 'SITES', permission: 'SITE_VIEW' },
  { label: 'Employees', path: '/employees', icon: Users, section: 'WORKFORCE', module: 'EMPLOYEES', permission: 'EMPLOYEE_VIEW' },
  { label: 'Shifts & Roster', path: '/roster', icon: CalendarDays, section: 'WORKFORCE', module: 'ROSTER', permission: 'ROSTER_VIEW' },
  { label: 'Leave', path: '/leave', icon: FileSpreadsheet, section: 'WORKFORCE', module: 'LEAVE', permission: 'LEAVE_VIEW' },

  { label: 'Payroll', path: '/payroll', icon: DollarSign, section: 'FINANCE', module: 'PAYROLL', permission: 'PAYROLL_VIEW' },
  { label: 'Reports', path: '/reports', icon: BarChart3, section: 'FINANCE', module: 'REPORTS', permission: 'REPORT_VIEW' },

  { label: 'Roles & Access', path: '/roles', icon: KeyRound, section: 'SYSTEM', module: 'ACCESS_CONTROL', permission: 'ROLE_VIEW' },
  { label: 'Audit Trail', path: '/audit', icon: ClipboardList, section: 'SYSTEM', module: 'ACCESS_CONTROL', permission: 'AUDIT_VIEW' },
];

export const WORKSPACE_SECTIONS = ['OVERVIEW', 'WORKFORCE', 'FINANCE', 'SYSTEM'] as const;

export const PLATFORM_NAV: NavDestination[] = [
  { label: 'Platform Overview', path: '/platform', icon: LayoutDashboard, section: 'PLATFORM', module: '', permission: '' },
  { label: 'Clients', path: '/platform/clients', icon: Building2, section: 'PLATFORM', module: '', permission: '' },
  { label: 'Billing & Invoices', path: '/platform/billing', icon: CreditCard, section: 'PLATFORM', module: '', permission: '' },
  { label: 'Activity Log', path: '/platform/activity', icon: ShieldAlert, section: 'PLATFORM', module: '', permission: '' },
  { label: 'Support Access', path: '/platform/access', icon: KeyRound, section: 'PLATFORM', module: '', permission: '' },
];

export const PLATFORM_SECTIONS = ['PLATFORM'] as const;

/** Route guards, keyed by path, used by the router to gate direct URL entry. */
export const ROUTE_GUARDS: Record<string, { module: string; permission: string; label: string }> = {
  '/dashboard': { module: 'DASHBOARD', permission: 'DASHBOARD_VIEW', label: 'Dashboard' },
  '/attendance': { module: 'ATTENDANCE', permission: 'ATTENDANCE_VIEW', label: 'Attendance & Exceptions' },
  '/exceptions': { module: 'ATTENDANCE', permission: 'EXCEPTION_VIEW', label: 'Attendance & Exceptions' },
  '/sites': { module: 'SITES', permission: 'SITE_VIEW', label: 'Sites & Posts Management' },
  '/employees': { module: 'EMPLOYEES', permission: 'EMPLOYEE_VIEW', label: 'Employee Directory & KYC' },
  '/roster': { module: 'ROSTER', permission: 'ROSTER_VIEW', label: 'Shifts & Roster Planning' },
  '/leave': { module: 'LEAVE', permission: 'LEAVE_VIEW', label: 'Leave Management' },
  '/payroll': { module: 'PAYROLL', permission: 'PAYROLL_VIEW', label: 'Payroll Ledger' },
  '/reports': { module: 'REPORTS', permission: 'REPORT_VIEW', label: 'Reports & Analytics' },
  '/roles': { module: 'ACCESS_CONTROL', permission: 'ROLE_VIEW', label: 'Roles & Access Control' },
  '/audit': { module: 'ACCESS_CONTROL', permission: 'AUDIT_VIEW', label: 'Roles & Access Control' },
  '/settings': { module: 'ACCESS_CONTROL', permission: 'SETTINGS_VIEW', label: 'Roles & Access Control' },
};

/** The first destination a workspace user can actually open. */
export function firstAccessibleWorkspacePath(modules: string[], permissions: string[]): string {
  const moduleSet = new Set(modules);
  const permissionSet = new Set(permissions);
  const destination = WORKSPACE_NAV.find(
    (item) => moduleSet.has(item.module) && permissionSet.has(item.permission),
  );
  return destination?.path ?? '/no-access';
}
