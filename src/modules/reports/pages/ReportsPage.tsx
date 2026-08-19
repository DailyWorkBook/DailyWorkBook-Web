import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/data';
import { EmptyState, ErrorState, TableSkeleton } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { reportsApi, sitesApi, type GenericReport } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';

type ReportKind = 'attendance-summary' | 'exceptions' | 'leave';

const REPORTS: { key: ReportKind; label: string; description: string }[] = [
  { key: 'attendance-summary', label: 'Attendance summary', description: 'Days present, late, absent and on leave, per employee.' },
  { key: 'exceptions', label: 'Exceptions', description: 'Every flagged check-in and how it was decided.' },
  { key: 'leave', label: 'Leave', description: 'Requests raised in the period and their outcome.' },
];

const daysAgo = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

export const ReportsPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();

  const [kind, setKind] = useState<ReportKind>('attendance-summary');
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(daysAgo(0));
  const [siteId, setSiteId] = useState('');
  const [isExporting, setExporting] = useState(false);

  const sites = useQuery({
    queryKey: queryKeys.sites({ pageSize: 100, isActive: true }),
    queryFn: () => sitesApi.list({ pageSize: 100, isActive: true }),
    enabled: can('SITE_VIEW'),
    staleTime: 60_000,
  });

  const params = { kind, from, to, siteId: siteId || undefined };
  // All three reports render through the same table, so they are narrowed to a
  // common rows-and-period shape here rather than at every use site.
  const report = useQuery<GenericReport>({
    queryKey: queryKeys.reports(kind, params),
    queryFn: async (): Promise<GenericReport> => {
      if (kind === 'attendance-summary') {
        const result = await reportsApi.attendanceSummary(from, to, siteId || undefined);
        return {
          rows: result.rows as unknown as Record<string, unknown>[],
          summary: (result.totals ?? {}) as Record<string, unknown>,
          period: result.period,
        };
      }
      return kind === 'exceptions' ? reportsApi.exceptions(from, to) : reportsApi.leave(from, to);
    },
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const csv = await reportsApi.exportCsv(kind, from, to, siteId || undefined);
      // The browser download is created from the response the API returned, so
      // the file always matches exactly what the screen is showing.
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-${from}-to-${to}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch (error) {
      toast.error('The export failed', describeApiError(error));
    } finally {
      setExporting(false);
    }
  };

  const rows = report.data?.rows ?? [];
  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((key) => key !== 'employeeId' && key !== 'id') : [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Analytics"
        eyebrowIcon={<BarChart3 className="w-3.5 h-3.5" aria-hidden />}
        title="Reports"
        description="Aggregated over the resolved attendance record — the same rows the register reads."
        actions={
          can('REPORT_EXPORT') && rows.length > 0 ? (
            <Button
              variant="outline"
              onClick={() => void exportCsv()}
              isLoading={isExporting}
              leftIcon={<Download className="w-3.5 h-3.5" aria-hidden />}
            >
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REPORTS.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setKind(entry.key)}
            aria-pressed={kind === entry.key}
            className={`text-left p-4 rounded-2xl border transition-colors ${
              kind === entry.key
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-border bg-bg-surface hover:border-brand-primary/40'
            }`}
          >
            <div className={`text-sm font-bold ${kind === entry.key ? 'text-brand-primary' : 'text-txt-primary'}`}>
              {entry.label}
            </div>
            <p className="text-[11px] text-txt-secondary mt-1 leading-relaxed">{entry.description}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold text-txt-secondary">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-txt-secondary">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </label>
        {kind === 'attendance-summary' && can('SITE_VIEW') && (
          <label className="flex flex-col gap-1 text-xs font-bold text-txt-secondary">
            Site
            <select
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
              className="px-3 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value="">All sites</option>
              {(sites.data?.data ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {report.isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : report.isError ? (
          <ErrorState message={describeApiError(report.error)} onRetry={() => void report.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No data in this period"
            description="Nothing was recorded between these dates. Widen the range, or record some attendance first."
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/70 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  {columns.map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 whitespace-nowrap">
                      {column.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-bg-surface-2/50 transition-colors">
                    {columns.map((column) => {
                      const value = row[column];
                      return (
                        <td key={column} className="px-4 py-3 tabular-nums whitespace-nowrap">
                          {value === null || value === undefined
                            ? '—'
                            : typeof value === 'object'
                              ? ((value as { name?: string }).name ?? '—')
                              : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
