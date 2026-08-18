import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Plus, Filter, Calendar, Building2, CheckCircle2, Clock, AlertTriangle, Radio, ShieldCheck, MapPin, QrCode, Camera, Eye, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { Dialog } from '../../../components/ui/Dialog';
import { INITIAL_ATTENDANCE, AttendanceRecord } from '../../../mockData/attendance';
import { INITIAL_SITES } from '../../../mockData/sites';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import { INITIAL_EMPLOYEES } from '../../../mockData/employees';
import confetti from 'canvas-confetti';

export const AttendanceRegisterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Manual entry state
  const [manualEmp, setManualEmp] = useState(INITIAL_EMPLOYEES[0].id);
  const [manualSite, setManualSite] = useState(INITIAL_SITES[0].id);
  const [manualPost, setManualPost] = useState(INITIAL_SITES[0].posts[0].id);
  const [manualCheckIn, setManualCheckIn] = useState('08:00 AM');
  const [manualNote, setManualNote] = useState('');

  const availableSites = INITIAL_SITES.filter(s => !selectedClientId || s.clientId === selectedClientId);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredRecords = INITIAL_ATTENDANCE.filter(r => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = !selectedClientId || r.department.toLowerCase().includes(selectedClientId.toLowerCase());
    const matchesSite = !selectedSiteId || r.siteName.toLowerCase().includes(selectedSiteId.toLowerCase());
    const matchesStatus = !selectedStatus || r.status === selectedStatus;
    return matchesSearch && matchesClient && matchesSite && matchesStatus;
  });

  const handleExportCSV = () => {
    let csv = 'Employee Code,Employee Name,Client,Site,Post,Date,Status,Check In,Check Out,Work Hours,Geofence Distance\n';
    filteredRecords.forEach(r => {
      csv += `"${r.employeeCode}","${r.employeeName}","${r.department}","${r.siteName}","${r.postName}","${r.date}","${r.status}","${r.checkIn}","${r.checkOut}","${r.workHours}","12m"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_register_export.csv';
    a.click();

    confetti({ particleCount: 50, spread: 60 });
    triggerToast('Exported Attendance Register to CSV successfully!');
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsManualModalOpen(false);
    confetti({ particleCount: 50, spread: 60 });
    triggerToast('Manual attendance record submitted and verified by supervisor!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Page Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              Realtime Attendance Master & Verification Log
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Attendance Register</h1>
          <p className="text-xs text-txt-secondary mt-1">Daily check-in/check-out logs, geofence radius verification, and manual supervisor overrides</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export CSV Register
          </Button>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsManualModalOpen(true)}>
            Manual Attendance Entry
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

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Present Guards Today</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">360 Guards</div>
            <span className="text-[11px] text-txt-secondary">94.2% On-time Rate</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Late Arrivals</span>
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight mt-0.5 tabular-nums">62 Guards</div>
            <span className="text-[11px] text-txt-secondary">Grace Period Applied</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Absent Guards</span>
            <div className="text-2xl font-extrabold text-status-absent tracking-tight mt-0.5 tabular-nums">30 Guards</div>
            <span className="text-[11px] text-txt-secondary">Standbys Dispatched</span>
          </div>
          <div className="p-3 bg-status-absent/10 text-status-absent rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Pending Exception Queue</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">4 Exceptions</div>
            <span className="text-[11px] text-txt-secondary">Requires Audit</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Register Data Table */}
      <div className="wt-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
            <input
              type="text"
              placeholder="Search by guard name, code, or site..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
            >
              <option value="">All Corporate Clients</option>
              {INITIAL_CLIENTS.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
            >
              <option value="">All Site Campuses</option>
              {availableSites.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE_IN">Late Arrival</option>
              <option value="ABSENT">Absent</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="EXCEPTION_PENDING">Pending Exception</option>
            </select>
          </div>
        </div>

        {/* Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD CODE & NAME</th>
                <th>CLIENT / SITE CAMPUS</th>
                <th>DUTY POST STATION</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>CHECK IN</th>
                <th>CHECK OUT</th>
                <th>WORK HOURS</th>
                <th className="text-right font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.slice(0, 15).map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={r.photoUrl} alt={r.employeeName} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
                      <div>
                        <div className="font-bold text-xs text-txt-primary">{r.employeeName}</div>
                        <div className="text-[11px] text-txt-secondary font-mono">{r.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-xs text-txt-primary">{r.department}</div>
                    <div className="text-[11px] text-txt-secondary">{r.siteName}</div>
                  </td>
                  <td className="text-xs font-semibold text-brand-primary">{r.postName}</td>
                  <td className="text-xs text-txt-secondary font-mono tabular-nums">{r.date}</td>
                  <td><Badge status={r.status} /></td>
                  <td className="text-xs font-bold text-txt-primary font-mono tabular-nums">{r.checkIn}</td>
                  <td className="text-xs text-txt-secondary font-mono tabular-nums">{r.checkOut}</td>
                  <td className="text-xs font-bold text-brand-teal font-mono tabular-nums">{r.workHours}</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedRecord(r)}>
                      View Verification Log
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Verification Log Detail Drawer */}
      <Sheet isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Attendance Verification Log">
        {selectedRecord && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 bg-bg-surface-2 rounded-xl border border-border">
              <img src={selectedRecord.photoUrl} alt={selectedRecord.employeeName} className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-primary" />
              <div>
                <h4 className="font-bold text-txt-primary text-base">{selectedRecord.employeeName}</h4>
                <p className="text-xs text-txt-secondary font-mono">{selectedRecord.employeeCode} • {selectedRecord.role}</p>
                <Badge status={selectedRecord.status} className="mt-2" />
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-txt-primary text-sm border-b border-border pb-1">Check-in Location & Geofence Verification</h5>

              <div className="p-3 bg-bg-surface-2 rounded-xl border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Site Campus:</span>
                  <span className="font-bold text-txt-primary">{selectedRecord.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Duty Post Station:</span>
                  <span className="font-bold text-brand-primary">{selectedRecord.postName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">GPS Coordinates:</span>
                  <span className="font-mono text-txt-primary">18.5204, 73.8567 (12m inside radius)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">QR Code Scan Token:</span>
                  <span className="font-mono text-brand-teal font-bold">QR-HDF-001</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-txt-primary text-sm border-b border-border pb-1">Time & Shift Telemetry</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-surface-2 rounded-xl border border-border">
                  <span className="text-txt-tertiary block text-[11px]">Check-in Timestamp</span>
                  <span className="font-mono font-bold text-txt-primary text-sm">{selectedRecord.checkIn}</span>
                </div>
                <div className="p-3 bg-bg-surface-2 rounded-xl border border-border">
                  <span className="text-txt-tertiary block text-[11px]">Check-out Timestamp</span>
                  <span className="font-mono font-bold text-txt-primary text-sm">{selectedRecord.checkOut}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedRecord(null)}>Close Verification Log</Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Manual Entry Dialog */}
      <Dialog isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Create Manual Attendance Entry">
        <form onSubmit={handleCreateManualEntry} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Guard / Employee</label>
            <select
              value={manualEmp}
              onChange={e => setManualEmp(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {INITIAL_EMPLOYEES.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Site Campus</label>
            <select
              value={manualSite}
              onChange={e => setManualSite(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {INITIAL_SITES.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.clientName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Check-in Time</label>
              <input
                type="text"
                value={manualCheckIn}
                onChange={e => setManualCheckIn(e.target.value)}
                placeholder="08:00 AM"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Override Status</label>
              <select className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary">
                <option value="PRESENT">Present (Manual Override)</option>
                <option value="LATE_IN">Late Arrival</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Supervisor Override Reason</label>
            <textarea
              rows={3}
              value={manualNote}
              onChange={e => setManualNote(e.target.value)}
              placeholder="e.g. Guard phone battery died during check-in, verified physically by supervisor."
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsManualModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Manual Record</Button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  );
};
