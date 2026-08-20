import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, KeyRound, Layers, Power, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog, PageHeader } from '../../../components/data';
import { ErrorState, LoadingState } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { catalogApi, platformApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';
import { openImpersonationTab } from '../impersonation';

const money = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

export const PlatformClientDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isEditingModules, setEditingModules] = useState(false);
  const [draftModules, setDraftModules] = useState<string[]>([]);
  const [statusChange, setStatusChange] = useState<'ACTIVE' | 'SUSPENDED' | null>(null);
  const [isResetOpen, setResetOpen] = useState(false);
  const [isBypassOpen, setBypassOpen] = useState(false);

  const client = useQuery({
    queryKey: queryKeys.platformClient(id),
    queryFn: () => platformApi.getClient(id),
    enabled: Boolean(id),
  });

  const catalog = useQuery({
    queryKey: queryKeys.catalogModules,
    queryFn: () => catalogApi.modules(),
    staleTime: 5 * 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['platform'] });
  };

  const updateModules = useMutation({
    mutationFn: () => platformApi.updateModules(id, draftModules),
    onSuccess: (updated) => {
      toast.success(
        'Modules updated',
        `Billing is now ${money(updated.subscription?.monthlyAmount ?? 0, updated.subscription?.currency)} per month.`,
      );
      setEditingModules(false);
      invalidate();
    },
    onError: (error) => toast.error('Could not update modules', describeApiError(error)),
  });

  const setStatus = useMutation({
    mutationFn: (status: 'ACTIVE' | 'SUSPENDED') => platformApi.setClientStatus(id, status),
    onSuccess: (_, status) => {
      toast.success(
        status === 'ACTIVE' ? 'Client reactivated' : 'Client suspended',
        status === 'ACTIVE' ? 'Their team can sign in again.' : 'Live sessions were revoked and sign-in is blocked.',
      );
      setStatusChange(null);
      invalidate();
    },
    onError: (error) => toast.error('Could not change the status', describeApiError(error)),
  });

  if (client.isLoading) return <LoadingState label="Loading client…" />;

  if (client.isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/platform/clients')} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to clients
        </Button>
        <ErrorState message={describeApiError(client.error)} onRetry={() => void client.refetch()} />
      </div>
    );
  }

  const data = client.data!;
  const ownedCodes = data.modules.map((module) => module.code);
  const currency = data.subscription?.currency ?? 'INR';

  return (
    <div className="space-y-6 pb-12">
      <Link to="/platform/clients" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden /> Back to clients
      </Link>

      <PageHeader
        eyebrow={data.code}
        title={data.name}
        description={`${data.billingAddress}, ${data.city}${data.state ? `, ${data.state}` : ''}`}
        actions={
          <div className="flex gap-2">
            {data.primaryAdmin && (
              <Button variant="outline" onClick={() => setBypassOpen(true)} leftIcon={<ShieldAlert className="w-3.5 h-3.5" aria-hidden />}>
                Login as admin
              </Button>
            )}
            {data.primaryAdmin && (
              <Button variant="outline" onClick={() => setResetOpen(true)} leftIcon={<KeyRound className="w-3.5 h-3.5" aria-hidden />}>
                Reset admin password
              </Button>
            )}
            <Button
              variant={data.status === 'ACTIVE' ? 'destructive' : 'teal'}
              onClick={() => setStatusChange(data.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
              leftIcon={<Power className="w-3.5 h-3.5" aria-hidden />}
            >
              {data.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 space-y-5">
          <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-primary" aria-hidden /> Modules ({data.modules.length})
              </h2>
              {!isEditingModules && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraftModules(ownedCodes);
                    setEditingModules(true);
                  }}
                >
                  Change modules
                </Button>
              )}
            </div>

            {isEditingModules ? (
              <>
                <p className="text-[11px] text-txt-secondary leading-relaxed">
                  Removing a module also drops any role permission that depended on it, and re-prices the subscription.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {(catalog.data ?? []).map((module) => {
                    const isSelected = draftModules.includes(module.code);
                    return (
                      <button
                        key={module.code}
                        type="button"
                        disabled={module.isMandatory}
                        onClick={() =>
                          setDraftModules((current) =>
                            current.includes(module.code)
                              ? current.filter((code) => code !== module.code)
                              : [...current, module.code],
                          )
                        }
                        className={`text-left p-3 rounded-xl border text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                          isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border bg-bg-surface'
                        }`}
                      >
                        <div className={`font-bold ${isSelected ? 'text-brand-primary' : 'text-txt-primary'}`}>
                          {module.name}
                        </div>
                        <div className="text-[10px] font-mono text-txt-secondary mt-0.5">
                          {module.isMandatory ? 'Always included' : money(module.pricing.monthly, currency)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => setEditingModules(false)} disabled={updateModules.isPending}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => updateModules.mutate()} isLoading={updateModules.isPending}>
                    Save modules
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.modules.map((module) => (
                  <span key={module.code} className="px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary text-[11px] font-bold">
                    {module.name}
                    {module.unitPrice > 0 && (
                      <span className="ml-1.5 font-mono opacity-70">{money(module.unitPrice, currency)}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-txt-primary">Workspace users</h2>
            <ul className="divide-y divide-border/60">
              {data.users.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="min-w-0">
                    <span className="block font-bold text-txt-primary truncate">
                      {user.name}
                      {user.isPrimaryAdmin && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-primary/10 text-brand-primary">
                          PRIMARY
                        </span>
                      )}
                    </span>
                    <span className="block text-[10px] text-txt-secondary truncate">{user.email}</span>
                  </span>
                  <span className="text-right flex-shrink-0">
                    <span className="block text-[10px] text-txt-secondary">{user.roleName ?? '—'}</span>
                    <span className="block text-[10px] text-txt-tertiary">
                      {user.lastLoginAt ? `Last in ${new Date(user.lastLoginAt).toLocaleDateString()}` : 'Never signed in'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border/70">
              <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-primary" aria-hidden /> Invoices
              </h2>
            </div>
            {data.invoices.length === 0 ? (
              <p className="p-6 text-center text-xs text-txt-secondary">
                No invoices raised yet. Create one from the Billing screen.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Invoice</th>
                      <th scope="col" className="px-4 py-3">Period</th>
                      <th scope="col" className="px-4 py-3 text-right">Total</th>
                      <th scope="col" className="px-4 py-3 text-right">Outstanding</th>
                      <th scope="col" className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-3 font-mono text-txt-primary">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 text-txt-secondary tabular-nums">
                          {invoice.periodStart} → {invoice.periodEnd}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{money(invoice.totalAmount, invoice.currency)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{money(invoice.outstanding, invoice.currency)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg-surface-2 border border-border text-txt-primary">
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-txt-primary">Subscription</h2>
            {data.subscription ? (
              <dl className="space-y-2 text-xs">
                {[
                  ['Plan', data.subscription.planName],
                  ['Pricing', data.subscription.pricingModel.replace('_', ' ')],
                  ['Cycle', data.subscription.billingCycle.replace('_', ' ')],
                  ['User allowance', String(data.subscription.maxUsers)],
                  ['Subtotal', money(data.subscription.subtotalAmount, currency)],
                  ['Discount', `−${money(data.subscription.discountAmount, currency)}`],
                  ['Tax', money(data.subscription.taxAmount, currency)],
                  ['Monthly', money(data.subscription.monthlyAmount, currency)],
                  ['Per cycle', money(data.subscription.cycleAmount, currency)],
                  ['Starts', data.subscription.startDate],
                  ['Expires', data.subscription.expiryDate],
                  ['Status', data.subscription.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-txt-secondary">{label}</dt>
                    <dd className="font-semibold text-txt-primary tabular-nums text-right capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-txt-secondary">No subscription configured.</p>
            )}
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-txt-primary">Workspace activity</h2>
            <dl className="space-y-2 text-xs">
              {[
                ['Employees', data.counts.employees],
                ['Sites', data.counts.sites],
                ['Roles', data.counts.roles ?? 0],
                ['Users', data.counts.users],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <dt className="text-txt-secondary">{label}</dt>
                  <dd className="font-bold text-txt-primary tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-txt-primary">Billing contact</h2>
            <dl className="space-y-2 text-xs">
              {[
                ['Contact', data.contactPerson],
                ['Email', data.contactEmail],
                ['Phone', data.contactPhone],
                ['Tax ID', data.taxId ?? '—'],
                ['Industry', data.industry ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-txt-secondary">{label}</dt>
                  <dd className="font-semibold text-txt-primary break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={statusChange !== null}
        title={statusChange === 'SUSPENDED' ? `Suspend ${data.name}?` : `Reactivate ${data.name}?`}
        message={
          statusChange === 'SUSPENDED'
            ? 'Everyone in this workspace is signed out immediately and cannot sign back in until the client is reactivated. Their data is untouched.'
            : 'Their team will be able to sign in again with their existing credentials.'
        }
        confirmLabel={statusChange === 'SUSPENDED' ? 'Suspend client' : 'Reactivate client'}
        tone={statusChange === 'SUSPENDED' ? 'destructive' : 'default'}
        isBusy={setStatus.isPending}
        onConfirm={() => statusChange && setStatus.mutate(statusChange)}
        onCancel={() => setStatusChange(null)}
      />

      {isBypassOpen && data.primaryAdmin && (
        <BypassLoginDialog
          clientId={id}
          clientName={data.name}
          adminName={data.primaryAdmin.name}
          adminEmail={data.primaryAdmin.email}
          onClose={() => setBypassOpen(false)}
          onOpened={() => {
            setBypassOpen(false);
            toast.success(
              'Support session opened',
              'The client workspace is open in a new tab. This tab stays signed in as you.',
            );
          }}
          onBlocked={() =>
            toast.error(
              'Allow pop-ups to continue',
              'The workspace opens in a new tab. Allow pop-ups for this site, then try again.',
            )
          }
        />
      )}

      {isResetOpen && data.primaryAdmin && (
        <ResetPasswordDialog
          clientId={id}
          userId={data.primaryAdmin.id}
          email={data.primaryAdmin.email}
          onClose={() => setResetOpen(false)}
          onDone={() => {
            setResetOpen(false);
            toast.success('Password reset', 'They will be asked to choose their own on next sign-in.');
            invalidate();
          }}
        />
      )}
    </div>
  );
};

interface ResetPasswordDialogProps {
  clientId: string;
  userId: string;
  email: string;
  onClose: () => void;
  onDone: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ clientId, userId, email, onClose, onDone }) => {
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const reset = useMutation({
    mutationFn: () => platformApi.resetAdminPassword(clientId, { userId, newPassword, reason }),
    onSuccess: onDone,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Reset administrator password</h2>
          <p className="text-xs text-txt-secondary mt-0.5 break-words">
            For {email}. Every live session is revoked and they must choose their own password on next sign-in.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            reset.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              New password <span className="text-status-absent">*</span>
            </span>
            <input required type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={fieldClass} />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Reason <span className="text-status-absent">*</span>
            </span>
            <input required minLength={5} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Recorded in the platform audit log" className={fieldClass} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={reset.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={reset.isPending}>
              Reset password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BypassLoginDialogProps {
  clientId: string;
  clientName: string;
  adminName: string;
  adminEmail: string;
  onClose: () => void;
  onOpened: () => void;
  onBlocked: () => void;
}

/**
 * Confirms who is about to be signed in as, and why, before any session exists.
 *
 * The reason is not paperwork: it is the only lasting explanation of why this
 * workspace was entered, so the button stays disabled until there is a real one.
 */
const BypassLoginDialog: React.FC<BypassLoginDialogProps> = ({
  clientId,
  clientName,
  adminName,
  adminEmail,
  onClose,
  onOpened,
  onBlocked,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const start = useMutation({
    mutationFn: () => platformApi.startImpersonation(clientId, { reason: reason.trim() }),
    onSuccess: (handoff) => (openImpersonationTab(handoff.ticket) ? onOpened() : onBlocked()),
    onError: (caught) => setError(describeApiError(caught)),
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Sign in as {adminName}</h2>
          <p className="text-xs text-txt-secondary mt-0.5 break-words">
            Opens {clientName} in a new tab as {adminEmail}. Their password is neither used nor changed, and they stay
            signed in on their own devices.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            start.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Reason for access <span className="text-status-absent">*</span>
            </span>
            <input
              required
              minLength={10}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Support ticket #4029 — roster sync failing"
              className="w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
            <span className="block text-[11px] text-txt-secondary mt-1">
              Recorded on the platform audit trail and shown to the client.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={start.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={start.isPending} disabled={reason.trim().length < 10}>
              Open session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
