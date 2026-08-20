/**
 * The API surface, grouped by feature.
 *
 * Screens call these; nothing else in the app talks to the network. Each
 * function maps one-to-one onto a server endpoint so the contract stays easy
 * to follow from either side.
 */
import { apiRequest, apiRequestPaged, tokenStore } from './apiClient';
import type {
  AttendanceEvent,
  AttendanceSummaryReport,
  AuditEntry,
  BillingQuote,
  CatalogModule,
  ClientDetail,
  ClientSummary,
  DashboardOverview,
  EmployeeBankAccount,
  EmployeeDetail,
  EmployeeKyc,
  EmployeeSummary,
  ImpersonationHandoff,
  ImpersonationSession,
  Invoice,
  LeaveBalance,
  LeaveRequest,
  PayrollRow,
  PermissionGroup,
  PlatformAuditEntry,
  PlatformDashboard,
  Post,
  RegisterRow,
  Role,
  RosterEntry,
  RosterValidation,
  Session,
  SessionUser,
  Shift,
  Site,
  SiteCoverage,
  TrendPoint,
  WorkspaceConfig,
  WorkspaceSummary,
} from './types';

/** Exception and leave reports share a rows-plus-summary shape. */
export interface GenericReport {
  rows: Record<string, unknown>[];
  summary: Record<string, unknown>;
  period: { from: string; to: string };
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<Session>('/auth/login', { method: 'POST', body: { email, password }, skipAuthRetry: true }),

  logout: () =>
    apiRequest<{ signedOut: boolean }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken: tokenStore.getRefresh() ?? undefined },
    }),

  me: () => apiRequest<SessionUser & { lastLoginAt: string | null }>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ passwordChanged: boolean }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  /**
   * Exchanges a Super Admin bypass ticket for a session. Sent over POST so the
   * credential never travels in a URL; `skipAuthRetry` because the tab has no
   * session yet and a 401 here means the ticket is spent, not the session.
   */
  redeemImpersonation: (ticket: string) =>
    apiRequest<Session>('/auth/impersonation/redeem', {
      method: 'POST',
      body: { ticket },
      skipAuthRetry: true,
    }),

  exitImpersonation: () => apiRequest<{ ended: boolean }>('/auth/impersonation/exit', { method: 'POST' }),
};

export const catalogApi = {
  modules: () => apiRequest<CatalogModule[]>('/catalog/modules'),
  assignablePermissions: () => apiRequest<PermissionGroup[]>('/catalog/permissions'),
};

export const platformApi = {
  dashboard: () => apiRequest<PlatformDashboard>('/superadmin/dashboard'),

  quote: (body: {
    moduleCodes: string[];
    pricingModel: string;
    billingCycle: string;
    maxUsers: number;
    customAmount?: number | null;
    discountPercent: number;
  }) => apiRequest<BillingQuote>('/superadmin/billing/quote', { method: 'POST', body }),

  listClients: (params: ListParams = {}) =>
    apiRequestPaged<ClientSummary>('/superadmin/clients', { query: params }),

  getClient: (id: string) => apiRequest<ClientDetail>(`/superadmin/clients/${id}`),

  createClient: (body: unknown) =>
    apiRequest<ClientDetail>('/superadmin/clients', { method: 'POST', body }),

  updateClient: (id: string, body: unknown) =>
    apiRequest<ClientDetail>(`/superadmin/clients/${id}`, { method: 'PATCH', body }),

  setClientStatus: (id: string, status: string, reason?: string) =>
    apiRequest<ClientDetail>(`/superadmin/clients/${id}/status`, { method: 'PATCH', body: { status, reason } }),

  updateModules: (id: string, moduleCodes: string[]) =>
    apiRequest<ClientDetail>(`/superadmin/clients/${id}/modules`, { method: 'PUT', body: { moduleCodes } }),

  updateSubscription: (id: string, body: unknown) =>
    apiRequest<ClientDetail>(`/superadmin/clients/${id}/subscription`, { method: 'PUT', body }),

  resetAdminPassword: (id: string, body: { userId: string; newPassword: string; reason: string }) =>
    apiRequest<{ userId: string; email: string }>(`/superadmin/clients/${id}/admin-password`, { method: 'POST', body }),

  listInvoices: (params: ListParams = {}) => apiRequestPaged<Invoice>('/superadmin/invoices', { query: params }),

  createInvoice: (clientId: string, body: unknown) =>
    apiRequest<Invoice>(`/superadmin/clients/${clientId}/invoices`, { method: 'POST', body }),

  recordPayment: (invoiceId: string, body: unknown) =>
    apiRequest<Invoice>(`/superadmin/invoices/${invoiceId}/payments`, { method: 'POST', body }),

  audit: (params: ListParams = {}) => apiRequestPaged<PlatformAuditEntry>('/superadmin/audit', { query: params }),

  /**
   * Opens a bypass session against a client. Returns a single-use ticket, not
   * a token — the console never holds a credential for someone else's account.
   */
  startImpersonation: (clientId: string, body: { reason: string; userId?: string }) =>
    apiRequest<ImpersonationHandoff>(`/superadmin/clients/${clientId}/impersonate`, { method: 'POST', body }),

  impersonationSessions: (params: ListParams & { clientId?: string; activeOnly?: boolean } = {}) =>
    apiRequestPaged<ImpersonationSession>('/superadmin/impersonation-sessions', { query: params }),
};

export const rolesApi = {
  list: (params: ListParams = {}) => apiRequestPaged<Role>('/roles', { query: params }),
  get: (id: string) => apiRequest<Role>(`/roles/${id}`),
  create: (body: { name: string; code: string; description?: string; permissionCodes: string[] }) =>
    apiRequest<Role>('/roles', { method: 'POST', body }),
  update: (id: string, body: unknown) => apiRequest<Role>(`/roles/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => apiRequest<{ id: string; deleted: boolean }>(`/roles/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list: (params: ListParams = {}) => apiRequestPaged<Record<string, unknown>>('/users', { query: params }),
  create: (body: unknown) => apiRequest('/users', { method: 'POST', body }),
  update: (id: string, body: unknown) => apiRequest(`/users/${id}`, { method: 'PATCH', body }),
};

export interface EmployeeListMeta {
  rolesConfigured: boolean;
}

export const employeesApi = {
  list: (params: ListParams = {}) => apiRequestPaged<EmployeeSummary>('/employees', { query: params }),
  get: (id: string) => apiRequest<EmployeeDetail>(`/employees/${id}`),
  create: (body: unknown) => apiRequest<EmployeeDetail>('/employees', { method: 'POST', body }),
  update: (id: string, body: unknown) => apiRequest<EmployeeDetail>(`/employees/${id}`, { method: 'PATCH', body }),
  deactivate: (id: string) =>
    apiRequest<{ id: string; status: string }>(`/employees/${id}/deactivate`, { method: 'POST' }),

  getKyc: (id: string) => apiRequest<EmployeeKyc | null>(`/employees/${id}/kyc`),
  saveKyc: (id: string, body: unknown) => apiRequest<EmployeeKyc>(`/employees/${id}/kyc`, { method: 'PUT', body }),

  getBankAccount: (id: string) => apiRequest<EmployeeBankAccount | null>(`/employees/${id}/bank-account`),
  saveBankAccount: (id: string, body: unknown) =>
    apiRequest<EmployeeBankAccount>(`/employees/${id}/bank-account`, { method: 'PUT', body }),
  verifyBankAccount: (id: string) =>
    apiRequest<EmployeeBankAccount>(`/employees/${id}/bank-account/verify`, { method: 'POST' }),
};

export const sitesApi = {
  list: (params: ListParams = {}) => apiRequestPaged<Site>('/sites', { query: params }),
  get: (id: string) => apiRequest<Site>(`/sites/${id}`),
  create: (body: unknown) => apiRequest<Site>('/sites', { method: 'POST', body }),
  update: (id: string, body: unknown) => apiRequest<Site>(`/sites/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => apiRequest<{ id: string; archived: boolean }>(`/sites/${id}`, { method: 'DELETE' }),

  listPosts: (siteId: string, params: ListParams = {}) =>
    apiRequestPaged<Post>(`/sites/${siteId}/posts`, { query: params }),
  createPost: (siteId: string, body: unknown) =>
    apiRequest<Post>(`/sites/${siteId}/posts`, { method: 'POST', body }),
  updatePost: (postId: string, body: unknown) => apiRequest<Post>(`/posts/${postId}`, { method: 'PATCH', body }),
  removePost: (postId: string) =>
    apiRequest<{ id: string; archived: boolean }>(`/posts/${postId}`, { method: 'DELETE' }),
};

export const rosterApi = {
  listShifts: (params: ListParams = {}) => apiRequestPaged<Shift>('/roster/shifts', { query: params }),
  createShift: (body: unknown) => apiRequest<Shift>('/roster/shifts', { method: 'POST', body }),
  updateShift: (id: string, body: unknown) => apiRequest<Shift>(`/roster/shifts/${id}`, { method: 'PATCH', body }),
  removeShift: (id: string) =>
    apiRequest<{ id: string; archived: boolean }>(`/roster/shifts/${id}`, { method: 'DELETE' }),

  listEntries: (params: ListParams = {}) => apiRequestPaged<RosterEntry>('/roster/entries', { query: params }),
  createEntry: (body: unknown) => apiRequest<RosterEntry>('/roster/entries', { method: 'POST', body }),
  updateEntry: (id: string, body: unknown) => apiRequest<RosterEntry>(`/roster/entries/${id}`, { method: 'PATCH', body }),
  removeEntry: (id: string) =>
    apiRequest<{ id: string; cancelled: boolean }>(`/roster/entries/${id}`, { method: 'DELETE' }),

  validate: (date: string, siteId?: string) =>
    apiRequest<RosterValidation>('/roster/validate', { query: { date, siteId } }),
  publish: (rosterDate: string, siteId?: string) =>
    apiRequest<{ rosterDate: string; published: number; warnings: unknown[] }>('/roster/publish', {
      method: 'POST',
      body: { rosterDate, siteId },
    }),
};

export const attendanceApi = {
  register: (params: ListParams = {}) => apiRequestPaged<RegisterRow>('/attendance/register', { query: params }),
  events: (params: ListParams = {}) => apiRequestPaged<AttendanceEvent>('/attendance/events', { query: params }),
  getEvent: (id: string) => apiRequest<AttendanceEvent>(`/attendance/events/${id}`),
  punch: (body: unknown) => apiRequest<AttendanceEvent>('/attendance/punch', { method: 'POST', body }),
  manualEntry: (body: unknown) => apiRequest<AttendanceEvent>('/attendance/manual', { method: 'POST', body }),
  recompute: (date: string, employeeId?: string) =>
    apiRequest<{ date: string; employees: number }>('/attendance/recompute', {
      method: 'POST',
      body: { date, employeeId },
    }),
};

export const exceptionsApi = {
  list: (params: ListParams = {}) => apiRequestPaged<AttendanceEvent>('/exceptions', { query: params }),
  approve: (id: string, note?: string) =>
    apiRequest<AttendanceEvent>(`/exceptions/${id}/approve`, { method: 'POST', body: { note } }),
  reject: (id: string, note?: string) =>
    apiRequest<AttendanceEvent>(`/exceptions/${id}/reject`, { method: 'POST', body: { note } }),
  bulk: (eventIds: string[], action: 'approve' | 'reject', note?: string) =>
    apiRequest<{ decided: number; skipped: string[]; action: string }>('/exceptions/bulk', {
      method: 'POST',
      body: { eventIds, action, note },
    }),
};

export const leaveApi = {
  list: (params: ListParams = {}) => apiRequestPaged<LeaveRequest>('/leave/requests', { query: params }),
  get: (id: string) => apiRequest<LeaveRequest>(`/leave/requests/${id}`),
  create: (body: unknown) => apiRequest<LeaveRequest>('/leave/requests', { method: 'POST', body }),
  decide: (id: string, status: 'APPROVED' | 'REJECTED', decisionNote?: string) =>
    apiRequest<LeaveRequest>(`/leave/requests/${id}/decision`, { method: 'POST', body: { status, decisionNote } }),

  balances: (params: ListParams = {}) => apiRequestPaged<LeaveBalance>('/leave/balances', { query: params }),
  updateBalance: (employeeId: string, body: unknown) =>
    apiRequest<LeaveBalance>(`/leave/balances/${employeeId}`, { method: 'PUT', body }),
};

export const dashboardApi = {
  overview: (date?: string) => apiRequest<DashboardOverview>('/dashboard/overview', { query: { date } }),
  trend: (days = 14) => apiRequest<TrendPoint[]>('/dashboard/trend', { query: { days } }),
  siteCoverage: (date?: string) => apiRequest<SiteCoverage[]>('/dashboard/site-coverage', { query: { date } }),
  departmentSplit: () => apiRequest<{ department: string; employees: number }[]>('/dashboard/department-split'),
};

export const payrollApi = {
  summary: (params: ListParams & { month: string }) =>
    apiRequestPaged<PayrollRow>('/payroll/summary', { query: params }),
};

export const reportsApi = {
  attendanceSummary: (from: string, to: string, siteId?: string) =>
    apiRequest<AttendanceSummaryReport>('/reports/attendance-summary', { query: { from, to, siteId } }),
  exceptions: (from: string, to: string) =>
    apiRequest<GenericReport>('/reports/exceptions', { query: { from, to } }),
  leave: (from: string, to: string) => apiRequest<GenericReport>('/reports/leave', { query: { from, to } }),

  exportCsv: (report: 'attendance-summary' | 'exceptions' | 'leave', from: string, to: string, siteId?: string) =>
    apiRequest<string>(`/reports/${report}`, { query: { from, to, siteId, format: 'csv' }, raw: true }),
};

export const settingsApi = {
  getConfig: () => apiRequest<WorkspaceConfig>('/settings/config'),
  updateConfig: (body: unknown) => apiRequest<WorkspaceConfig>('/settings/config', { method: 'PATCH', body }),
  workspace: () => apiRequest<WorkspaceSummary>('/settings/workspace'),
  holidays: (year?: number) =>
    apiRequest<{ id: string; date: string; name: string; scope: string }[]>('/settings/holidays', { query: { year } }),
  createHoliday: (body: unknown) => apiRequest('/settings/holidays', { method: 'POST', body }),
  deleteHoliday: (id: string) => apiRequest(`/settings/holidays/${id}`, { method: 'DELETE' }),
};

export const auditApi = {
  list: (params: ListParams = {}) => apiRequestPaged<AuditEntry>('/audit', { query: params }),
};

export type { Paged, PageMeta } from './apiClient';
export * from './types';
export { ApiError, tokenStore, setSessionExpiredHandler } from './apiClient';
