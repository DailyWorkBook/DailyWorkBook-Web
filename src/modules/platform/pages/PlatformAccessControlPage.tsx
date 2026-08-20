import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  Clock,
  ExternalLink,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../../components/data';
import { EmptyState, ErrorState, LoadingState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { platformApi } from '../../../services';
import type { ClientSummary, ImpersonationSession } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';
import { openImpersonationTab } from '../impersonation';

/**
 * Super Admin control centre — "log in as this admin".
 *
 * The shape of this screen is deliberately the one operators already knew:
 * pick the client on the left, confirm the admin on the right, state a reason,
 * and land in their workspace in a new tab. What changed is underneath — the
 * session is now issued by the server against a real audited record instead of
 * being assembled in the browser.
 */

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-amber-500/15 text-amber-700',
  PENDING: 'bg-brand-primary/10 text-brand-primary',
  ENDED: 'bg-brand-teal/10 text-brand-teal',
  EXPIRED: 'bg-txt-secondary/10 text-txt-secondary',
};

const formatWhen = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const PlatformAccessControlPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessReason, setAccessReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const clients = useQuery({
    queryKey: queryKeys.platformClients({ pageSize: 100, scope: 'bypass' }),
    queryFn: () => platformApi.listClients({ pageSize: 100 }),
  });

  const sessionParams = { page: 1, pageSize: 25 };
  const sessions = useQuery({
    queryKey: queryKeys.platformImpersonations(sessionParams),
    queryFn: () => platformApi.impersonationSessions(sessionParams),
  });

  const rows = useMemo(() => clients.data?.data ?? [], [clients.data]);

  const filteredClients = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((client) =>
      [client.name, client.code, client.primaryAdmin?.name, client.primaryAdmin?.email]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(needle)),
    );
  }, [rows, searchQuery]);

  // Falls back to the first row so the panel is never empty-handed, and follows
  // the filter when the current pick is no longer in view.
  const selectedClient: ClientSummary | undefined =
    filteredClients.find((client) => client.id === selectedClientId) ??
    rows.find((client) => client.id === selectedClientId) ??
    filteredClients[0] ??
    rows[0];

  const startBypass = useMutation({
    mutationFn: (input: { clientId: string; reason: string }) =>
      platformApi.startImpersonation(input.clientId, { reason: input.reason }),
    onSuccess: (handoff) => {
      const opened = openImpersonationTab(handoff.ticket);
      if (!opened) {
        toast.error(
          'Allow pop-ups to continue',
          'The workspace opens in a new tab. Allow pop-ups for this site, then start the session again.',
        );
        return;
      }
      toast.success(
        'Support session opened',
        `${handoff.target.name} (${handoff.target.clientName}) is now open in a new tab. Your console session is untouched.`,
      );
      setAccessReason('');
      void queryClient.invalidateQueries({ queryKey: ['platform', 'impersonations'] });
    },
    onError: (error) => toast.error('Could not open the session', describeApiError(error)),
  });

  const handleLaunch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClient) return;

    // Mirrors the server rule, so the operator is told before a round-trip.
    if (accessReason.trim().length < 10) {
      setErrorMsg('Enter a reason of at least 10 characters — this is recorded on the audit trail.');
      return;
    }
    setErrorMsg('');
    startBypass.mutate({ clientId: selectedClient.id, reason: accessReason.trim() });
  };

  if (clients.isLoading) return <LoadingState label="Loading clients…" />;
  if (clients.isError) {
    return <ErrorState message={describeApiError(clients.error)} onRetry={() => void clients.refetch()} />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Support access"
        eyebrowIcon={<ShieldAlert className="w-3.5 h-3.5" aria-hidden />}
        title="Sign in as a client administrator"
        description="Open a client's workspace without their password, for support. Every session is recorded."
      />

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600" aria-hidden />
          <span>PASSWORDLESS CLIENT ACCESS — EVERY SESSION IS AUDITED</span>
        </div>
        <p className="text-xs text-txt-secondary leading-relaxed">
          Choosing <strong className="text-txt-primary">Login to Client Account</strong> opens that workspace in a{' '}
          <span className="underline font-bold text-txt-primary">new browser tab</span>. Your console session stays
          signed in here. The administrator&apos;s password is never read or changed, and they stay signed in on their
          own devices throughout.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No clients yet" description="Onboard a client before using support access." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step 1 — pick the workspace. */}
          <div className="lg:col-span-5 bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" aria-hidden />
                1. Select the client workspace
              </h2>
            </div>

            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary pointer-events-none"
                aria-hidden
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter by company, code or admin…"
                aria-label="Filter clients"
                className="w-full pl-9 pr-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredClients.length === 0 && (
                <p className="text-xs text-txt-secondary py-4 text-center">No client matches that search.</p>
              )}

              {filteredClients.map((client) => {
                const isSelected = client.id === selectedClient?.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setErrorMsg('');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-border/80 bg-bg-surface-2/60 hover:bg-bg-surface-2'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-txt-primary truncate">{client.name}</span>
                      <span className="block text-[10px] text-txt-secondary font-mono mt-0.5 truncate">
                        {client.primaryAdmin
                          ? `${client.primaryAdmin.name} · ${client.primaryAdmin.email}`
                          : 'No primary administrator'}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        client.status === 'ACTIVE' ? 'bg-brand-teal' : 'bg-status-absent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — confirm the target and state why. */}
          <div className="lg:col-span-7 bg-bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" aria-hidden />
                2. Confirm the administrator
              </h2>
              {selectedClient && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedClient.status === 'ACTIVE'
                      ? 'bg-brand-teal/10 text-brand-teal'
                      : 'bg-status-absent/10 text-status-absent'
                  }`}
                >
                  {selectedClient.status}
                </span>
              )}
            </div>

            {selectedClient && (
              <>
                <div className="p-4 bg-bg-surface-2 rounded-2xl border border-border/80 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-txt-primary">{selectedClient.name}</h3>
                    <p className="text-xs font-mono text-txt-secondary mt-0.5">Code: {selectedClient.code}</p>
                  </div>

                  <dl className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-txt-secondary text-[10px] uppercase font-mono font-bold">Administrator</dt>
                      <dd className="font-bold text-txt-primary mt-0.5">
                        {selectedClient.primaryAdmin?.name ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-txt-secondary text-[10px] uppercase font-mono font-bold">Email</dt>
                      <dd className="font-mono text-txt-primary mt-0.5 break-all">
                        {selectedClient.primaryAdmin?.email ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-txt-secondary text-[10px] uppercase font-mono font-bold">Account status</dt>
                      <dd className="font-semibold text-txt-primary mt-0.5">
                        {selectedClient.primaryAdmin?.status ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-txt-secondary text-[10px] uppercase font-mono font-bold">Last sign-in</dt>
                      <dd className="font-mono text-txt-secondary mt-0.5">
                        {formatWhen(selectedClient.primaryAdmin?.lastLoginAt ?? null)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {!selectedClient.primaryAdmin ? (
                  <p className="text-xs text-status-absent flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                    This workspace has no primary administrator to sign in as.
                  </p>
                ) : (
                  <form onSubmit={handleLaunch} className="space-y-4">
                    <div>
                      <label htmlFor="bypass-reason" className="block text-xs font-bold text-txt-primary mb-1.5">
                        Reason for access <span className="text-status-absent">*</span>
                      </label>
                      <input
                        id="bypass-reason"
                        type="text"
                        value={accessReason}
                        onChange={(event) => {
                          setAccessReason(event.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="e.g. Support ticket #4029 — roster shift sync failing"
                        aria-invalid={Boolean(errorMsg)}
                        aria-describedby={errorMsg ? 'bypass-reason-error' : undefined}
                        className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary placeholder-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      {errorMsg && (
                        <p
                          id="bypass-reason-error"
                          role="alert"
                          className="text-xs text-status-absent mt-1.5 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={startBypass.isPending}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ShieldAlert className="w-5 h-5" aria-hidden />
                        <span>{startBypass.isPending ? 'Opening session…' : 'Login to Client Account'}</span>
                        <ExternalLink className="w-4 h-4 ml-1" aria-hidden />
                      </button>
                      <p className="text-[11px] text-center text-txt-secondary mt-2">
                        Opens <strong className="text-txt-primary">{selectedClient.primaryAdmin.name}</strong> (
                        {selectedClient.name}) in a{' '}
                        <span className="underline font-bold text-txt-primary">new browser tab</span>. This tab stays
                        signed in as you.
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* The trail. */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" aria-hidden />
            Support session trail
          </h2>
          <span className="text-xs font-mono text-txt-secondary">Append-only</span>
        </div>

        {sessions.isLoading ? (
          <TableSkeleton rows={4} />
        ) : sessions.isError ? (
          <ErrorState message={describeApiError(sessions.error)} onRetry={() => void sessions.refetch()} />
        ) : (sessions.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="No support sessions yet" description="Sessions you open will be listed here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-surface-2 text-txt-secondary uppercase tracking-wider font-mono text-[10px] border-b border-border">
                  <th scope="col" className="px-4 py-2.5">Operator</th>
                  <th scope="col" className="px-4 py-2.5">Client &amp; administrator</th>
                  <th scope="col" className="px-4 py-2.5">Reason</th>
                  <th scope="col" className="px-4 py-2.5">Started</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sessions.data?.data.map((session: ImpersonationSession) => (
                  <tr key={session.id} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-txt-primary">{session.superAdminName}</div>
                      <div className="text-[11px] text-txt-secondary font-mono">{session.superAdminEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-txt-primary">{session.clientName}</div>
                      <div className="text-[11px] text-txt-secondary font-mono">{session.targetUserEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-txt-primary max-w-xs">{session.reason}</td>
                    <td className="px-4 py-3 font-mono text-txt-secondary whitespace-nowrap">
                      {formatWhen(session.startedAt ?? session.requestedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          STATUS_STYLES[session.status] ?? STATUS_STYLES.EXPIRED
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
