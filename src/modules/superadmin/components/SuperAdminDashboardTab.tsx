import React from 'react';
import {
  Building2,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Layers,
  ExternalLink,
  Plus,
  DollarSign
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

  const activeSubscriptions = clients.filter((c) => c.subscription?.status === 'ACTIVE').length;
  const expiringSubscriptions = clients.filter((c) => c.subscription?.status === 'PENDING_RENEWAL' || c.subscription?.status === 'EXPIRED').length;

  const totalMRR = clients.reduce((sum, c) => sum + (c.subscription?.monthlyEstimatedAmount || 0), 0);
  const activeClientPct = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Exactly 4 Clean Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Client Fleet */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Total Client Fleet
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[32px] font-extrabold tracking-tight text-txt-primary leading-none">
              {totalClients}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {activeClientPct}% Active
            </span>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-txt-secondary font-medium">
            <span>{activeClients} Active Organization</span>
            <span>{inactiveClients} Suspended</span>
          </div>
        </div>

        {/* Metric 2: Estimated MRR */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Platform MRR
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[28px] font-extrabold tracking-tight text-txt-primary leading-none">
              ₹{totalMRR.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Recurring
            </span>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-txt-secondary font-medium">
            <span>Monthly Revenue</span>
            <span className="font-bold text-txt-primary">{totalClients} Billing Contracts</span>
          </div>
        </div>

        {/* Metric 3: Total Admin Accounts */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Provisioned Admins
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[32px] font-extrabold tracking-tight text-txt-primary leading-none">
              {totalAdminAccounts}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
              100% Provisioned
            </span>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-txt-secondary font-medium">
            <span>Client Admin Accounts</span>
            <span>Verified Credentials</span>
          </div>
        </div>

        {/* Metric 4: Subscription Health */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-txt-secondary uppercase tracking-wider font-mono">
              Contract Health
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[32px] font-extrabold tracking-tight text-txt-primary leading-none">
              100%
            </span>
            {expiringSubscriptions > 0 ? (
              <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {expiringSubscriptions} Expiring
              </span>
            ) : (
              <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                0 Overdue
              </span>
            )}
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-txt-secondary font-medium">
            <span>Platform Subscriptions</span>
            <span className="font-bold text-txt-primary">{activeSubscriptions} Active</span>
          </div>
        </div>
      </div>

      {/* Main Client Fleet & Subscription Telemetry Table */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-txt-primary">
                Client Fleet Directory &amp; Subscription Telemetry
              </h3>
            </div>
            <p className="text-xs text-txt-secondary mt-0.5">
              Overview of registered client organizations, administrator credentials, billing models, and account status
            </p>
          </div>

          <button
            onClick={() => onSelectTab('clients')}
            className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
          >
            Manage Client Directory <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-txt-secondary uppercase tracking-wider font-mono text-[10px] pb-3 border-b border-border">
                <th className="pb-3 pl-1">Client Organization</th>
                <th className="pb-3">Admin Email</th>
                <th className="pb-3">Pricing Model</th>
                <th className="pb-3">Estimated Monthly Fee</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3 text-right pr-2">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-bg-surface-2/60 transition-colors">
                  <td className="py-3 pl-1 font-bold text-txt-primary flex items-center gap-3">
                    <img
                      src={c.logoUrl}
                      alt={c.companyName || c.name}
                      className="w-8 h-8 rounded-xl object-cover border border-border shadow-sm flex-shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-txt-primary">{c.companyName || c.name}</div>
                      <div className="text-[10px] text-txt-secondary font-mono">Code: {c.clientCode || c.code}</div>
                    </div>
                  </td>
                  <td className="py-3 text-txt-secondary font-mono">
                    {c.adminAccount?.email}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-txt-secondary">
                    <span className="px-2.5 py-1 rounded-lg bg-bg-surface-2 border border-border text-txt-primary font-bold">
                      {c.subscription?.pricingModel}
                    </span>
                  </td>
                  <td className="py-3 font-extrabold text-txt-primary">
                    ₹{c.subscription?.monthlyEstimatedAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => onSelectTab('control')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 text-xs font-bold transition-all inline-flex items-center gap-1"
                    >
                      Super Admin Control <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
