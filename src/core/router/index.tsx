import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { AppShell } from '../../components/layout/AppShell';

// Route Code-Splitting with React.lazy
const DashboardPage = lazy(() => import('../../modules/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AttendanceRegisterPage = lazy(() => import('../../modules/attendance/pages/AttendanceRegisterPage').then(m => ({ default: m.AttendanceRegisterPage })));
const ExceptionsPage = lazy(() => import('../../modules/exceptions/pages/ExceptionsPage').then(m => ({ default: m.ExceptionsPage })));
const ClientListPage = lazy(() => import('../../modules/clients/pages/ClientListPage').then(m => ({ default: m.ClientListPage })));
const ClientDetailPage = lazy(() => import('../../modules/clients/pages/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })));
const EmployeeListPage = lazy(() => import('../../modules/employees/pages/EmployeeListPage').then(m => ({ default: m.EmployeeListPage })));
const EmployeeProfilePage = lazy(() => import('../../modules/employees/pages/EmployeeProfilePage').then(m => ({ default: m.EmployeeProfilePage })));
const SiteListPage = lazy(() => import('../../modules/sites/pages/SiteListPage').then(m => ({ default: m.SiteListPage })));
const SiteDetailPage = lazy(() => import('../../modules/sites/pages/SiteDetailPage').then(m => ({ default: m.SiteDetailPage })));
const RosterPage = lazy(() => import('../../modules/roster/pages/RosterPage').then(m => ({ default: m.RosterPage })));
const LeavePage = lazy(() => import('../../modules/leave/pages/LeavePage').then(m => ({ default: m.LeavePage })));
const PayrollPage = lazy(() => import('../../modules/payroll/pages/PayrollPage').then(m => ({ default: m.PayrollPage })));
const ReportsPage = lazy(() => import('../../modules/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const RolesPage = lazy(() => import('../../modules/roles/pages/RolesPage').then(m => ({ default: m.RolesPage })));
const AuditPage = lazy(() => import('../../modules/audit/pages/AuditPage').then(m => ({ default: m.AuditPage })));
const SettingsPage = lazy(() => import('../../modules/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SuperAdminPage = lazy(() => import('../../modules/superadmin/pages/SuperAdminPage').then(m => ({ default: m.SuperAdminPage })));
const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));

// Loading Skeleton Placeholder for Route Suspense
const PageFallback = () => (
  <div className="space-y-6 p-2 animate-pulse">
    <div className="h-7 bg-bg-surface-2 rounded-xl w-56 skeleton-shimmer" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-bg-surface-2 rounded-2xl skeleton-shimmer" />
      ))}
    </div>
    <div className="h-72 bg-bg-surface-2 rounded-2xl skeleton-shimmer" />
  </div>
);

// Protected Layout: Keeps AppShell (Sidebar & TopBar) permanently mounted
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If Super Admin accesses root '/', redirect to Super Admin Dashboard
  if (user?.roleCode === 'SUPER_ADMIN' && window.location.pathname === '/') {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<PageFallback />}><LoginPage /></Suspense>} />

      {/* Protected Routes Layout Wrapper */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendanceRegisterPage />} />
        <Route path="/exceptions" element={<ExceptionsPage />} />
        <Route path="/clients" element={<ClientListPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/:id" element={<EmployeeProfilePage />} />
        <Route path="/sites" element={<SiteListPage />} />
        <Route path="/sites/:id" element={<SiteDetailPage />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* Super Admin Module Routes */}
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminPage />} />
        <Route path="/superadmin/clients" element={<SuperAdminPage />} />
        <Route path="/superadmin/control" element={<SuperAdminPage />} />

        <Route path="/roles" element={<RolesPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
