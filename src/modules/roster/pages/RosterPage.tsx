import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog, PageHeader, Pagination } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { employeesApi, rosterApi, sitesApi, type RosterEntry, type Shift } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';
import { ShiftFormDialog } from '../components/ShiftFormDialog';
import { RosterEntryDialog } from '../components/RosterEntryDialog';

const todayIso = () => new Date().toISOString().slice(0, 10);

export const RosterPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'shifts' | 'roster'>('shifts');
  const [rosterDate, setRosterDate] = useState(todayIso());
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isShiftFormOpen, setShiftFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isEntryFormOpen, setEntryFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RosterEntry | null>(null);

  const sites = useQuery({
    queryKey: queryKeys.sites({ pageSize: 100, isActive: true }),
    queryFn: () => sitesApi.list({ pageSize: 100, isActive: true }),
    enabled: can('SITE_VIEW'),
    staleTime: 60_000,
  });

  const shiftParams = { pageSize: 100, siteId: siteFilter || undefined, isActive: true };
  const shifts = useQuery({
    queryKey: queryKeys.shifts(shiftParams),
    queryFn: () => rosterApi.listShifts(shiftParams),
  });

  const entryParams = { page, pageSize: 25, from: rosterDate, to: rosterDate, siteId: siteFilter || undefined };
  const entries = useQuery({
    queryKey: queryKeys.rosterEntries(entryParams),
    queryFn: () => rosterApi.listEntries(entryParams),
    enabled: tab === 'roster',
  });

  const validation = useQuery({
    queryKey: queryKeys.rosterValidation(rosterDate, siteFilter || undefined),
    queryFn: () => rosterApi.validate(rosterDate, siteFilter || undefined),
    enabled: tab === 'roster',
  });

  const employees = useQuery({
    queryKey: queryKeys.employees({ pageSize: 200, status: 'ACTIVE' }),
    queryFn: () => employeesApi.list({ pageSize: 200, status: 'ACTIVE' }),
    enabled: can('EMPLOYEE_VIEW'),
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['roster'] });
    void queryClient.invalidateQueries({ queryKey: ['shifts'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const publish = useMutation({
    mutationFn: () => rosterApi.publish(rosterDate, siteFilter || undefined),
    onSuccess: (result) => {
      toast.success(
        'Roster published',
        `${result.published} entr${result.published === 1 ? 'y is' : 'ies are'} now live${
          result.warnings.length > 0 ? `, with ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}` : ''
        }.`,
      );
      invalidate();
    },
    onError: (error) => toast.error('The roster could not be published', describeApiError(error)),
  });

  const removeEntry = useMutation({
    mutationFn: (entry: RosterEntry) => rosterApi.removeEntry(entry.id),
    onSuccess: () => {
      toast.success('Roster entry cancelled');
      setPendingDelete(null);
      invalidate();
    },
    onError: (error) => toast.error('Could not cancel the entry', describeApiError(error)),
  });

  const shiftList = shifts.data?.data ?? [];
  const hasShifts = shiftList.length > 0;
  const conflicts = validation.data;

  const draftCount = useMemo(
    () => (entries.data?.data ?? []).filter((entry) => entry.status === 'DRAFT').length,
    [entries.data],
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Deployment planning"
        eyebrowIcon={<CalendarDays className="w-3.5 h-3.5" aria-hidden />}
        title="Shifts & roster"
        description="Shifts belong to a post; roster entries put a person on a shift for a date."
        actions={
          tab === 'shifts'
            ? can('SHIFT_CREATE') && (
                <Button
                  onClick={() => {
                    setEditingShift(null);
                    setShiftFormOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" aria-hidden />}
                >
                  Define shift
                </Button>
              )
            : can('ROSTER_CREATE') && (
                <Button onClick={() => setEntryFormOpen(true)} disabled={!hasShifts} leftIcon={<Plus className="w-4 h-4" aria-hidden />}>
                  Assign to shift
                </Button>
              )
        }
      />

      <div className="flex gap-1 border-b border-border" role="tablist">
        {(
          [
            ['shifts', 'Shift definitions'],
            ['roster', 'Daily roster'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors min-h-[40px] ${
              tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {can('SITE_VIEW') && (
        <select
          value={siteFilter}
          onChange={(event) => {
            setSiteFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by site"
          className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 max-w-xs"
        >
          <option value="">All sites</option>
          {(sites.data?.data ?? []).map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      )}

      {tab === 'shifts' && (
        <>
          {shifts.isLoading ? (
            <TableSkeleton rows={3} columns={4} />
          ) : shifts.isError ? (
            <ErrorState message={describeApiError(shifts.error)} onRetry={() => void shifts.refetch()} />
          ) : shiftList.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No shifts defined yet"
              description={
                (sites.data?.data.length ?? 0) === 0
                  ? 'A shift belongs to a post, and a post belongs to a site. Add a site and a post first.'
                  : 'Define the working windows your posts are staffed across — start and end time, grace period and weekly off.'
              }
              action={
                (sites.data?.data.length ?? 0) === 0
                  ? { label: 'Go to sites', onClick: () => window.location.assign('/sites') }
                  : can('SHIFT_CREATE')
                    ? {
                        label: 'Define the first shift',
                        onClick: () => {
                          setEditingShift(null);
                          setShiftFormOpen(true);
                        },
                        icon: <Plus className="w-3.5 h-3.5" />,
                      }
                    : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {shiftList.map((shift) => (
                <article key={shift.id} className="bg-bg-surface border border-border rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-sm text-txt-primary truncate">{shift.name}</h2>
                      <span className="text-[10px] font-mono text-brand-primary">{shift.code}</span>
                    </div>
                    {shift.isNightShift && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-status-leave/10 text-status-leave flex-shrink-0">
                        Night
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-sm font-bold text-brand-teal tabular-nums">
                    {shift.startTime} – {shift.endTime}
                  </div>

                  <dl className="text-[11px] text-txt-secondary space-y-1">
                    <div className="flex justify-between">
                      <dt>Site</dt>
                      <dd className="font-semibold text-txt-primary">{shift.site.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Post</dt>
                      <dd className="font-semibold text-txt-primary">{shift.post.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Grace</dt>
                      <dd className="font-semibold text-txt-primary">{shift.graceMinutes} min</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Half-day after</dt>
                      <dd className="font-semibold text-txt-primary">{shift.lateHalfDayAfterMin} min</dd>
                    </div>
                  </dl>

                  {can('SHIFT_UPDATE') && (
                    <button
                      onClick={() => {
                        setEditingShift(shift);
                        setShiftFormOpen(true);
                      }}
                      className="text-[11px] font-bold text-brand-primary hover:underline pt-2 border-t border-border/60 w-full text-left"
                    >
                      Edit shift
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-txt-secondary">
              Date
              <input
                type="date"
                value={rosterDate}
                onChange={(event) => {
                  setRosterDate(event.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </label>

            {can('ROSTER_PUBLISH') && draftCount > 0 && (
              <Button
                onClick={() => publish.mutate()}
                isLoading={publish.isPending}
                disabled={conflicts ? !conflicts.canPublish : false}
                title={conflicts && !conflicts.canPublish ? 'Resolve the blocking conflicts first' : undefined}
                leftIcon={<Send className="w-3.5 h-3.5" aria-hidden />}
              >
                Publish {draftCount} draft{draftCount === 1 ? '' : 's'}
              </Button>
            )}
          </div>

          {/* Conflicts are shown before publishing is attempted; the server
              refuses a blocked publish regardless of what the button says. */}
          {validation.isSuccess && conflicts && conflicts.conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.blocking.length > 0 && (
                <div className="p-4 rounded-2xl border border-status-absent/30 bg-status-absent/5 space-y-2">
                  <h2 className="text-xs font-extrabold text-status-absent flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" aria-hidden /> {conflicts.blocking.length} blocking conflict
                    {conflicts.blocking.length === 1 ? '' : 's'} — publishing is disabled
                  </h2>
                  <ul className="space-y-1 text-[11px] text-txt-secondary">
                    {conflicts.blocking.map((conflict, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-status-absent mt-0.5" aria-hidden>•</span>
                        <span>{conflict.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {conflicts.warnings.length > 0 && (
                <div className="p-4 rounded-2xl border border-status-late/30 bg-status-late/5 space-y-2">
                  <h2 className="text-xs font-extrabold text-status-late flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" aria-hidden /> {conflicts.warnings.length} warning
                    {conflicts.warnings.length === 1 ? '' : 's'} — publishing is still allowed
                  </h2>
                  <ul className="space-y-1 text-[11px] text-txt-secondary">
                    {conflicts.warnings.slice(0, 6).map((conflict, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-status-late mt-0.5" aria-hidden>•</span>
                        <span>{conflict.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {validation.isSuccess && conflicts && conflicts.conflicts.length === 0 && conflicts.entries > 0 && (
            <div className="p-3 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 text-xs font-bold text-brand-teal flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" aria-hidden /> No conflicts on this date.
            </div>
          )}

          <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            {entries.isLoading ? (
              <TableSkeleton rows={4} columns={5} />
            ) : entries.isError ? (
              <ErrorState message={describeApiError(entries.error)} onRetry={() => void entries.refetch()} />
            ) : entries.data!.data.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nobody is rostered on this date"
                description={
                  hasShifts
                    ? 'Assign employees to a shift to build the day.'
                    : 'Define a shift first — a roster entry always sits on one.'
                }
                action={
                  hasShifts && can('ROSTER_CREATE')
                    ? { label: 'Assign to shift', onClick: () => setEntryFormOpen(true), icon: <Plus className="w-3.5 h-3.5" /> }
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
                        <th scope="col" className="px-4 py-3">Site & post</th>
                        <th scope="col" className="px-4 py-3">Shift</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {entries.data!.data.map((entry) => (
                        <tr key={entry.id} className="hover:bg-bg-surface-2/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-txt-primary">{entry.employee.name}</div>
                            <div className="text-[10px] font-mono text-txt-secondary">{entry.employee.employeeCode}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-txt-primary">{entry.site.name}</div>
                            <div className="text-[10px] text-txt-secondary">{entry.post.name}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-brand-teal font-semibold tabular-nums">
                            {entry.shift.startTime} – {entry.shift.endTime}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                entry.status === 'PUBLISHED'
                                  ? 'bg-brand-teal/10 text-brand-teal'
                                  : entry.status === 'CANCELLED'
                                    ? 'bg-status-absent/10 text-status-absent'
                                    : 'bg-status-pending/10 text-txt-secondary'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {can('ROSTER_DELETE') && entry.status !== 'CANCELLED' && (
                              <button
                                onClick={() => setPendingDelete(entry)}
                                aria-label={`Cancel roster entry for ${entry.employee.name}`}
                                className="text-status-absent p-1 rounded-md hover:bg-status-absent/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination meta={entries.data!.meta} onPageChange={setPage} label="roster entries" />
              </>
            )}
          </div>
        </div>
      )}

      {isShiftFormOpen && (
        <ShiftFormDialog
          shift={editingShift}
          sites={sites.data?.data ?? []}
          onClose={() => setShiftFormOpen(false)}
          onSaved={() => {
            setShiftFormOpen(false);
            toast.success(editingShift ? 'Shift updated' : 'Shift defined');
            invalidate();
          }}
        />
      )}

      {isEntryFormOpen && (
        <RosterEntryDialog
          shifts={shiftList}
          employees={employees.data?.data ?? []}
          defaultDate={rosterDate}
          onClose={() => setEntryFormOpen(false)}
          onSaved={() => {
            setEntryFormOpen(false);
            toast.success('Employee rostered', 'The entry is a draft until the day is published.');
            invalidate();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Cancel this roster entry?"
        message={`${pendingDelete?.employee.name ?? 'This person'} will no longer be scheduled for that shift.`}
        confirmLabel="Cancel entry"
        tone="destructive"
        isBusy={removeEntry.isPending}
        onConfirm={() => pendingDelete && removeEntry.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
