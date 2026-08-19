import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { PageHeader, Pagination, SearchInput } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { platformApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced } from '../../../hooks';

const CATEGORIES = ['CLIENT', 'SUBSCRIPTION', 'BILLING', 'MODULE', 'SECURITY', 'SYSTEM'];

const CATEGORY_STYLES: Record<string, string> = {
  CLIENT: 'bg-brand-primary/10 text-brand-primary',
  SUBSCRIPTION: 'bg-status-leave/10 text-status-leave',
  BILLING: 'bg-brand-teal/10 text-brand-teal',
  MODULE: 'bg-status-late/10 text-status-late',
  SECURITY: 'bg-status-absent/10 text-status-absent',
};

export const PlatformActivityPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounced(search);

  const params = { page, pageSize: 25, q: debouncedSearch || undefined, category: category || undefined };
  const audit = useQuery({
    queryKey: queryKeys.platformAudit(params),
    queryFn: () => platformApi.audit(params),
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Governance"
        eyebrowIcon={<ShieldAlert className="w-3.5 h-3.5" aria-hidden />}
        title="Platform activity"
        description="Every action taken from this console, append-only. Clients cannot read this log."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by action, detail or operator…"
          className="flex-1 max-w-md"
          label="Search platform activity"
        />
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
          className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((value) => (
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
            icon={ShieldAlert}
            title={category || debouncedSearch ? 'No activity matches these filters' : 'No activity recorded yet'}
            description={
              category || debouncedSearch
                ? 'Try a different category or search term.'
                : 'Signing in, onboarding a client, changing modules or raising an invoice all appear here.'
            }
            className="border-0"
          />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {audit.data!.data.map((entry) => (
                <li key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 sm:w-48">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        CATEGORY_STYLES[entry.category] ?? 'bg-bg-surface-2 text-txt-secondary'
                      }`}
                    >
                      {entry.category}
                    </span>
                    <span className="text-[10px] text-txt-secondary tabular-nums">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-txt-primary font-mono">{entry.action}</div>
                    <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">{entry.details}</p>
                    <p className="text-[10px] text-txt-tertiary mt-1">
                      {entry.actorName} · {entry.actorEmail}
                      {entry.ipAddress && ` · ${entry.ipAddress}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination meta={audit.data!.meta} onPageChange={setPage} label="entries" />
          </>
        )}
      </div>
    </div>
  );
};
