import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Search,
  ExternalLink,
  Lock,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SuperAdminClient, BypassAuditLog } from '../types';

interface SuperAdminControlTabProps {
  clients: SuperAdminClient[];
  bypassLogs: BypassAuditLog[];
  onInitiateBypassInNewTab: (client: SuperAdminClient, reason: string) => void;
}

export const SuperAdminControlTab: React.FC<SuperAdminControlTabProps> = ({
  clients,
  bypassLogs,
  onInitiateBypassInNewTab
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessReason, setAccessReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminAccount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminAccount.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchNewTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessReason.trim()) {
      setErrorMsg('Mandatory: Please specify a reason for logging into this Admin account.');
      return;
    }
    setErrorMsg('');
    onInitiateBypassInNewTab(selectedClient, accessReason.trim());
    setAccessReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feature Intro Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Secure Super Admin Control Panel &amp; Account Bypass
            </div>
            <h3 className="text-xl font-black tracking-tight">
              Passwordless Client Admin Account Access
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Select any client organization from the fleet below to review associated Admin account parameters and launch a secure troubleshooting session in a <strong className="text-white underline font-bold">new browser tab</strong> without requiring or exposing passwords.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-amber-300 text-xs font-semibold">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Zero Password Exposure &bull; Multi-Tab Session</span>
          </div>
        </div>
      </div>

      {/* Main Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Client Selector Dropdown (4 cols) */}
        <div className="lg:col-span-5 bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="text-sm font-bold text-txt-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-primary" />
              1. Select Client Organization
            </h4>
            <span className="text-xs font-mono font-bold text-txt-secondary">
              {clients.length} Total Fleet
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-txt-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, code, or admin email..."
              className="w-full pl-9 pr-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary placeholder-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Client Selection Dropdown & Cards List */}
          <div>
            <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">
              Client Selector Dropdown
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-sm font-bold text-txt-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {filteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — Admin: {c.adminAccount.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clickable Quick Select List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
            {filteredClients.map((c) => {
              const isSelected = c.id === selectedClientId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-txt-primary font-bold shadow-sm'
                      : 'border-border/80 bg-bg-surface-2/60 text-txt-secondary hover:bg-bg-surface-2 hover:text-txt-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.logoUrl}
                      alt={c.name}
                      className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-txt-primary leading-tight">{c.name}</div>
                      <div className="text-[10px] text-txt-secondary font-mono mt-0.5">
                        Admin: {c.adminAccount.name} ({c.adminAccount.email})
                      </div>
                    </div>
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      c.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Client Verification & Login in New Tab Button (7 cols) */}
        <div className="lg:col-span-7 bg-bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                2. Target Client &amp; Admin Verification
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedClient.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-rose-500/10 text-rose-600'
                }`}
              >
                {selectedClient.status} ACCOUNT
              </span>
            </div>

            {/* Target Client Profile Card */}
            <div className="p-4 bg-bg-surface-2 rounded-2xl border border-border/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedClient.logoUrl}
                    alt={selectedClient.name}
                    className="w-12 h-12 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-txt-primary">
                      {selectedClient.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-txt-secondary mt-0.5">
                      <span>Code: {selectedClient.code}</span>
                      <span>&bull;</span>
                      <span>Tax ID: {selectedClient.taxId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-txt-secondary text-[10px]">Pricing Model</div>
                  <div className="font-bold text-amber-600 uppercase">
                    {selectedClient.subscription.pricingModel}
                  </div>
                </div>
              </div>

              {/* Admin Account Details */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Associated Admin Name
                  </span>
                  <span className="font-bold text-txt-primary flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
                    {selectedClient.adminAccount.name}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Admin Email Address
                  </span>
                  <span className="font-mono text-txt-primary mt-0.5 block">
                    {selectedClient.adminAccount.email}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Admin Contact Phone
                  </span>
                  <span className="font-semibold text-txt-primary mt-0.5 block">
                    {selectedClient.adminAccount.phone}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Last Known Login
                  </span>
                  <span className="font-mono text-txt-secondary mt-0.5 block">
                    {selectedClient.adminAccount.lastLoginAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Mandatory Reason Form */}
            <form onSubmit={handleLaunchNewTab} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1.5">
                  Audit Log Justification / Reason <span className="text-status-absent">*</span>
                </label>
                <input
                  type="text"
                  value={accessReason}
                  onChange={(e) => {
                    setAccessReason(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Support ticket #4029 — Troubleshooting roster shift sync issue for client"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary placeholder-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {errorMsg && (
                  <p className="text-xs text-status-absent mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Prominent Action Button: Login to Client Account */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShieldAlert className="w-5 h-5 text-slate-950" />
                  <span>Login to Client Account</span>
                  <ExternalLink className="w-4 h-4 text-slate-950 ml-1" />
                </button>
                <p className="text-[11px] text-center text-txt-secondary mt-2">
                  ⚡ Opens <strong className="text-txt-primary">{selectedClient.adminAccount.name}</strong> ({selectedClient.name}) in a <span className="underline font-bold text-txt-primary">new browser tab</span>. The original Super Admin tab will remain open.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bypass Audit Trail List */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Audit Trail: Past &amp; Active Bypass Sessions ({bypassLogs.length})
          </h4>
          <span className="text-xs font-mono text-txt-secondary">Cryptographic Audit Compliance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-bg-surface-2 text-txt-secondary uppercase tracking-wider font-mono text-[10px] border-b border-border">
                <th className="px-4 py-2.5">Super Admin Actor</th>
                <th className="px-4 py-2.5">Target Client &amp; Admin</th>
                <th className="px-4 py-2.5">Reason / Justification</th>
                <th className="px-4 py-2.5">Session Start Time</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bypassLogs.map((log) => (
                <tr key={log.id} className="hover:bg-bg-surface-2/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-txt-primary">{log.superAdminName}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-txt-primary">{log.clientName}</div>
                    <div className="text-[11px] text-txt-secondary">{log.targetAdminName}</div>
                  </td>
                  <td className="px-4 py-3 text-txt-primary font-medium">{log.reason}</td>
                  <td className="px-4 py-3 font-mono text-txt-secondary">{log.startTime}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.sessionStatus === 'ACTIVE'
                          ? 'bg-amber-500/20 text-amber-700 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {log.sessionStatus}
                    </span>
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
