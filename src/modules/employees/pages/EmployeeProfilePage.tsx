import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, CreditCard, IdCard, UserRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog, PageHeader } from '../../../components/data';
import { ErrorState, LoadingState } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { employeesApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';
import { KycForm } from '../components/KycForm';
import { BankAccountForm } from '../components/BankAccountForm';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const EmployeeProfilePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuth();

  const [tab, setTab] = useState<'overview' | 'kyc' | 'bank'>('overview');
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const employee = useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: () => employeesApi.get(id),
    enabled: Boolean(id),
  });

  const deactivate = useMutation({
    mutationFn: () => employeesApi.deactivate(id),
    onSuccess: () => {
      toast.success('Employee deactivated', 'Upcoming roster entries were cancelled.');
      setConfirmDeactivate(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(id) });
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => toast.error('Could not deactivate', describeApiError(error)),
  });

  if (employee.isLoading) return <LoadingState label="Loading employee profile…" />;

  if (employee.isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/employees')} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to employees
        </Button>
        <ErrorState message={describeApiError(employee.error)} onRetry={() => void employee.refetch()} />
      </div>
    );
  }

  const data = employee.data!;

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: UserRound, visible: true },
    { key: 'kyc' as const, label: 'KYC', icon: IdCard, visible: can('EMPLOYEE_KYC_VIEW') },
    { key: 'bank' as const, label: 'Bank details', icon: CreditCard, visible: can('EMPLOYEE_BANK_VIEW') },
  ].filter((entry) => entry.visible);

  return (
    <div className="space-y-6 pb-12">
      <Link to="/employees" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden /> Back to employees
      </Link>

      <PageHeader
        eyebrow={data.employeeCode}
        title={data.fullName}
        description={`${data.designation} · ${data.department} · ${data.role.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge status={data.status} />
            {can('EMPLOYEE_DELETE') && data.status !== 'TERMINATED' && (
              <Button variant="destructive" onClick={() => setConfirmDeactivate(true)}>
                Deactivate
              </Button>
            )}
          </div>
        }
      />

      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.key}
              role="tab"
              aria-selected={tab === entry.key}
              onClick={() => setTab(entry.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors min-h-[40px] ${
                tab === entry.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-txt-secondary hover:text-txt-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden /> {entry.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 bg-bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-txt-primary">Personal & contact</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {[
                ['Phone', data.phone],
                ['Email', data.email ?? '—'],
                ['Date of birth', data.dateOfBirth ?? '—'],
                ['Gender', data.gender.replace(/_/g, ' ').toLowerCase()],
                ['Address', data.addressLine ?? '—'],
                ['City', data.city ?? '—'],
                ['Emergency contact', data.emergencyContactName ?? '—'],
                ['Emergency phone', data.emergencyContactPhone ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-txt-secondary">{label}</dt>
                  <dd className="font-semibold text-txt-primary mt-0.5 break-words">{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="text-sm font-extrabold text-txt-primary pt-3 border-t border-border/60">Employment</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {[
                ['Role', data.role.name],
                ['Designation', data.designation],
                ['Department', data.department],
                ['Employment type', data.employmentType.replace(/_/g, ' ').toLowerCase()],
                ['Joined', data.dateOfJoining],
                ['Exit date', data.dateOfExit ?? '—'],
                ['Monthly salary', formatCurrency(data.monthlySalary)],
                ['Overtime rate', formatCurrency(data.overtimeHourlyRate)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-txt-secondary">{label}</dt>
                  <dd className="font-semibold text-txt-primary mt-0.5 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="space-y-5">
            <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" aria-hidden /> Deployment
              </h2>
              {data.currentSite ? (
                <dl className="text-xs space-y-2">
                  <div>
                    <dt className="text-txt-secondary">Site</dt>
                    <dd className="font-semibold text-txt-primary">{data.currentSite.name}</dd>
                  </div>
                  <div>
                    <dt className="text-txt-secondary">Post</dt>
                    <dd className="font-semibold text-txt-primary">{data.currentPost?.name ?? 'No post assigned'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-txt-secondary">Not currently deployed to a site.</p>
              )}
            </section>

            <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-txt-primary">Leave balance</h2>
              {data.leaveBalance ? (
                <dl className="text-xs space-y-2">
                  {[
                    ['Casual', data.leaveBalance.casual],
                    ['Earned', data.leaveBalance.earned],
                    ['Medical', data.leaveBalance.medical],
                    ['Comp off', data.leaveBalance.compOff],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between">
                      <dt className="text-txt-secondary">{label}</dt>
                      <dd className="font-bold text-txt-primary tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-txt-secondary">No balance record yet.</p>
              )}
              <p className="text-[11px] text-txt-tertiary leading-relaxed pt-2 border-t border-border/60">
                Balances open from the entitlement policy set in Settings.
              </p>
            </section>

            <section className="bg-bg-surface border border-border rounded-2xl p-5 space-y-2">
              <h2 className="text-sm font-extrabold text-txt-primary">Records on file</h2>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-txt-secondary">KYC</span>
                  <span className="font-semibold text-txt-primary">{data.kyc?.status ?? 'Not started'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-txt-secondary">Bank account</span>
                  <span className="font-semibold text-txt-primary">
                    {data.bankAccount ? (data.bankAccount.isVerified ? 'Verified' : 'On file') : 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-txt-secondary">Login account</span>
                  <span className="font-semibold text-txt-primary">{data.loginAccount ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'kyc' && <KycForm employeeId={id} canEdit={can('EMPLOYEE_KYC_MANAGE')} />}
      {tab === 'bank' && <BankAccountForm employeeId={id} canEdit={can('EMPLOYEE_BANK_MANAGE')} />}

      <ConfirmDialog
        isOpen={confirmDeactivate}
        title={`Deactivate ${data.fullName}?`}
        message="Their record and attendance history are kept, but they can no longer be rostered and any upcoming shifts are cancelled."
        confirmLabel="Deactivate"
        tone="destructive"
        isBusy={deactivate.isPending}
        onConfirm={() => deactivate.mutate()}
        onCancel={() => setConfirmDeactivate(false)}
      />
    </div>
  );
};
