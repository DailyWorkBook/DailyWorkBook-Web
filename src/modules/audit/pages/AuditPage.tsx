import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { auditApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced } from '../../../hooks';

const ENTITY_TYPES = ['Role', 'User', 'Employee', 'EmployeeKyc', 'EmployeeBankAccount', 'Site', 'Post', 'Shift', 'Roster', 'AttendanceEvent', 'LeaveRequest', 'ClientConfig', 'Holiday'];

export const AuditPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const debouncedSearch = useDebounced(search);

  const params = { page, pageSize: 25, q: debouncedSearch || undefined, entityType: entityType || undefined };
  const audit = useQuery({
    queryKey: queryKeys.audit(params),
    queryFn: () => auditApi.list(params),
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Governance"
        eyebrowIcon={<ShieldCheck className="w-3.5 h-3.5" aria-hidden />}
        title="Audit trail"
        description="Every change made in this workspace, append-only. The database refuses updates and deletes on these rows."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by action or person…"
          className="flex-1 max-w-sm"
          label="Search the audit trail"
        />

        <select
          value={entityType}
          onChange={(event) => {
            setEntityType(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by record type"
          className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          <option value="">All record types</option>
          {ENTITY_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {audit.isLoading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : audit.isError ? (
          <ErrorState message={describeApiError(audit.error)} onRetry={() => void audit.refetch()} />
        ) : audit.data!.data.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={entityType || debouncedSearch ? 'No entries match these filters' : 'Nothing recorded yet'}
            description={
              entityType || debouncedSearch
                ? 'Try a different record type or search term.'
                : 'Every create, update and decision made in this workspace appears here as it happens.'
            }
            className="border-0"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3">When</th>
                    <th scope="col" className="px-4 py-3">Who</th>
                    <th scope="col" className="px-4 py-3">Action</th>
                    <th scope="col" className="px-4 py-3">Record</th>
                    <th scope="col" className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {audit.data!.data.map((entry) => (
                    <tr key={entry.id} className="hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 tabular-nums whitespace-nowrap text-txt-secondary">
                        {new Date(entry.createdAt).toLocaleString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-txt-primary">{entry.actorName ?? 'System'}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-bg-surface-2 border border-border text-txt-primary">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-txt-secondary">
                        <div>{entry.entityType}</div>
                        <div className="text-[10px] font-mono opacity-70 truncate max-w-[12rem]">{entry.entityId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-txt-secondary">{entry.ipAddress ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={audit.data!.meta} onPageChange={setPage} label="entries" />
          </>
        )}
      </div>
    </div>
  );
};
