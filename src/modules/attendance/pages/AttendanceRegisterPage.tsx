import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Filter, Building2, CheckCircle2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { attendanceApi } from '../../../services/attendanceApi';
import { sitesApi } from '../../../services/sitesApi';
import { employeesApi } from '../../../services/employeesApi';

export const AttendanceRegisterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Manual entry form
  const [manualEmp, setManualEmp] = useState('');
  const [manualSite, setManualSite] = useState('');
  const [manualPost, setManualPost] = useState('');
  const [manualNote, setManualNote] = useState('');

  useEffect(() => {
    async function loadRegister() {
      try {
        setLoading(true);
        const [regData, sitesData, empData] = await Promise.all([
          attendanceApi.getRegister({ siteId: selectedSiteId }),
          sitesApi.getSites(),
          employeesApi.getEmployees()
        ]);
        setRecords(regData || []);
        setSites(sitesData || []);
        setEmployees(empData || []);
        if (empData?.length > 0) setManualEmp(empData[0].id);
        if (sitesData?.length > 0) {
          setManualSite(sitesData[0].id);
          if (sitesData[0].posts?.length > 0) setManualPost(sitesData[0].posts[0].id);
        }
      } catch (err) {
        console.error('Error fetching attendance register:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRegister();
  }, [selectedSiteId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceApi.manualPunch({
        employeeId: manualEmp,
        siteId: manualSite,
        postId: manualPost,
        note: manualNote || 'Manual Admin Punch'
      });
      triggerToast('Manual check-in recorded successfully!');
      setIsManualModalOpen(false);
      const regData = await attendanceApi.getRegister({ siteId: selectedSiteId });
      setRecords(regData || []);
    } catch (err) {
      console.error('Manual punch error:', err);
    }
  };

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-brand-primary" /> DAILY ATTENDANCE REGISTER
            </span>
            <span className="text-xs text-txt-secondary">&bull; Real-time Guard Punches</span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Attendance Register Log
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsManualModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Manual Check-in
          </Button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-xs font-bold">
          {toastMsg}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-surface p-3 border border-border rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary" />
          <input
            type="text"
            placeholder="Search guard name, code, or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-txt-secondary" />
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-bg-surface-2 border border-border text-xs rounded-xl px-3 py-2 text-txt-primary font-medium focus:outline-none"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading attendance records from database...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Guard Name</th>
                  <th className="px-4 py-3">Site / Post</th>
                  <th className="px-4 py-3">Shift Window</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.employeePhoto}
                          alt={r.employeeName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                        />
                        <div>
                          <div className="font-bold text-txt-primary">{r.employeeName}</div>
                          <div className="text-[10px] text-txt-secondary font-mono">{r.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-txt-primary">{r.siteName}</div>
                      <div className="text-[11px] text-txt-secondary">{r.postName}</div>
                    </td>
                    <td className="px-4 py-3 text-txt-secondary font-medium">{r.shiftName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600">{r.firstCheckInAt}</td>
                    <td className="px-4 py-3 font-mono text-txt-secondary">{r.lastCheckOutAt}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        {r.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[10px] text-txt-secondary">
                      {r.method} &bull; GPS Valid
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Check-in Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Manual Guard Check-in</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-txt-secondary">Select Guard</label>
                <select
                  value={manualEmp}
                  onChange={(e) => setManualEmp(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Select Site</label>
                <select
                  value={manualSite}
                  onChange={(e) => setManualSite(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Note / Reason</label>
                <input
                  type="text"
                  placeholder="Supervisor Manual Check-in"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white">
                  Confirm Manual Check-in
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
