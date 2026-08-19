import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  KeyRound,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../../components/data';
import { CardSkeleton, EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { RealtimeClock } from '../../../components/ui/RealtimeClock';
import { CountUp } from '../../../components/ui/CountUp';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { dashboardApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

// Recharts is heavy; it stays out of the initial bundle.
const AttendanceTrendChart = lazy(() => import('../components/AttendanceTrendChart').then((m) => ({ default: m.AttendanceTrendChart })));

interface MetricProps {
  label: string;
  value: number;
  hint: string;
  icon: React.ElementType;
  tone: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, hint, icon: Icon, tone }) => (
  <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
    <div className="flex items-start justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wide text-txt-secondary">{label}</span>
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden />
      </span>
    </div>
    <div className="text-3xl font-black text-txt-primary tabular-nums leading-none">
      <CountUp end={value} />
    </div>
    <p className="text-[11px] text-txt-secondary">{hint}</p>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user, can, hasModule } = useAuth();

  const overview = useQuery({
    queryKey: queryKeys.dashboard(undefined),
    queryFn: () => dashboardApi.overview(),
  });

  const coverage = useQuery({
    queryKey: queryKeys.dashboardCoverage(undefined),
    queryFn: () => dashboardApi.siteCoverage(),
    enabled: hasModule('SITES') && can('SITE_VIEW'),
  });

  if (overview.isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Operations dashboard" description="Today's workforce position." />
        <CardSkeleton count={4} />
        <div className="h-64 rounded-2xl bg-bg-surface-2 animate-pulse" aria-hidden />
      </div>
    );
  }

  if (overview.isError) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Operations dashboard" />
        <ErrorState message={describeApiError(overview.error)} onRetry={() => void overview.refetch()} />
      </div>
    );
  }

  const data = overview.data!;
  const workspaceIsEmpty = data.workforce.totalEmployees === 0 && data.deployment.sites === 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Live operations"
        eyebrowIcon={<ShieldCheck className="w-3.5 h-3.5" aria-hidden />}
        title={`Good to see you, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description={`Attendance position for ${new Date(`${data.date}T00:00:00Z`).toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}.`}
        actions={<RealtimeClock />}
      />

      {workspaceIsEmpty ? (
        <EmptyState
          icon={Building2}
          title="Your workspace is ready to set up"
          description={
            data.deployment.roles === 0
              ? 'Start by defining the roles your team will hold — employees cannot be added until at least one role exists.'
              : 'Add your sites and the posts you guard, then build the roster your team will work to.'
          }
          action={
            data.deployment.roles === 0 && can('ROLE_CREATE')
              ? { label: 'Configure roles', onClick: () => window.location.assign('/roles'), icon: <KeyRound className="w-3.5 h-3.5" /> }
              : can('SITE_CREATE')
                ? { label: 'Add your first site', onClick: () => window.location.assign('/sites'), icon: <Building2 className="w-3.5 h-3.5" /> }
                : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              label="Active employees"
              value={data.workforce.activeEmployees}
              hint={`${data.workforce.totalEmployees} on the books · ${data.deployment.sites} site${data.deployment.sites === 1 ? '' : 's'}`}
              icon={Users}
              tone="bg-brand-primary/10 text-brand-primary"
            />
            <Metric
              label="Present today"
              value={data.today.present}
              hint={
                data.today.attendanceRate === null
                  ? 'No attendance recorded yet today'
                  : `${data.today.attendanceRate}% of ${data.today.expected} expected`
              }
              icon={CheckCircle2}
              tone="bg-brand-teal/10 text-brand-teal"
            />
            <Metric
              label="Late arrivals"
              value={data.today.late}
              hint={`${data.today.earlyExit} early departure${data.today.earlyExit === 1 ? '' : 's'}`}
              icon={Clock}
              tone="bg-status-late/10 text-status-late"
            />
            <Metric
              label="Absent"
              value={data.today.absent}
              hint={`${data.today.onLeave} on approved leave`}
              icon={AlertTriangle}
              tone="bg-status-absent/10 text-status-absent"
            />
          </div>

          {(data.queues.pendingExceptions > 0 || data.queues.pendingLeave > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.queues.pendingExceptions > 0 && can('EXCEPTION_VIEW') && (
                <Link
                  to="/exceptions"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-status-late/30 bg-status-late/5 hover:bg-status-late/10 transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-status-late/15 text-status-late flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-txt-primary">
                      {data.queues.pendingExceptions} attendance exception
                      {data.queues.pendingExceptions === 1 ? '' : 's'} awaiting review
                    </span>
                    <span className="block text-[11px] text-txt-secondary">
                      Those days stay frozen until each one is decided.
                    </span>
                  </span>
                </Link>
              )}

              {data.queues.pendingLeave > 0 && can('LEAVE_VIEW') && (
                <Link
                  to="/leave"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-txt-primary">
                      {data.queues.pendingLeave} leave request{data.queues.pendingLeave === 1 ? '' : 's'} to decide
                    </span>
                    <span className="block text-[11px] text-txt-secondary">Approving updates the roster and balances.</span>
                  </span>
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-txt-primary">Attendance trend</h2>
                <p className="text-[11px] text-txt-secondary">Share of expected attendance met, over the last two weeks.</p>
              </div>
              <Suspense fallback={<div className="h-56 rounded-xl bg-bg-surface-2 animate-pulse" aria-hidden />}>
                <AttendanceTrendChart />
              </Suspense>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-brand-primary" aria-hidden /> Today's deployment
                </h2>
              </div>
              <dl className="space-y-2.5 text-xs">
                {[
                  ['Sites', data.deployment.sites],
                  ['Posts', data.deployment.posts],
                  ['Shifts defined', data.deployment.shifts],
                  ['Rostered today', data.deployment.rosteredToday],
                  ['Roles configured', data.deployment.roles],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <dt className="text-txt-secondary">{label}</dt>
                    <dd className="font-bold text-txt-primary tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {hasModule('SITES') && can('SITE_VIEW') && (
            <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border/70">
                <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-primary" aria-hidden /> Site coverage
                </h2>
                <Link to="/sites" className="text-xs font-bold text-brand-primary hover:underline">
                  All sites →
                </Link>
              </div>

              {coverage.isLoading ? (
                <LoadingState label="Loading site coverage…" />
              ) : coverage.isError ? (
                <ErrorState message={describeApiError(coverage.error)} onRetry={() => void coverage.refetch()} />
              ) : (coverage.data ?? []).length === 0 ? (
                <p className="p-8 text-center text-xs text-txt-secondary">
                  No active sites yet. Add a site to start tracking coverage.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Site</th>
                        <th scope="col" className="px-4 py-3">Required</th>
                        <th scope="col" className="px-4 py-3">Rostered</th>
                        <th scope="col" className="px-4 py-3">Present</th>
                        <th scope="col" className="px-4 py-3 text-right">Coverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {coverage.data!.map((site) => (
                        <tr key={site.siteId} className="hover:bg-bg-surface-2/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-txt-primary">{site.siteName}</div>
                            <div className="text-[10px] text-txt-secondary">{site.city}</div>
                          </td>
                          <td className="px-4 py-3 tabular-nums">{site.required}</td>
                          <td className="px-4 py-3 tabular-nums">{site.rostered}</td>
                          <td className="px-4 py-3 tabular-nums font-semibold text-brand-teal">{site.present}</td>
                          <td className="px-4 py-3 text-right">
                            {site.coverage === null ? (
                              <span className="text-txt-tertiary">—</span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                                  site.coverage >= 90
                                    ? 'bg-brand-teal/10 text-brand-teal'
                                    : site.coverage >= 60
                                      ? 'bg-status-late/10 text-status-late'
                                      : 'bg-status-absent/10 text-status-absent'
                                }`}
                              >
                                {site.coverage}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
