import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IdCard, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { employeesApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';

/**
 * Identity documents are masked when read back — the screen only ever needs to
 * confirm which document is on file, so the full number is never re-sent to the
 * browser. Editing therefore starts from blank fields, not from a masked value.
 */
export const KycForm: React.FC<{ employeeId: string; canEdit: boolean }> = ({ employeeId, canEdit }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const kyc = useQuery({
    queryKey: queryKeys.employeeKyc(employeeId),
    queryFn: () => employeesApi.getKyc(employeeId),
  });

  const [isEditing, setEditing] = useState(false);
  const [aadhaarNumber, setAadhaar] = useState('');
  const [panNumber, setPan] = useState('');
  const [passportNumber, setPassport] = useState('');
  const [drivingLicence, setLicence] = useState('');
  const [policeVerified, setPoliceVerified] = useState(false);
  const [status, setStatus] = useState('SUBMITTED');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  // Re-seed from the server copy during render when it changes, so an edit
  // started before the fetch settled is not left showing defaults.
  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  if (kyc.data && seededFrom !== kyc.data.updatedAt) {
    setSeededFrom(kyc.data.updatedAt);
    setPoliceVerified(kyc.data.policeVerified);
    setStatus(kyc.data.status);
    setRemarks(kyc.data.remarks ?? '');
  }

  const save = useMutation({
    mutationFn: () =>
      employeesApi.saveKyc(employeeId, {
        aadhaarNumber: aadhaarNumber || undefined,
        panNumber: panNumber || undefined,
        passportNumber: passportNumber || undefined,
        drivingLicence: drivingLicence || undefined,
        policeVerified,
        status,
        remarks: remarks || undefined,
      }),
    onSuccess: () => {
      toast.success('KYC updated', 'The identity record has been saved.');
      setEditing(false);
      setAadhaar('');
      setPan('');
      void queryClient.invalidateQueries({ queryKey: queryKeys.employeeKyc(employeeId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(employeeId) });
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (caught) => setError(describeApiError(caught)),
  });

  if (kyc.isLoading) return <LoadingState label="Loading KYC record…" />;
  if (kyc.isError) return <ErrorState message={describeApiError(kyc.error)} onRetry={() => void kyc.refetch()} />;

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  if (!kyc.data && !isEditing) {
    return (
      <EmptyState
        icon={IdCard}
        title="No KYC record yet"
        description="Record the identity documents held for this employee. Numbers are stored securely and only ever shown masked."
        action={canEdit ? { label: 'Add KYC details', onClick: () => setEditing(true) } : undefined}
      />
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
          <IdCard className="w-4 h-4 text-brand-primary" aria-hidden /> Identity documents
        </h2>
        {kyc.data && !isEditing && canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Update
          </Button>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold">
          {error}
        </div>
      )}

      {!isEditing && kyc.data ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          {[
            ['Status', kyc.data.status],
            ['Aadhaar', kyc.data.aadhaarNumber ?? 'Not provided'],
            ['PAN', kyc.data.panNumber ?? 'Not provided'],
            ['Passport', kyc.data.passportNumber ?? 'Not provided'],
            ['Driving licence', kyc.data.drivingLicence ?? 'Not provided'],
            ['Police verification', kyc.data.policeVerified ? 'Completed' : 'Not completed'],
            ['Verified at', kyc.data.verifiedAt ? new Date(kyc.data.verifiedAt).toLocaleString() : '—'],
            ['Remarks', kyc.data.remarks ?? '—'],
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
          {kyc.data && (
            <p className="text-[11px] text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-2.5 leading-relaxed">
              Document numbers are never sent back to the browser, so leaving a field blank clears it. Re-enter any
              document you want to keep on file.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Aadhaar number</span>
              <input value={aadhaarNumber} onChange={(e) => setAadhaar(e.target.value)} placeholder="12 digits" inputMode="numeric" className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">PAN</span>
              <input value={panNumber} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Passport</span>
              <input value={passportNumber} onChange={(e) => setPassport(e.target.value.toUpperCase())} className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Driving licence</span>
              <input value={drivingLicence} onChange={(e) => setLicence(e.target.value.toUpperCase())} className={`${fieldClass} font-mono`} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Verification status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-txt-secondary sm:mt-6">
              <input type="checkbox" checked={policeVerified} onChange={(e) => setPoliceVerified(e.target.checked)} />
              Police verification completed
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Remarks</span>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} className={fieldClass} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            {kyc.data && (
              <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={save.isPending}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={save.isPending} leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Save KYC
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
