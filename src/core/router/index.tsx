import React, { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { AppShell } from '../../components/layout/AppShell';
import { LoadingState, ModuleLockedState, PermissionDeniedState } from '../../components/feedback/States';
import { ROUTE_GUARDS, firstAccessibleWorkspacePath } from '../navigation';

// Route-level code splitting: only the shell and the landing route are eager.
const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AttendanceRegisterPage = lazy(() => import('../../modules/attendance/pages/AttendanceRegisterPage').then((m) => ({ default: m.AttendanceRegisterPage })));
const ExceptionsPage = lazy(() => import('../../modules/exceptions/pages/ExceptionsPage').then((m) => ({ default: m.ExceptionsPage })));
const EmployeeListPage = lazy(() => import('../../modules/employees/pages/EmployeeListPage').then((m) => ({ default: m.EmployeeListPage })));
const EmployeeProfilePage = lazy(() => import('../../modules/employees/pages/EmployeeProfilePage').then((m) => ({ default: m.EmployeeProfilePage })));
const SiteListPage = lazy(() => import('../../modules/sites/pages/SiteListPage').then((m) => ({ default: m.SiteListPage })));
const SiteDetailPage = lazy(() => import('../../modules/sites/pages/SiteDetailPage').then((m) => ({ default: m.SiteDetailPage })));
const RosterPage = lazy(() => import('../../modules/roster/pages/RosterPage').then((m) => ({ default: m.RosterPage })));
const LeavePage = lazy(() => import('../../modules/leave/pages/LeavePage').then((m) => ({ default: m.LeavePage })));
const PayrollPage = lazy(() => import('../../modules/payroll/pages/PayrollPage').then((m) => ({ default: m.PayrollPage })));
const ReportsPage = lazy(() => import('../../modules/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const RolesPage = lazy(() => import('../../modules/roles/pages/RolesPage').then((m) => ({ default: m.RolesPage })));
const AuditPage = lazy(() => import('../../modules/audit/pages/AuditPage').then((m) => ({ default: m.AuditPage })));
const SettingsPage = lazy(() => import('../../modules/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));

const PlatformDashboardPage = lazy(() => import('../../modules/platform/pages/PlatformDashboardPage').then((m) => ({ default: m.PlatformDashboardPage })));
const PlatformClientsPage = lazy(() => import('../../modules/platform/pages/PlatformClientsPage').then((m) => ({ default: m.PlatformClientsPage })));
const PlatformClientDetailPage = lazy(() => import('../../modules/platform/pages/PlatformClientDetailPage').then((m) => ({ default: m.PlatformClientDetailPage })));
const PlatformBillingPage = lazy(() => import('../../modules/platform/pages/PlatformBillingPage').then((m) => ({ default: m.PlatformBillingPage })));
const PlatformActivityPage = lazy(() => import('../../modules/platform/pages/PlatformActivityPage').then((m) => ({ default: m.PlatformActivityPage })));
const PlatformAccessControlPage = lazy(() => import('../../modules/platform/pages/PlatformAccessControlPage').then((m) => ({ default: m.PlatformAccessControlPage })));
const ImpersonationCallbackPage = lazy(() => import('../../modules/platform/pages/ImpersonationCallbackPage').then((m) => ({ default: m.ImpersonationCallbackPage })));

const RouteFallback = () => <LoadingState label="Loading page…" />;

/**
 * Gates a workspace route on the module the client owns and the permission the
 * role grants. Typing the URL directly lands on the same explanation the
 * navigation would have implied by hiding the link — and the API refuses the
 * data regardless, so this is presentation rather than the security boundary.
 */
const GuardedRoute: React.FC = () => {
  const location = useLocation();
  const { hasModule, can } = useAuth();
  const guard = ROUTE_GUARDS[location.pathname] ?? ROUTE_GUARDS[`/${location.pathname.split('/')[1]}`];

  if (!guard) return <Outlet />;
  if (!hasModule(guard.module)) return <ModuleLockedState moduleName={guard.label} />;
  if (!can(guard.permission)) return <PermissionDeniedState action="open this section" />;

  return <Outlet />;
};

const WorkspaceLayout: React.FC = () => {
  const { status, isAuthenticated, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Restoring your session…" className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // A platform operator has no workspace data; send them to their own console.
  if (isSuperAdmin) return <Navigate to="/platform" replace />;

  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <GuardedRoute />
      </Suspense>
    </AppShell>
  );
};

const PlatformLayout: React.FC = () => {
  const { status, isAuthenticated, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Restoring your session…" className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};

/** Landing page for a user whose role opens no destination at all. */
const NoAccessPage: React.FC = () => (
  <AppShell>
    <PermissionDeniedState action="open any section of this workspace" />
  </AppShell>
);

const RootRedirect: React.FC = () => {
  const { status, isAuthenticated, isSuperAdmin, user } = useAuth();

  if (status === 'loading') return <LoadingState label="Restoring your session…" className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/platform" replace />;

  const destination = firstAccessibleWorkspacePath(user?.modules ?? [], user?.permissions ?? []);
  return destination === '/' ? <Navigate to="/dashboard" replace /> : <Navigate to={destination} replace />;
};

export const AppRouter: React.FC = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <Suspense fallback={<RouteFallback />}>
          <LoginPage />
        </Suspense>
      }
    />
    {/* Deliberately outside every guarded layout: this tab has no session
        until the ticket is spent, so a guard here would bounce it to /login
        before it ever had the chance. */}
    <Route
      path="/platform/impersonate"
      element={
        <Suspense fallback={<RouteFallback />}>
          <ImpersonationCallbackPage />
        </Suspense>
      }
    />
    <Route path="/no-access" element={<NoAccessPage />} />
    <Route path="/" element={<RootRedirect />} />

    <Route element={<WorkspaceLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/attendance" element={<AttendanceRegisterPage />} />
      <Route path="/exceptions" element={<ExceptionsPage />} />
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/employees/:id" element={<EmployeeProfilePage />} />
      <Route path="/sites" element={<SiteListPage />} />
      <Route path="/sites/:id" element={<SiteDetailPage />} />
      <Route path="/roster" element={<RosterPage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>

    <Route element={<PlatformLayout />}>
      <Route path="/platform" element={<PlatformDashboardPage />} />
      <Route path="/platform/clients" element={<PlatformClientsPage />} />
      <Route path="/platform/clients/:id" element={<PlatformClientDetailPage />} />
      <Route path="/platform/billing" element={<PlatformBillingPage />} />
      <Route path="/platform/activity" element={<PlatformActivityPage />} />
      <Route path="/platform/access" element={<PlatformAccessControlPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
