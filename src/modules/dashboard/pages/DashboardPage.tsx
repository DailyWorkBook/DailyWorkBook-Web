import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Calendar,
  Settings,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
  Plus,
  Download,
  AlertTriangle,
  Building2,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';
import { RealtimeClock } from '../../../components/ui/RealtimeClock';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { INITIAL_ATTENDANCE, AttendanceRecord } from '../../../mockData/attendance';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const lineTrendData = [
  { label: 'Sun', value: 48 },
  { label: 'Mon', value: 85 },
  { label: 'Tue', value: 110 },
  { label: 'Wed', value: 130 },
  { label: 'Thu', value: 220, highlight: true }, // Peak 91% point
  { label: 'Fri', value: 125 },
  { label: 'Sat', value: 150 },
  { label: 'Sun', value: 205 }
];

const barChartData = [
  { label: 'Jan', value: 75 },
  { label: 'Feb', value: 32 },
  { label: 'Mar', value: 68 },
  { label: 'Apr', value: 135, peak: true }, // Peak bar 86%
  { label: 'May', value: 95 },
  { label: 'Jun', value: 62 }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter attendance overview records
  const filteredRecords = INITIAL_ATTENDANCE.filter(r =>
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const displayedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportMuster = () => {
    let csv = 'Employee Code,Employee Name,Client,Site,Post,Date,Status,Check In,Check Out,Work Hours\n';
    filteredRecords.forEach(r => {
      csv += `"${r.employeeCode}","${r.employeeName}","${r.department}","${r.siteName}","${r.postName}","${r.date}","${r.status}","${r.checkIn}","${r.checkOut}","${r.workHours}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_attendance_muster.csv';
    a.click();
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Executive Command Header */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-brand-primary animate-pulse" />
              Live Security Operations Command Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Executive Operations Dashboard</h1>
          <p className="text-xs text-txt-secondary mt-1">Real-time attendance telemetry, geofence radius tracking, and shift roster compliance across 10 sites</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportMuster}>
            Export Daily Muster
          </Button>
          <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => navigate('/employees')}>
            Onboard New Guard
          </Button>
        </div>
      </div>

      {/* Row 1: Realtime Insight + Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Realtime Insight Card */}
        <div className="wt-card p-5 bg-gradient-to-br from-brand-primary/10 via-bg-surface to-brand-teal/5 border border-brand-primary/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary uppercase tracking-wider">
              <Clock className="w-4 h-4 text-brand-primary animate-pulse" />
              <span>Realtime Telemetry</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
              Aug 18, 2026
            </span>
          </div>

          <div className="my-3">
            <RealtimeClock />
            <div className="text-xs text-txt-secondary mt-1">10 Site Campuses Live Monitored</div>
          </div>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Settings className="w-3.5 h-3.5" />}
            onClick={() => navigate('/settings')}
            className="w-full text-xs shadow-md shadow-brand-primary/20"
          >
            System Settings & Geofence Config
          </Button>
        </div>

        {/* Metric 1: Total Employees */}
        <MetricCard
          label="Total Registered Guards"
          value={452}
          icon={<Users className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-brand-primary-050 text-brand-primary"
          deltaValue="+3.2% vs yesterday"
          deltaType="up"
        />

        {/* Metric 2: On Time */}
        <MetricCard
          label="Present On-Duty"
          value={360}
          icon={<CheckCircle2 className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-brand-teal-050 text-brand-teal"
          deltaValue="+3% Increase"
          deltaType="up"
        />

        {/* Metric 3: Absent */}
        <MetricCard
          label="Absent Guards"
          value={30}
          icon={<XCircle className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-status-absent/10 text-status-absent"
          deltaValue="-10% Standbys Deployed"
          deltaType="down"
        />
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <MetricCard
          label="Late Arrival Check-ins"
          value={62}
          icon={<Clock className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-status-late/10 text-status-late"
          deltaValue="+1.4% Grace Applied"
          deltaType="up"
        />

        <MetricCard
          label="Early Departures"
          value={6}
          icon={<LogOut className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-status-absent/10 text-status-absent"
          deltaValue="-2.5% decrease"
          deltaType="down"
        />

        <MetricCard
          label="Approved Time-off / Leaves"
          value={42}
          icon={<Calendar className="w-5 h-5 stroke-[1.75]" />}
          iconBgColor="bg-status-leave/10 text-status-leave"
          deltaValue="Same as quota average"
          deltaType="flat"
        />
      </div>

      {/* Row 3: Charts Row (Line Chart + Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Attendance Comparison Chart (2/3 width) */}
        <div className="lg:col-span-2 wt-card p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                <span>7-Day Attendance Telemetry Trend</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                  91% Peak Compliance
                </span>
              </h3>
              <p className="text-xs text-txt-secondary mt-0.5">Historical check-in performance across all client shifts</p>
            </div>

            {/* Segmented Control Toggle + Filter Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-bg-surface-2 border border-border rounded-xl">
                {(['Daily', 'Weekly', 'Monthly'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      timeRange === range
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-txt-secondary hover:text-txt-primary'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button className="p-2 border border-border rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Line Chart Area */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6BFF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2F6BFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="wt-card p-2 text-xs font-semibold shadow-lg bg-txt-primary text-bg-surface">
                          <div>Aug 18, 2026</div>
                          <div className="text-brand-primary">{payload[0].value} Check-ins</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2F6BFF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Weekly Attendance (1/3 width) */}
        <div className="wt-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-txt-primary">Monthly Performance</h3>
              <p className="text-xs text-txt-secondary mt-0.5">Top performing shift peak 86%</p>
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 25, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="label" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.peak ? '#2F6BFF' : '#12B5A5'}
                      fillOpacity={entry.peak ? 1 : 0.65}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Live Attendance Overview Table */}
      <div className="wt-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-txt-primary">Live Attendance Overview</h3>
            <p className="text-xs text-txt-secondary">Real-time attendance check-in logs across all client posts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
              <input
                type="text"
                placeholder="Search employee or code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>

            {/* Advanced Filters Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => navigate('/attendance')}
            >
              Full Register View
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD CODE & NAME</th>
                <th>POSITION ROLE</th>
                <th>CLIENT / SITE CAMPUS</th>
                <th>DUTY POST</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>HOURS</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={r.photoUrl} alt={r.employeeName} className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                      <div>
                        <div className="font-bold text-xs text-txt-primary">{r.employeeName}</div>
                        <div className="text-[11px] text-txt-secondary font-mono">{r.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs font-semibold text-txt-primary">{r.role}</td>
                  <td className="text-xs text-txt-primary font-bold">{r.department}</td>
                  <td className="text-xs font-medium text-brand-primary">
                    {r.siteName} - <span className="text-txt-secondary">{r.postName}</span>
                  </td>
                  <td className="text-xs text-txt-secondary font-mono tabular-nums">{r.date}</td>
                  <td>
                    <Badge status={r.status} />
                  </td>
                  <td className="text-xs text-txt-primary font-bold font-mono tabular-nums">{r.checkIn}</td>
                  <td className="text-xs text-txt-secondary font-mono tabular-nums">{r.checkOut}</td>
                  <td className="text-xs font-bold text-brand-teal font-mono tabular-nums">{r.workHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-txt-secondary">
          <div>
            Showing <span className="font-semibold text-txt-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-txt-primary">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of{' '}
            <span className="font-semibold text-txt-primary">{filteredRecords.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border rounded-lg hover:bg-bg-surface-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-txt-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border rounded-lg hover:bg-bg-surface-2 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
