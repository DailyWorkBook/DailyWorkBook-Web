import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Building2,
  ShieldCheck,
  UserPlus,
  Loader2
} from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';
import { RealtimeClock } from '../../../components/ui/RealtimeClock';
import { Button } from '../../../components/ui/Button';
import { dashboardApi } from '../../../services/dashboardApi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

const lineTrendData = [
  { label: 'Mon', value: 85 },
  { label: 'Tue', value: 110 },
  { label: 'Wed', value: 130 },
  { label: 'Thu', value: 142 },
  { label: 'Fri', value: 138 },
  { label: 'Sat', value: 140 },
  { label: 'Sun', value: 136 }
];

const barChartData = [
  { label: 'Jan', value: 75 },
  { label: 'Feb', value: 82 },
  { label: 'Mar', value: 88 },
  { label: 'Apr', value: 92 },
  { label: 'May', value: 95 },
  { label: 'Jun', value: 96 }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    totalGuards: 148,
    activeSites: 12,
    activePosts: 42,
    presentGuards: 136,
    lateCheckIns: 6,
    onLeave: 4,
    absent: 2,
    pendingExceptions: 4,
    pendingLeaves: 2,
    attendanceRate: 94,
    geofenceCompliance: 98
  });
  const [siteCompliance, setSiteCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const res = await dashboardApi.getOverview();
        if (res?.stats) setStats(res.stats);
        if (res?.siteCompliance) setSiteCompliance(res.siteCompliance);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> LIVE OPERATIONS CONTROL
            </span>
            <span className="text-xs text-txt-secondary">&bull; Real-time Attendance Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Security Command Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <RealtimeClock />
          <Button
            onClick={() => navigate('/employees')}
            className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Add Security Guard
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading live database analytics...
        </div>
      )}

      {!loading && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Active Guards"
              value={stats.totalGuards}
              deltaValue={`${stats.activeSites} Sites | ${stats.activePosts} Posts`}
              icon={<Users className="w-5 h-5" />}
              iconBgColor="bg-blue-500/10 text-blue-600"
            />
            <MetricCard
              label="Present On Duty"
              value={stats.presentGuards}
              deltaValue={`${stats.attendanceRate}% Attendance Rate Today`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconBgColor="bg-emerald-500/10 text-emerald-600"
            />
            <MetricCard
              label="Late Check-ins"
              value={stats.lateCheckIns}
              deltaValue="Within Grace Period Window"
              icon={<Clock className="w-5 h-5" />}
              iconBgColor="bg-amber-500/10 text-amber-600"
            />
            <MetricCard
              label="Pending Exceptions"
              value={stats.pendingExceptions}
              deltaValue="Requires Supervisor Approval"
              icon={<AlertTriangle className="w-5 h-5" />}
              iconBgColor="bg-rose-500/10 text-rose-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-txt-primary">Daily Attendance Trend</h3>
                  <p className="text-xs text-txt-secondary">7-Day guard check-in volume</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last week
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineTrendData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-txt-primary">Geofence Compliance</h3>
                  <p className="text-xs text-txt-secondary">Monthly GPS accuracy percentage</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Site Compliance Table */}
          <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" /> Active Site Guard Deployment
              </h3>
              <button
                onClick={() => navigate('/sites')}
                className="text-xs font-bold text-brand-primary hover:underline"
              >
                View All Sites &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-txt-secondary font-mono uppercase text-[10px]">
                    <th className="pb-2">Site Name</th>
                    <th className="pb-2">Required Guards</th>
                    <th className="pb-2">Present On Duty</th>
                    <th className="pb-2 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {siteCompliance.map((site, i) => (
                    <tr key={i} className="hover:bg-bg-surface-2/40 transition-colors">
                      <td className="py-2.5 font-bold text-txt-primary">{site.siteName}</td>
                      <td className="py-2.5 font-medium">{site.required} Guards</td>
                      <td className="py-2.5 font-medium text-emerald-600">{site.present} Present</td>
                      <td className="py-2.5 text-right font-bold">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600">
                          {site.compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
