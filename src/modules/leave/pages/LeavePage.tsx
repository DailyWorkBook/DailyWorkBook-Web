import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileSpreadsheet, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { employeesApi, leaveApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';

const LEAVE_TYPES = ['CASUAL', 'EARNED', 'MEDICAL', 'UNPAID', 'COMP_OFF'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const todayIso = () => new Date().toISOString().slice(0, 10);

export const LeavePage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'requests' | 'balances'>('requests');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);

  const debouncedSearch = useDebounced(search);
  const params = { page, pageSize: 25, status: status || undefined, q: debouncedSearch || undefined };

  const requests = useQuery({
    queryKey: queryKeys.leave(params),
    queryFn: () => leaveApi.list(params),
    enabled: tab === 'requests',
  });

  const balanceParams = { page, pageSize: 25, q: debouncedSearch || undefined };
  const balances = useQuery({
    queryKey: queryKeys.leaveBalances(balanceParams),
    queryFn: () => leaveApi.balances(balanceParams),
    enabled: tab === 'balances',
  });

  const employees = useQuery({
    queryKey: queryKeys.employees({ pageSize: 200, status: 'ACTIVE' }),
    queryFn: () => employeesApi.list({ pageSize: 200, status: 'ACTIVE' }),
    enabled: can('EMPLOYEE_VIEW'),
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['leave'] });
    void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const decide = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      leaveApi.decide(id, approve ? 'APPROVED' : 'REJECTED'),
    onSuccess: (_, variables) => {
      toast.success(
        variables.approve ? 'Leave approved' : 'Leave rejected',
        variables.approve ? 'The balance was deducted and the register updated.' : 'The balance is unchanged.',
      );
      invalidate();
    },
    onError: (error) => toast.error('The decision could not be recorded', describeApiError(error)),
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Absence"
        eyebrowIcon={<FileSpreadsheet className="w-3.5 h-3.5" aria-hidden />}
        title="Leave"
        description="Requests and balances. Approving leave deducts the balance and rewrites the affected attendance days."
        actions={
          can('LEAVE_CREATE') && tab === 'requests' ? (
            <Button onClick={() => setFormOpen(true)} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
              File leave
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-1 border-b border-border" role="tablist">
        {(
          [
            ['requests', 'Requests'],
            ['balances', 'Balances'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors min-h-[40px] ${
              tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by employee name or code…"
          className="flex-1 max-w-sm"
          label="Search leave"
        />

        {tab === 'requests' && (
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          >
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {tab === 'requests' ? (
          requests.isLoading ? (
            <TableSkeleton rows={4} columns={5} />
          ) : requests.isError ? (
            <ErrorState message={describeApiError(requests.error)} onRetry={() => void requests.refetch()} />
          ) : requests.data!.data.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title={status || debouncedSearch ? 'No requests match these filters' : 'No leave requests yet'}
              description={
                status || debouncedSearch
                  ? 'Try a different status or search term.'
                  : 'File leave on an employee’s behalf, and it will appear here for a decision.'
              }
              action={
                can('LEAVE_CREATE') && !status && !debouncedSearch
                  ? { label: 'File leave', onClick: () => setFormOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
                  : undefined
              }
              className="border-0"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                    <tr>
                      <th scope="col" className="px-4 py-3">Employee</th>
                      <th scope="col" className="px-4 py-3">Type</th>
                      <th scope="col" className="px-4 py-3">Dates</th>
                      <th scope="col" className="px-4 py-3">Days</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {requests.data!.data.map((request) => (
                      <tr key={request.id} className="hover:bg-bg-surface-2/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-txt-primary">{request.employee.name}</div>
                          <div className="text-[10px] font-mono text-txt-secondary">{request.employee.employeeCode}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bg-surface-2 border border-border text-txt-primary">
                            {request.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {request.fromDate}
                          {request.fromDate !== request.toDate && ` → ${request.toDate}`}
                          {request.isHalfDay && <span className="ml-1 text-[10px] text-txt-secondary">(half)</span>}
                        </td>
                        <td className="px-4 py-3 tabular-nums font-semibold">{request.totalDays}</td>
                        <td className="px-4 py-3">
                          <Badge status={request.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {request.status === 'PENDING' && can('LEAVE_APPROVE') ? (
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                size="sm"
                                variant="teal"
                                isLoading={decide.isPending && decide.variables?.id === request.id}
                                onClick={() => decide.mutate({ id: request.id, approve: true })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                isLoading={decide.isPending && decide.variables?.id === request.id}
                                onClick={() => decide.mutate({ id: request.id, approve: false })}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-txt-tertiary">
                              {request.decidedAt ? new Date(request.decidedAt).toLocaleDateString() : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={requests.data!.meta} onPageChange={setPage} label="requests" />
            </>
          )
        ) : balances.isLoading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : balances.isError ? (
          <ErrorState message={describeApiError(balances.error)} onRetry={() => void balances.refetch()} />
        ) : balances.data!.data.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No balances yet"
            description="Balances open when an employee is onboarded, using the entitlement policy set in Settings."
            className="border-0"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Employee</th>
                    <th scope="col" className="px-4 py-3 text-right">Casual</th>
                    <th scope="col" className="px-4 py-3 text-right">Earned</th>
                    <th scope="col" className="px-4 py-3 text-right">Medical</th>
                    <th scope="col" className="px-4 py-3 text-right">Comp off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {balances.data!.data.map((balance) => (
                    <tr key={balance.employeeId} className="hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{balance.employeeName}</div>
                        <div className="text-[10px] font-mono text-txt-secondary">{balance.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{balance.casual}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{balance.earned}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{balance.medical}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{balance.compOff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={balances.data!.meta} onPageChange={setPage} label="employees" />
          </>
        )}
      </div>

      {isFormOpen && (
        <FileLeaveDialog
          employees={employees.data?.data ?? []}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            toast.success('Leave filed', 'The request is pending a decision.');
            invalidate();
          }}
        />
      )}
    </div>
  );
};

interface FileLeaveDialogProps {
  employees: { id: string; fullName: string; employeeCode: string }[];
  onClose: () => void;
  onSaved: () => void;
}

const FileLeaveDialog: React.FC<FileLeaveDialogProps> = ({ employees, onClose, onSaved }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('CASUAL');
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [isHalfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const save = useMutation({
    mutationFn: () => leaveApi.create({ employeeId, type, fromDate, toDate, isHalfDay, reason }),
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">File leave</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            The request is checked against the employee's remaining balance before it is accepted.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            if (!employeeId) {
              setError('Select the employee this leave is for.');
              return;
            }
            save.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Employee <span className="text-status-absent">*</span>
            </span>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={fieldClass}>
              <option value="">Select an employee…</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Leave type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
              {LEAVE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">From</span>
              <input
                required
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (isHalfDay) setToDate(e.target.value);
                }}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">To</span>
              <input
                required
                type="date"
                value={toDate}
                disabled={isHalfDay}
                onChange={(e) => setToDate(e.target.value)}
                className={`${fieldClass} disabled:opacity-60`}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-txt-secondary">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => {
                setHalfDay(e.target.checked);
                if (e.target.checked) setToDate(fromDate);
              }}
            />
            Half day (single date only)
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Reason <span className="text-status-absent">*</span>
            </span>
            <input required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} className={fieldClass} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              File request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
