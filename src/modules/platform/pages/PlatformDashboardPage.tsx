import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Layers, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '../../../components/data';
import { CardSkeleton, EmptyState, ErrorState } from '../../../components/feedback/States';
import { CountUp } from '../../../components/ui/CountUp';
import { queryKeys } from '../../../core/query';
import { platformApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const PlatformDashboardPage: React.FC = () => {
  const dashboard = useQuery({
    queryKey: queryKeys.platformDashboard,
    queryFn: () => platformApi.dashboard(),
  });

  if (dashboard.isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Platform overview" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (dashboard.isError) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Platform overview" />
        <ErrorState message={describeApiError(dashboard.error)} onRetry={() => void dashboard.refetch()} />
      </div>
    );
  }

  const data = dashboard.data!;
  const currency = data.revenue.currency;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Platform"
        eyebrowIcon={<Layers className="w-3.5 h-3.5" aria-hidden />}
        title="Platform overview"
        description="Every figure here is an aggregate over live client records."
      />

      {data.clients.total === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients onboarded yet"
          description="Create your first client organisation to assign modules, configure billing and hand over an administrator account."
          action={{ label: 'Create a client', onClick: () => window.location.assign('/platform/clients') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Clients',
                value: data.clients.total,
                hint: `${data.clients.active} active · ${data.clients.suspended} suspended`,
                icon: Building2,
                tone: 'bg-brand-primary/10 text-brand-primary',
              },
              {
                label: 'Workspace users',
                value: data.accounts.workspaceUsers,
                hint: `${data.accounts.employees} employees · ${data.accounts.sites} sites`,
                icon: Users,
                tone: 'bg-brand-teal/10 text-brand-teal',
              },
              {
                label: 'Monthly recurring',
                value: data.revenue.monthlyRecurring,
                hint: `${money(data.revenue.annualRunRate, currency)} annual run rate`,
                icon: TrendingUp,
                tone: 'bg-status-leave/10 text-status-leave',
                isMoney: true,
              },
              {
                label: 'Outstanding',
                value: data.revenue.outstanding,
                hint: `${data.revenue.overdueInvoices} overdue invoice${data.revenue.overdueInvoices === 1 ? '' : 's'}`,
                icon: CreditCard,
                tone: 'bg-status-late/10 text-status-late',
                isMoney: true,
              },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-txt-secondary">{tile.label}</span>
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tile.tone}`}>
                      <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-txt-primary tabular-nums leading-none">
                    {tile.isMoney ? money(tile.value, currency) : <CountUp end={tile.value} />}
                  </div>
                  <p className="text-[11px] text-txt-secondary">{tile.hint}</p>
                </div>
              );
            })}
          </div>

          {data.subscriptions.expiringSoon > 0 && (
            <div className="p-4 rounded-2xl border border-status-late/30 bg-status-late/5 text-xs">
              <span className="font-extrabold text-txt-primary">
                {data.subscriptions.expiringSoon} subscription{data.subscriptions.expiringSoon === 1 ? '' : 's'} expire within{' '}
                {data.subscriptions.expiringWithinDays} days.
              </span>{' '}
              <Link to="/platform/clients" className="font-bold text-brand-primary hover:underline">
                Review renewals →
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-txt-primary">Module uptake</h2>
              <ul className="space-y-2">
                {data.moduleUptake.map((module) => {
                  const share = data.clients.total > 0 ? (module.clients / data.clients.total) * 100 : 0;
                  return (
                    <li key={module.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-txt-primary font-semibold">{module.name}</span>
                        <span className="text-txt-secondary tabular-nums">
                          {module.clients} / {data.clients.total}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-txt-primary">Recently onboarded</h2>
              <ul className="divide-y divide-border/60">
                {data.recentClients.map((client) => (
                  <li key={client.id}>
                    <Link
                      to={`/platform/clients/${client.id}`}
                      className="flex items-center justify-between py-2.5 text-xs hover:bg-bg-surface-2/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block font-bold text-txt-primary truncate">{client.name}</span>
                        <span className="block text-[10px] text-txt-secondary">
                          {client.code} · {client.employees} employees · {client.sites} sites
                        </span>
                      </span>
                      <span className="font-bold text-txt-primary tabular-nums flex-shrink-0">
                        {money(client.monthlyAmount, currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-txt-primary">Pricing mix</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.pricingSpread.map((entry) => (
                <div key={entry.pricingModel} className="p-3 rounded-xl bg-bg-surface-2 border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-txt-secondary">
                    {entry.pricingModel.replace('_', ' ')}
                  </div>
                  <div className="text-lg font-black text-txt-primary tabular-nums mt-0.5">{entry.clients}</div>
                  <div className="text-[10px] text-txt-secondary tabular-nums">
                    {money(entry.monthlyAmount, currency)} / mo
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
