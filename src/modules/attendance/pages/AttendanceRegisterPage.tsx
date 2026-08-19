import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PageHeader, Pagination, SearchInput, SortableHeader } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { attendanceApi, sitesApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced, useToast } from '../../../hooks';

const STATES = [
  'PRESENT', 'LATE_IN', 'LATE_IN_HALF_DAY', 'ABSENT', 'ON_LEAVE',
  'HALF_DAY_LEAVE', 'HOLIDAY', 'EARLY_EXIT', 'EXCEPTION_PENDING', 'COMP_OFF',
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—';

const formatDuration = (minutes: number) =>
  minutes > 0 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : '—';

export const AttendanceRegisterPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(todayIso());
  const [state, setState] = useState('');
  const [siteId, setSiteId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounced(search);
  const params = {
    page,
    pageSize,
    sort,
    order,
    date,
    state: state || undefined,
    siteId: siteId || undefined,
    q: debouncedSearch || undefined,
  };

  const register = useQuery({
    queryKey: queryKeys.register(params),
    queryFn: () => attendanceApi.register(params),
  });

  const sites = useQuery({
    queryKey: queryKeys.sites({ pageSize: 100, isActive: true }),
    queryFn: () => sitesApi.list({ pageSize: 100, isActive: true }),
    enabled: can('SITE_VIEW'),
    staleTime: 60_000,
  });

  const recompute = useMutation({
    mutationFn: () => attendanceApi.recompute(date),
    onSuccess: (result) => {
      toast.success('Register rebuilt', `${result.employees} employee-day${result.employees === 1 ? '' : 's'} recomputed.`);
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => toast.error('Could not rebuild the register', describeApiError(error)),
  });

  const toggleSort = (field: string) => {
    if (sort === field) setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const summary = (register.data?.meta.summary ?? {}) as Record<string, number>;
  const hasFilters = Boolean(state || siteId || debouncedSearch);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Attendance"
        eyebrowIcon={<CalendarCheck className="w-3.5 h-3.5" aria-hidden />}
        title="Daily register"
        description="One resolved row per person per day, built from their check-ins, roster and approved leave."
        actions={
          can('ATTENDANCE_MANUAL_ENTRY') ? (
            <Button
              variant="outline"
              onClick={() => recompute.mutate()}
              isLoading={recompute.isPending}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" aria-hidden />}
            >
              Rebuild this day
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col lg:flex-row gap-3">
        <label className="flex items-center gap-2 text-xs font-bold text-txt-secondary">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </label>

        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by employee name or code…"
          className="flex-1 max-w-sm"
          label="Search the register"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={state}
            onChange={(event) => {
              setState(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by attendance state"
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          >
            <option value="">All states</option>
            {STATES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {can('SITE_VIEW') && (
            <select
              value={siteId}
              onChange={(event) => {
                setSiteId(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by site"
              className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value="">All sites</option>
              {(sites.data?.data ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary).map(([key, count]) => (
            <span key={key} className="px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-[11px]">
              <span className="text-txt-secondary">{key.replace(/_/g, ' ')}</span>{' '}
              <span className="font-bold text-txt-primary tabular-nums">{count}</span>
            </span>
          ))}
        </div>
      )}

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {register.isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : register.isError ? (
          <ErrorState message={describeApiError(register.error)} onRetry={() => void register.refetch()} />
        ) : register.data!.data.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={hasFilters ? 'No records match these filters' : 'Nothing recorded for this date'}
            description={
              hasFilters
                ? 'Try a different state, site or search term.'
                : 'A row appears once someone is rostered for the day, checks in, or has approved leave covering it.'
            }
            action={
              hasFilters
                ? {
                    label: 'Clear filters',
                    onClick: () => {
                      setState('');
                      setSiteId('');
                      setSearch('');
                      setPage(1);
                    },
                  }
                : undefined
            }
            className="border-0"
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Employee</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Deployment</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Check in</th>
                    <th scope="col" className="px-4 py-3 font-mono uppercase text-[10px] tracking-wide">Check out</th>
                    <SortableHeader field="workedMinutes" label="Worked" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                    <SortableHeader field="state" label="State" currentSort={sort} currentOrder={order} onSort={toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {register.data!.data.map((row) => (
                    <tr key={row.id} className="hover:bg-bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{row.employee.name}</div>
                        <div className="text-[10px] font-mono text-txt-secondary">{row.employee.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-txt-primary">{row.site?.name ?? '—'}</div>
                        <div className="text-[10px] text-txt-secondary">{row.post?.name ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatTime(row.firstCheckInAt)}
                        {row.isLate && <span className="ml-1 text-[10px] text-status-late">+{row.lateByMinutes}m</span>}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatTime(row.lastCheckOutAt)}
                        {row.isEarlyExit && <span className="ml-1 text-[10px] text-status-late">early</span>}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{formatDuration(row.workedMinutes)}</td>
                      <td className="px-4 py-3">
                        <Badge status={row.state} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border/60">
              {register.data!.data.map((row) => (
                <div key={row.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-txt-primary truncate">{row.employee.name}</div>
                      <div className="text-[11px] font-mono text-txt-secondary">{row.employee.employeeCode}</div>
                    </div>
                    <Badge status={row.state} />
                  </div>
                  <div className="text-xs text-txt-secondary space-y-0.5">
                    <div>{row.site?.name ?? '—'} · {row.post?.name ?? '—'}</div>
                    <div className="tabular-nums">
                      In {formatTime(row.firstCheckInAt)} · Out {formatTime(row.lastCheckOutAt)} ·{' '}
                      {formatDuration(row.workedMinutes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              meta={register.data!.meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="records"
            />
          </>
        )}
      </div>
    </div>
  );
};
