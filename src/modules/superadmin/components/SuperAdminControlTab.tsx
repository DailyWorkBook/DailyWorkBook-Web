import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  ExternalLink,
  Lock,
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  KeyRound
} from 'lucide-react';
import type { SuperAdminClient, BypassAuditLog } from '../types';

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
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.length > 0 ? clients[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [accessReason, setAccessReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter(
    (c) =>
      (c.companyName || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientCode || c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.adminAccount?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.adminAccount?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchNewTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessReason.trim()) {
      setErrorMsg('Please enter a valid reason for accessing this client admin account.');
      return;
    }
    setErrorMsg('');
    onInitiateBypassInNewTab(selectedClient, accessReason);
  };

  if (!selectedClient) {
    return (
      <div className="p-8 text-center text-xs text-txt-secondary">
        No clients registered on platform yet.
      </div>
    );
  }

  const clientDisplayName = selectedClient.companyName || selectedClient.name || 'Client Organization';
  const clientDisplayCode = selectedClient.clientCode || selectedClient.code || 'CODE';

  return (
    <div className="space-y-6">
      {/* Top Banner Warning */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>SUPER ADMIN ADVANCED CONTROL PANEL — PASSWORDLESS CLIENT IMPERSONATION</span>
        </div>
        <p className="text-xs text-txt-secondary leading-relaxed">
          Super Admin can log into any Client Admin account without requiring the client&apos;s password.
          When clicking <strong className="text-txt-primary">&quot;Login to Client Account&quot;</strong>, the selected client&apos;s Admin portal will open securely in a <span className="underline font-bold text-txt-primary">new browser tab</span>.
          Your main Super Admin session will remain completely intact in this tab.
        </p>
      </div>

      {/* Control Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Target Client (5 cols) */}
        <div className="lg:col-span-5 bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                1. Select Target Client Organization
              </h4>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by company name or code..."
                className="w-full pl-9 pr-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Select Dropdown */}
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
                  {c.companyName || c.name} ({c.clientCode || c.code}) &mdash; Admin: {c.adminAccount?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clickable Quick Select List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
            {filteredClients.map((c) => {
              const isSelected = c.id === selectedClientId;
              const name = c.companyName || c.name;
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
                      alt={name}
                      className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-txt-primary leading-tight">{name}</div>
                      <div className="text-[10px] text-txt-secondary font-mono mt-0.5">
                        Admin: {c.adminAccount?.name} ({c.adminAccount?.email})
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
                    alt={clientDisplayName}
                    className="w-12 h-12 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-txt-primary">
                      {clientDisplayName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-txt-secondary mt-0.5">
                      <span>Code: {clientDisplayCode}</span>
                      <span>&bull;</span>
                      <span>Tax ID: {selectedClient.taxId || 'GSTIN-DEFAULT'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-txt-secondary text-[10px]">Pricing Model</div>
                  <div className="font-bold text-amber-600 uppercase">
                    {selectedClient.subscription?.pricingModel || 'PER_USER'}
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
                    {selectedClient.adminAccount?.name}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Admin Email Address
                  </span>
                  <span className="font-mono text-txt-primary mt-0.5 block">
                    {selectedClient.adminAccount?.email}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Admin Contact Phone
                  </span>
                  <span className="font-semibold text-txt-primary mt-0.5 block">
                    {selectedClient.adminAccount?.phone}
                  </span>
                </div>

                <div>
                  <span className="text-txt-secondary block text-[10px] uppercase font-mono font-bold">
                    Last Known Login
                  </span>
                  <span className="font-mono text-txt-secondary mt-0.5 block">
                    {selectedClient.adminAccount?.lastLoginAt || 'Recent'}
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
                  ⚡ Opens <strong className="text-txt-primary">{selectedClient.adminAccount?.name}</strong> ({clientDisplayName}) in a <span className="underline font-bold text-txt-primary">new browser tab</span>. The original Super Admin tab will remain open.
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
                    <div className="text-[11px] text-txt-secondary">{log.targetAdminName || log.adminEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-txt-primary font-medium">{log.reason}</td>
                  <td className="px-4 py-3 font-mono text-txt-secondary">{log.startTime || log.timestamp}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.sessionStatus === 'ACTIVE'
                          ? 'bg-amber-500/20 text-amber-700 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {log.sessionStatus || 'COMPLETED'}
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
