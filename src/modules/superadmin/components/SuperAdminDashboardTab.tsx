import React from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
  Sparkles,
  Zap,
  Plus,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { SuperAdminClient, PaymentTransaction } from '../types';

interface SuperAdminDashboardTabProps {
  clients: SuperAdminClient[];
  transactions: PaymentTransaction[];
  onOpenCreateClient: () => void;
  onOpenRecordPayment: () => void;
  onSelectTab: (tab: string) => void;
}

export const SuperAdminDashboardTab: React.FC<SuperAdminDashboardTabProps> = ({
  clients,
  transactions,
  onOpenCreateClient,
  onOpenRecordPayment,
  onSelectTab
}) => {
  // Platform-level stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const inactiveClients = clients.filter((c) => c.status !== 'ACTIVE').length;
  const totalAdminAccounts = clients.map((c) => c.adminAccount).length;

  const activeSubscriptions = clients.filter((c) => c.subscription.status === 'ACTIVE').length;
  const expiringSubscriptions = clients.filter((c) => c.subscription.status === 'PENDING_RENEWAL' || c.subscription.status === 'EXPIRED').length;

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalPaidToDate, 0);
  const pendingPaymentsAmount = transactions
    .filter((t) => t.status === 'PENDING' || t.status === 'OVERDUE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMRR = clients.reduce((sum, c) => sum + (c.subscription.monthlyEstimatedAmount || 0), 0);

  // Pricing model distribution
  const pricingModelCounts = clients.reduce(
    (acc, c) => {
      acc[c.subscription.pricingModel] = (acc[c.subscription.pricingModel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Platform Analytics &amp; Super Admin Telemetry
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              WatchTower Platform Command Center
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Global platform metrics, tenant growth telemetry, subscription lifecycle health, and consolidated financial performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateClient}
              className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add New Client
            </button>
            <button
              onClick={onOpenRecordPayment}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* KPI Platform Cards Grid (2 rows x 4 cols = 8 Platform Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Clients */}
        <div className="bg-bg-surface border border-border rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Total Clients
            </span>
            <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-txt-primary">{totalClients}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {activeClients} Active
            </span>
          </div>
          <p className="text-[11px] text-txt-secondary pt-1 border-t border-border/50">
            {inactiveClients} Inactive / Suspended tenants
          </p>
        </div>

        {/* Metric 2: Total Admin Accounts */}
        <div className="bg-bg-surface border border-border rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Total Admin Accounts
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-txt-primary">{totalAdminAccounts}</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              100% Provisioned
            </span>
          </div>
          <p className="text-[11px] text-txt-secondary pt-1 border-t border-border/50">
            One Admin account per client organization
          </p>
        </div>

        {/* Metric 3: Active Subscriptions */}
        <div className="bg-bg-surface border border-border rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Active Subscriptions
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-txt-primary">{activeSubscriptions}</span>
            {expiringSubscriptions > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {expiringSubscriptions} Expiring
              </span>
            )}
          </div>
          <p className="text-[11px] text-txt-secondary pt-1 border-t border-border/50">
            Active platform contracts
          </p>
        </div>

        {/* Metric 4: Total Platform Revenue */}
        <div className="bg-bg-surface border border-border rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Total Revenue Collected
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-txt-primary">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-txt-secondary pt-1 border-t border-border/50">
            Cumulative platform revenue collected
          </p>
        </div>
      </div>

      {/* Row 2 Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Model & Billing Structure Summary */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-primary" />
              Subscription Billing Models
            </h3>
            <button
              onClick={() => onSelectTab('clients')}
              className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1"
            >
              View Clients <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-txt-secondary">Monthly-based (Flat)</span>
                <span className="font-bold text-txt-primary">{pricingModelCounts['MONTHLY'] || 0} Clients</span>
              </div>
              <div className="w-full h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full"
                  style={{ width: `${((pricingModelCounts['MONTHLY'] || 0) / totalClients) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-txt-secondary">User / Guard-based</span>
                <span className="font-bold text-txt-primary">{pricingModelCounts['PER_USER'] || 0} Clients</span>
              </div>
              <div className="w-full h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${((pricingModelCounts['PER_USER'] || 0) / totalClients) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-txt-secondary">Daily-based</span>
                <span className="font-bold text-txt-primary">{pricingModelCounts['DAILY'] || 0} Clients</span>
              </div>
              <div className="w-full h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${((pricingModelCounts['DAILY'] || 0) / totalClients) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-txt-secondary">Custom Enterprise</span>
                <span className="font-bold text-txt-primary">{pricingModelCounts['CUSTOM'] || 0} Clients</span>
              </div>
              <div className="w-full h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${((pricingModelCounts['CUSTOM'] || 0) / totalClients) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Client Growth & Subscription Summary Table */}
        <div className="lg:col-span-2 bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              Platform Client Fleet &amp; Subscription Telemetry
            </h3>
            <button
              onClick={() => onSelectTab('clients')}
              className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1"
            >
              Client Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-txt-secondary uppercase tracking-wider font-mono text-[10px] pb-2 border-b border-border">
                  <th className="pb-2">Client Name</th>
                  <th className="pb-2">Admin Email</th>
                  <th className="pb-2">Pricing Model</th>
                  <th className="pb-2">Monthly Fee</th>
                  <th className="pb-2 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-bg-surface-2/60 transition-colors">
                    <td className="py-2.5 font-bold text-txt-primary flex items-center gap-2">
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className="w-6 h-6 rounded-md object-cover border border-border"
                      />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-2.5 text-txt-secondary font-mono">
                      {c.adminAccount.email}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-txt-secondary">
                      {c.subscription.pricingModel}
                    </td>
                    <td className="py-2.5 font-bold text-txt-primary">
                      ₹{c.subscription.monthlyEstimatedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
