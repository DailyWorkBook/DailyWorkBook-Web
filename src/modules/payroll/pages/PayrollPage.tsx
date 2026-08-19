import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { payrollApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced } from '../../../hooks';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const money = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const PayrollPage: React.FC = () => {
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);

  const params = { month, page, pageSize: 25, q: debouncedSearch || undefined };
  const payroll = useQuery({
    queryKey: queryKeys.payroll(params),
    queryFn: () => payrollApi.summary(params),
  });

  const totals = payroll.data?.meta.totals as
    | { grossEarnings: number; totalDeductions: number; netPayable: number; employees: number; blockedByExceptions: number }
    | null
    | undefined;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Finance"
        eyebrowIcon={<DollarSign className="w-3.5 h-3.5" aria-hidden />}
        title="Payroll ledger"
        description="Computed from each employee's recorded salary and the attendance actually resolved for the period."
        actions={
          <label className="flex items-center gap-2 text-xs font-bold text-txt-secondary">
            Month
            <input
              type="month"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);
                setPage(1);
              }}
              className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </label>
        }
      />

      {totals && totals.blockedByExceptions > 0 && (
        <div className="p-4 rounded-2xl border border-status-late/30 bg-status-late/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-status-late flex-shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
          <div>
            <h2 className="text-xs font-extrabold text-txt-primary">
              {totals.blockedByExceptions} employee{totals.blockedByExceptions === 1 ? '' : 's'} have unresolved attendance
            </h2>
            <p className="text-[11px] text-txt-secondary mt-0.5 leading-relaxed">
              Days still awaiting an exception decision are excluded from these figures. Clear the exception queue before
              settling payroll for this period.
            </p>
          </div>
        </div>
      )}

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['Gross earnings', totals.grossEarnings],
            ['Deductions', totals.totalDeductions],
            ['Net payable', totals.netPayable],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-bg-surface border border-border rounded-2xl p-5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-txt-secondary">{label}</span>
              <div className="text-2xl font-black text-txt-primary tabular-nums mt-1">{money(value as number)}</div>
            </div>
          ))}
        </div>
      )}

      <SearchInput
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by employee name or code…"
        className="max-w-sm"
        label="Search payroll"
      />

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {payroll.isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : payroll.isError ? (
          <ErrorState message={describeApiError(payroll.error)} onRetry={() => void payroll.refetch()} />
        ) : payroll.data!.data.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Nothing to pay for this period"
            description="Payroll is derived from active employees and their resolved attendance. Onboard employees and record attendance to see figures here."
            className="border-0"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Employee</th>
                    <th scope="col" className="px-4 py-3 text-right">Salary</th>
                    <th scope="col" className="px-4 py-3 text-right">Payable days</th>
                    <th scope="col" className="px-4 py-3 text-right">Gross</th>
                    <th scope="col" className="px-4 py-3 text-right">Deductions</th>
                    <th scope="col" className="px-4 py-3 text-right">Net</th>
                    <th scope="col" className="px-4 py-3 text-right">Ready</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payroll.data!.data.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{row.name}</div>
                        <div className="text-[10px] text-txt-secondary">
                          {row.employeeCode} · {row.designation}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(row.monthlySalary)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.payableDays}
                        {row.attendance.unresolvedDays > 0 && (
                          <span className="ml-1 text-[10px] text-status-late">
                            ({row.attendance.unresolvedDays} unresolved)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(row.grossEarnings)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-status-absent">
                        −{money(row.totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-brand-teal">
                        {money(row.netPayable)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.payrollReady ? 'bg-brand-teal/10 text-brand-teal' : 'bg-status-pending/10 text-txt-secondary'
                          }`}
                          title={
                            row.payrollReady
                              ? 'Attendance resolved and bank account verified'
                              : 'Needs a verified bank account and no unresolved attendance'
                          }
                        >
                          {row.payrollReady ? 'Ready' : 'Blocked'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={payroll.data!.meta} onPageChange={setPage} label="employees" />
          </>
        )}
      </div>
    </div>
  );
};
