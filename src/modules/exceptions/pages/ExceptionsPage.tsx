import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader, Pagination } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { exceptionsApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';

const REASON_LABELS: Record<string, string> = {
  MANUAL_ENTRY: 'Entered by an administrator',
  OUTSIDE_GEOFENCE: 'Recorded outside the site geofence',
  LOCATION_UNKNOWN: 'No location was captured',
  SEVERELY_LATE: 'Arrived well beyond the grace period',
};

export const ExceptionsPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const params = { page, pageSize: 25, status: 'PENDING' };
  const exceptions = useQuery({
    queryKey: queryKeys.exceptions(params),
    queryFn: () => exceptionsApi.list(params),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['exceptions'] });
    void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const decide = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      approve ? exceptionsApi.approve(id, note || undefined) : exceptionsApi.reject(id, note || undefined),
    onSuccess: (_, variables) => {
      toast.success(
        variables.approve ? 'Exception approved' : 'Exception rejected',
        'The affected day has been recomputed.',
      );
      setSelected((current) => current.filter((id) => id !== variables.id));
      invalidate();
    },
    onError: (error) => toast.error('The decision could not be recorded', describeApiError(error)),
  });

  const decideBulk = useMutation({
    mutationFn: (approve: boolean) => exceptionsApi.bulk(selected, approve ? 'approve' : 'reject', note || undefined),
    onSuccess: (result) => {
      toast.success(
        `${result.decided} exception${result.decided === 1 ? '' : 's'} ${result.action.toLowerCase()}`,
        result.skipped.length > 0 ? `${result.skipped.length} were already decided and were skipped.` : undefined,
      );
      setSelected([]);
      setNote('');
      invalidate();
    },
    onError: (error) => toast.error('The batch could not be processed', describeApiError(error)),
  });

  const rows = exceptions.data?.data ?? [];
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Approval queue"
        eyebrowIcon={<ShieldCheck className="w-3.5 h-3.5" aria-hidden />}
        title="Attendance exceptions"
        description="Check-ins the system could not validate on its own. Each affected day stays frozen until it is decided."
      />

      {exceptions.isLoading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : exceptions.isError ? (
        <ErrorState message={describeApiError(exceptions.error)} onRetry={() => void exceptions.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up"
          description="Nothing is waiting for review. Exceptions appear here when a check-in falls outside a geofence, carries no location, or is entered by hand."
        />
      ) : (
        <>
          {can('EXCEPTION_APPROVE') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-bg-surface border border-border rounded-2xl">
              <label className="flex items-center gap-2 text-xs font-bold text-txt-secondary">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])}
                />
                Select all on this page
              </label>

              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note recorded with the decision"
                aria-label="Decision note"
                className="flex-1 px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />

              <div className="flex gap-2">
                <Button
                  variant="teal"
                  size="sm"
                  disabled={selected.length === 0}
                  isLoading={decideBulk.isPending}
                  onClick={() => decideBulk.mutate(true)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" aria-hidden />}
                >
                  Approve {selected.length || ''}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selected.length === 0}
                  isLoading={decideBulk.isPending}
                  onClick={() => decideBulk.mutate(false)}
                  leftIcon={<XCircle className="w-3.5 h-3.5" aria-hidden />}
                >
                  Reject {selected.length || ''}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {rows.map((event) => (
                <motion.article
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 overflow-hidden"
                >
                  {can('EXCEPTION_APPROVE') && (
                    <input
                      type="checkbox"
                      checked={selected.includes(event.id)}
                      onChange={(changeEvent) =>
                        setSelected((current) =>
                          changeEvent.target.checked
                            ? [...current, event.id]
                            : current.filter((id) => id !== event.id),
                        )
                      }
                      aria-label={`Select the exception for ${event.employee.name}`}
                      className="flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-txt-primary">{event.employee.name}</span>
                      <span className="text-[10px] font-mono text-txt-secondary">{event.employee.employeeCode}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-status-late/10 text-status-late">
                        {event.eventType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-bg-surface-2 text-txt-secondary border border-border">
                        {event.method}
                      </span>
                    </div>

                    <p className="text-xs text-txt-secondary">
                      {REASON_LABELS[event.exceptionReason ?? ''] ?? 'Needs review'}
                      {event.distanceMeters !== null && event.withinGeofence === false && (
                        <span className="ml-1 font-semibold text-status-absent">
                          ({Math.round(event.distanceMeters)} m away)
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-txt-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden /> {event.site.name} · {event.post.name}
                      </span>
                      <span className="tabular-nums">
                        {new Date(event.occurredAt).toLocaleString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>{event.shift.name}</span>
                    </div>

                    {event.note && (
                      <p className="text-[11px] text-txt-secondary italic border-l-2 border-border pl-2 mt-1">
                        “{event.note}”
                      </p>
                    )}
                  </div>

                  {can('EXCEPTION_APPROVE') && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="teal"
                        size="sm"
                        isLoading={decide.isPending && decide.variables?.id === event.id}
                        onClick={() => decide.mutate({ id: event.id, approve: true })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        isLoading={decide.isPending && decide.variables?.id === event.id}
                        onClick={() => decide.mutate({ id: event.id, approve: false })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl">
            <Pagination meta={exceptions.data!.meta} onPageChange={setPage} label="exceptions" />
          </div>
        </>
      )}
    </div>
  );
};
