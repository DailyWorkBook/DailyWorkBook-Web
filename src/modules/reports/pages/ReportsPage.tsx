import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileSpreadsheet, Filter, CheckCircle2, FileText, Calendar, Building2, ShieldCheck, Printer, Search, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { INITIAL_EMPLOYEES } from '../../../mockData/employees';
import { INITIAL_SITES } from '../../../mockData/sites';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import confetti from 'canvas-confetti';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('attendance_summary');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-18');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const availableSites = INITIAL_SITES.filter(s => !selectedClientId || s.clientId === selectedClientId);

  const reportData = INITIAL_EMPLOYEES.map((e, idx) => ({
    id: e.id,
    code: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    client: e.currentClientName,
    site: e.currentSiteName,
    post: e.currentPostName,
    present: 16 - (idx % 3),
    late: idx % 3,
    absent: idx % 2,
    leave: idx % 2 === 0 ? 1 : 0,
    overtimeHours: idx * 2.5,
    complianceScore: 92 + (idx % 8),
    rate: 90 + (idx % 8)
  })).filter(r => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.site.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClient = !selectedClientId || INITIAL_EMPLOYEES.find(e => e.id === r.id)?.clientId === selectedClientId;
    const matchSite = !selectedSiteId || INITIAL_EMPLOYEES.find(e => e.id === r.id)?.currentSiteId === selectedSiteId;
    return matchSearch && matchClient && matchSite;
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportCSV = () => {
    let csv = 'Employee Code,Name,Client,Site,Duty Post,Present Days,Late Days,Absent Days,Leave Days,Overtime Hrs,Compliance Score %,Attendance Rate %\n';
    reportData.forEach(r => {
      csv += `"${r.code}","${r.name}","${r.client}","${r.site}","${r.post}",${r.present},${r.late},${r.absent},${r.leave},${r.overtimeHours}hrs,${r.complianceScore}%,${r.rate}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${startDate}_to_${endDate}.csv`;
    a.click();

    confetti({ particleCount: 50, spread: 60 });
    triggerToast(`Exported ${reportType.replace(/_/g, ' ').toUpperCase()} report to CSV!`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              Workforce Intelligence & Audit Exports
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Reports & Analytics Export</h1>
          <p className="text-xs text-txt-secondary mt-1">Generate comprehensive monthly attendance registers, client wage muster reports, geofence audit logs, and compliance analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrintReport}>
            Print Summary
          </Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Exported Reports</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">1,420 Reports</div>
            <span className="text-[11px] text-txt-secondary">CSV / Excel / PDF</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Overall On-time Compliance</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">94.8%</div>
            <span className="text-[11px] text-txt-secondary">+2.4% vs last month</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Tracked Shift Hours</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">10,240 Hrs</div>
            <span className="text-[11px] text-txt-secondary">This month to date</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Audit Verification Rate</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">100%</div>
            <span className="text-[11px] text-txt-secondary">Geofence & QR Verified</span>
          </div>
          <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Report Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {[
          { id: 'attendance_summary', name: 'Guard Attendance Register', desc: 'Monthly present, late, absent, and leave tallies per guard', icon: FileSpreadsheet, color: 'text-brand-primary bg-brand-primary-050' },
          { id: 'payroll_muster', name: 'Client Wage & Payroll Muster', desc: 'Itemized basic wages, overtime, night shift allowance, and statutory deductions', icon: DollarSign, color: 'text-brand-teal bg-brand-teal-050' },
          { id: 'exceptions_audit', name: 'Geofence & Overrides Audit', desc: 'Log of manual supervisor overrides and geofence boundary deviations', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' }
        ].map(preset => {
          const Icon = preset.icon;
          const isSelected = reportType === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setReportType(preset.id)}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-brand-primary-050/60 border-brand-primary text-brand-primary shadow-sm'
                  : 'bg-bg-surface-2 border-border text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-3'
              }`}
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${preset.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-txt-primary">{preset.name}</div>
                <div className="text-[11px] text-txt-secondary mt-0.5 leading-relaxed">{preset.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Builder Parameters */}
      <div className="wt-card p-6 space-y-4">
        <h3 className="text-base font-bold text-txt-primary">Custom Report Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Corporate Client</label>
            <select
              value={selectedClientId}
              onChange={e => { setSelectedClientId(e.target.value); setSelectedSiteId(''); }}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
            >
              <option value="">All Corporate Clients</option>
              {INITIAL_CLIENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Filter Site Campus</label>
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
            >
              <option value="">All Site Campuses</option>
              {availableSites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
            />
          </div>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="wt-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-txt-primary">Report Data Preview ({reportData.length} Guards)</h3>
            <p className="text-xs text-txt-secondary">Showing calculated metrics for selected date range ({startDate} to {endDate})</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
            <input
              type="text"
              placeholder="Search in preview..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD CODE & NAME</th>
                <th>CLIENT / SITE / POST</th>
                <th>PRESENT</th>
                <th>LATE</th>
                <th>ABSENT</th>
                <th>LEAVE</th>
                <th>OVERTIME</th>
                <th>COMPLIANCE</th>
                <th>ATTENDANCE RATE</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="font-bold text-xs text-txt-primary">{r.name}</div>
                    <div className="font-mono text-[11px] text-txt-secondary">{r.code}</div>
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-txt-primary">{r.client}</div>
                    <div className="text-[11px] text-txt-secondary">{r.site} - <span className="text-txt-tertiary">{r.post}</span></div>
                  </td>
                  <td className="font-bold text-brand-teal tabular-nums">{r.present} Days</td>
                  <td className="font-bold text-status-late tabular-nums">{r.late} Days</td>
                  <td className="font-bold text-status-absent tabular-nums">{r.absent} Days</td>
                  <td className="text-txt-secondary tabular-nums">{r.leave} Days</td>
                  <td className="font-mono font-bold text-brand-primary tabular-nums">{r.overtimeHours} hrs</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-teal/10 text-brand-teal">
                      {r.complianceScore}% Score
                    </span>
                  </td>
                  <td>
                    <div className="font-extrabold text-xs text-brand-primary tabular-nums">{r.rate}%</div>
                    <div className="w-16 h-1.5 bg-bg-surface-2 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${r.rate}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
