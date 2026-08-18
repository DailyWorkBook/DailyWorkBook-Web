import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, Users, Building2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { rosterApi } from '../../../services/rosterApi';
import { employeesApi } from '../../../services/employeesApi';
import { sitesApi } from '../../../services/sitesApi';

export const RosterPage: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Assignment Form
  const [empId, setEmpId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [shiftId, setShiftId] = useState('');

  useEffect(() => {
    async function loadRosterData() {
      try {
        setLoading(true);
        const [shiftData, assignData, empData, siteData] = await Promise.all([
          rosterApi.getShifts(),
          rosterApi.getAssignments(),
          employeesApi.getEmployees(),
          sitesApi.getSites()
        ]);
        setShifts(shiftData || []);
        setAssignments(assignData || []);
        setEmployees(empData || []);
        setSites(siteData || []);

        if (empData?.length > 0) setEmpId(empData[0].id);
        if (siteData?.length > 0) setSiteId(siteData[0].id);
        if (shiftData?.length > 0) setShiftId(shiftData[0].id);
      } catch (err) {
        console.error('Error loading roster data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRosterData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedSite = sites.find((s) => s.id === siteId);
      const post = selectedSite?.posts?.[0]?.id || 'post-demo';

      const newAssign = await rosterApi.createAssignment({
        employeeId: empId,
        siteId,
        postId: post,
        shiftId,
        startDate: new Date().toISOString().split('T')[0]
      });

      setAssignments((prev) => [newAssign, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating assignment:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <CalendarDays className="w-4 h-4 text-brand-primary" /> GUARD SHIFTS & ROSTER ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Roster & Shift Schedules
          </h1>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Shift Assignment
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading roster schedules from database...
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Defined Shifts */}
          <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-txt-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" /> Active Shift Definitions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shifts.map((s) => (
                <div key={s.id} className="p-3.5 bg-bg-surface-2 rounded-xl border border-border/60 space-y-1">
                  <div className="font-extrabold text-xs text-txt-primary">{s.name}</div>
                  <div className="text-[11px] font-mono text-emerald-600 font-bold">
                    {s.startTime} - {s.endTime} ({s.type})
                  </div>
                  <div className="text-[10px] text-txt-secondary">Grace Period: {s.graceMinutes} mins</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Roster Assignments */}
          <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/80 font-bold text-xs text-txt-primary">
              Guard Shift Assignments ({assignments.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Guard Name</th>
                    <th className="px-4 py-3">Assigned Site & Post</th>
                    <th className="px-4 py-3">Shift Timing</th>
                    <th className="px-4 py-3 text-right">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-bg-surface-2/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-txt-primary">{a.employeeName || 'Guard Officer'}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-txt-primary">{a.siteName || 'Site'}</div>
                        <div className="text-[10px] text-txt-secondary">{a.postName || 'Post Gate'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                        {a.shiftName || 'Day Shift'} ({a.startTime || '08:00'} - {a.endTime || '16:00'})
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-txt-secondary">{a.startDate || '2026-08-01'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Assign Guard to Shift</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-txt-secondary">Select Employee</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
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
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
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
                <label className="text-xs font-bold text-txt-secondary">Select Shift</label>
                <select
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white">
                  Assign Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
