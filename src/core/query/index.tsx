import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../../services';

/**
 * Server-state configuration.
 *
 * Retrying a 401, 403 or 404 is pointless and, for a locked-out user, produces
 * a burst of failing requests — so only genuine faults are retried.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

/** Query keys in one place, so an invalidation cannot miss a screen. */
export const queryKeys = {
  session: ['session'] as const,
  workspace: ['workspace'] as const,
  catalogModules: ['catalog', 'modules'] as const,
  catalogPermissions: ['catalog', 'permissions'] as const,

  platformDashboard: ['platform', 'dashboard'] as const,
  platformClients: (params: unknown) => ['platform', 'clients', params] as const,
  platformClient: (id: string) => ['platform', 'client', id] as const,
  platformInvoices: (params: unknown) => ['platform', 'invoices', params] as const,
  platformAudit: (params: unknown) => ['platform', 'audit', params] as const,

  dashboard: (date?: string) => ['dashboard', 'overview', date ?? 'today'] as const,
  dashboardTrend: (days: number) => ['dashboard', 'trend', days] as const,
  dashboardCoverage: (date?: string) => ['dashboard', 'coverage', date ?? 'today'] as const,

  roles: (params: unknown) => ['roles', params] as const,
  employees: (params: unknown) => ['employees', params] as const,
  employee: (id: string) => ['employee', id] as const,
  employeeKyc: (id: string) => ['employee', id, 'kyc'] as const,
  employeeBank: (id: string) => ['employee', id, 'bank'] as const,

  sites: (params: unknown) => ['sites', params] as const,
  site: (id: string) => ['site', id] as const,
  posts: (siteId: string) => ['site', siteId, 'posts'] as const,

  shifts: (params: unknown) => ['shifts', params] as const,
  rosterEntries: (params: unknown) => ['roster', 'entries', params] as const,
  rosterValidation: (date: string, siteId?: string) => ['roster', 'validate', date, siteId ?? 'all'] as const,

  register: (params: unknown) => ['attendance', 'register', params] as const,
  exceptions: (params: unknown) => ['exceptions', params] as const,
  leave: (params: unknown) => ['leave', params] as const,
  leaveBalances: (params: unknown) => ['leave', 'balances', params] as const,
  payroll: (params: unknown) => ['payroll', params] as const,
  reports: (kind: string, params: unknown) => ['reports', kind, params] as const,
  settings: ['settings', 'config'] as const,
  holidays: (year?: number) => ['settings', 'holidays', year ?? 'all'] as const,
  audit: (params: unknown) => ['audit', params] as const,
};
