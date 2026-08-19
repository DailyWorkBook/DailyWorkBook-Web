import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { queryKeys } from '../../../core/query';
import { dashboardApi } from '../../../services';
import { ErrorState } from '../../../components/feedback/States';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

/**
 * The trend is drawn from resolved attendance rows. Days with nothing recorded
 * have a null rate and are simply absent from the line — the chart does not
 * connect through them and pretend a figure exists.
 */
export const AttendanceTrendChart: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.dashboardTrend(14),
    queryFn: () => dashboardApi.trend(14),
  });

  if (isLoading) return <div className="h-56 rounded-xl bg-bg-surface-2 animate-pulse" aria-hidden />;
  if (isError) return <ErrorState message={describeApiError(error)} onRetry={() => void refetch()} />;

  const points = data ?? [];
  const hasAnyData = points.some((point) => point.rate !== null);

  if (!hasAnyData) {
    return (
      <div className="h-56 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center px-6">
        <p className="text-xs font-semibold text-txt-primary">No attendance recorded in this period yet</p>
        <p className="text-[11px] text-txt-secondary max-w-xs leading-relaxed">
          Once your team is rostered and starts checking in, the daily attendance rate appears here.
        </p>
      </div>
    );
  }

  const series = points.map((point) => ({
    label: new Date(`${point.date}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    rate: point.rate,
    present: point.present,
    expected: point.expected,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value, _name, item) => {
              const payload = item.payload as { present: number; expected: number };
              return [
                value === null || value === undefined
                  ? 'No data'
                  : `${value}% (${payload.present}/${payload.expected})`,
                'Attendance',
              ];
            }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="var(--brand-primary)"
            strokeWidth={2.5}
            fill="url(#attendanceTrendFill)"
            connectNulls={false}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
