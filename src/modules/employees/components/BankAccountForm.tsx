import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { employeesApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';

export const BankAccountForm: React.FC<{ employeeId: string; canEdit: boolean }> = ({ employeeId, canEdit }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const account = useQuery({
    queryKey: queryKeys.employeeBank(employeeId),
    queryFn: () => employeesApi.getBankAccount(employeeId),
  });

  const [isEditing, setEditing] = useState(false);
  const [accountHolderName, setHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfsc] = useState('');
  const [branchName, setBranch] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [error, setError] = useState('');

  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  if (account.data && seededFrom !== account.data.updatedAt) {
    setSeededFrom(account.data.updatedAt);
    setHolder(account.data.accountHolderName);
    setBankName(account.data.bankName);
    setIfsc(account.data.ifscCode);
    setBranch(account.data.branchName ?? '');
    setAccountType(account.data.accountType);
  }

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.employeeBank(employeeId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.employee(employeeId) });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const save = useMutation({
    mutationFn: () =>
      employeesApi.saveBankAccount(employeeId, {
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName: branchName || undefined,
        accountType,
      }),
    onSuccess: () => {
      toast.success('Bank details saved', 'The account needs verifying before payroll can settle to it.');
      setEditing(false);
      setAccountNumber('');
      invalidate();
    },
    onError: (caught) => setError(describeApiError(caught)),
  });

  const verify = useMutation({
    mutationFn: () => employeesApi.verifyBankAccount(employeeId),
    onSuccess: () => {
      toast.success('Account verified', 'Payroll can now settle to this account.');
      invalidate();
    },
    onError: (caught) => toast.error('Could not verify the account', describeApiError(caught)),
  });

  if (account.isLoading) return <LoadingState label="Loading bank details…" />;
  if (account.isError) return <ErrorState message={describeApiError(account.error)} onRetry={() => void account.refetch()} />;

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  if (!account.data && !isEditing) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No salary account on file"
        description="Payroll cannot settle to this employee until a bank account is recorded and verified."
        action={canEdit ? { label: 'Add bank details', onClick: () => setEditing(true) } : undefined}
      />
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-primary" aria-hidden /> Salary account
        </h2>
        {account.data && !isEditing && canEdit && (
          <div className="flex gap-2">
            {!account.data.isVerified && (
              <Button size="sm" variant="teal" isLoading={verify.isPending} onClick={() => verify.mutate()} leftIcon={<BadgeCheck className="w-3.5 h-3.5" />}>
                Mark verified
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Update
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
          {error}
        </div>
      )}

      {!isEditing && account.data ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          {[
            ['Account holder', account.data.accountHolderName],
            ['Bank', account.data.bankName],
            ['Account number', account.data.accountNumber ?? '—'],
            ['IFSC', account.data.ifscCode],
            ['Branch', account.data.branchName ?? '—'],
            ['Account type', account.data.accountType],
            ['Verified', account.data.isVerified ? 'Yes' : 'Not yet'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-txt-secondary">{label}</dt>
              <dd className="font-semibold text-txt-primary mt-0.5 font-mono break-words">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            save.mutate();
          }}
          className="space-y-3"
        >
          {account.data && (
            <p className="text-[11px] text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-2.5 leading-relaxed">
              The stored account number is masked when read back, so it must be re-entered in full. Saving clears the
              verified flag until the new details are checked.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Account holder <span className="text-status-absent">*</span>
              </span>
              <input required value={accountHolderName} onChange={(e) => setHolder(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Bank <span className="text-status-absent">*</span>
              </span>
              <input required value={bankName} onChange={(e) => setBankName(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Account number <span className="text-status-absent">*</span>
              </span>
              <input required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} inputMode="numeric" className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                IFSC <span className="text-status-absent">*</span>
              </span>
              <input required value={ifscCode} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0000240" className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Branch</span>
              <input value={branchName} onChange={(e) => setBranch(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Account type</span>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className={fieldClass}>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            {account.data && (
              <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={save.isPending}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={save.isPending}>
              Save bank details
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
