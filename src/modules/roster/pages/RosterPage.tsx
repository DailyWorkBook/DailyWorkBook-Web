import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, AlertOctagon, CheckCircle2, ShieldCheck, Clock, Users, Filter, ChevronLeft, ChevronRight, Wand2, RefreshCw, AlertTriangle, Building2, Sun, Moon, ArrowRightLeft, Sparkles, Check, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Sheet } from '../../../components/ui/Sheet';
import { Dialog } from '../../../components/ui/Dialog';
import { INITIAL_SHIFTS, ShiftTemplate, INITIAL_ROSTER, RosterAssignment, INITIAL_CONFLICTS, RosterConflict, WEEK_DAYS } from '../../../mockData/roster';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import { INITIAL_SITES } from '../../../mockData/sites';
import { INITIAL_EMPLOYEES, Employee } from '../../../mockData/employees';
import confetti from 'canvas-confetti';

export const RosterPage: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftTemplate[]>(INITIAL_SHIFTS);
  const [roster, setRoster] = useState<RosterAssignment[]>(INITIAL_ROSTER);
  const [conflicts, setConflicts] = useState<RosterConflict[]>(INITIAL_CONFLICTS);

  // View & Filter state
  const [activeView, setActiveView] = useState<'weekly' | 'daily_posts' | 'templates'>('weekly');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Publishing & Auto-Fill state
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Drawer / Modals
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ empId: string; date: string; shiftId?: string } | null>(null);

  // Create Shift Form
  const [shiftName, setShiftName] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [isNight, setIsNight] = useState(false);

  // Assign Shift Form
  const [assignEmpId, setAssignEmpId] = useState(INITIAL_EMPLOYEES[0].id);
  const [assignPostId, setAssignPostId] = useState(INITIAL_SITES[0].posts[0].id);
  const [assignShiftId, setAssignShiftId] = useState(INITIAL_SHIFTS[0].id);
  const [assignDate, setAssignDate] = useState('2026-08-18');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      confetti({ particleCount: 65, spread: 70 });
      triggerToast('Roster published & broadcasted to guard mobile apps!');
      setTimeout(() => setPublishSuccess(false), 4000);
    }, 600);
  };

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      setIsAutoFilling(false);
      // Auto assign 3 missing slots
      const newAssignments: RosterAssignment[] = [
        {
          id: `ros-auto-1`,
          employeeId: 'emp-6',
          employeeName: 'Anil Deshmukh',
          employeeCode: 'GRD-0006',
          photoUrl: 'https://i.pravatar.cc/150?u=GRD-0006',
          clientId: 'cli-hdfc',
          clientName: 'HDFC Bank Corporate HQ',
          siteId: 'site-1',
          siteName: 'HDFC Bank HQ Campus',
          postId: 'post-2',
          postName: 'Cash Vault Entrance',
          shiftId: 'shift-night',
          shiftName: 'Night Shift',
          shiftCode: 'NIGHT',
          date: '2026-08-18'
        }
      ];
      setRoster(prev => [...prev, ...newAssignments]);
      setConflicts([]);
      confetti({ particleCount: 50, spread: 60 });
      triggerToast('Auto-fill completed! Roster 100% staffed with zero conflicts.');
    }, 800);
  };

  const handleAddShiftTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName) return;

    const newShift: ShiftTemplate = {
      id: `shift-${Date.now()}`,
      name: shiftName,
      code: shiftCode || shiftName.slice(0, 4).toUpperCase(),
      type: isNight ? 'NIGHT' : 'FIXED',
      startTime,
      endTime,
      graceMinutes: Number(graceMinutes),
      lateHalfDayAfterMin: 60,
      isNightShift: isNight,
      colorClass: isNight ? 'text-indigo-600 border-indigo-300' : 'text-brand-primary border-brand-primary/30',
      bgColorClass: isNight ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400' : 'bg-brand-primary-050 dark:bg-brand-primary/10 text-brand-primary'
    };

    setShifts(prev => [...prev, newShift]);
    setIsShiftModalOpen(false);
    triggerToast(`Created shift template "${shiftName}"`);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = INITIAL_EMPLOYEES.find(e => e.id === assignEmpId) || INITIAL_EMPLOYEES[0];
    const site = INITIAL_SITES.find(s => s.posts.some(p => p.id === assignPostId)) || INITIAL_SITES[0];
    const post = site.posts.find(p => p.id === assignPostId) || site.posts[0];
    const shift = shifts.find(s => s.id === assignShiftId) || shifts[0];

    const newAssign: RosterAssignment = {
      id: `ros-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      photoUrl: emp.photoUrl,
      clientId: site.clientId,
      clientName: site.clientName,
      siteId: site.id,
      siteName: site.name,
      postId: post.id,
      postName: post.name,
      shiftId: shift.id,
      shiftName: shift.name,
      shiftCode: shift.code,
      date: assignDate
    };

    setRoster(prev => [newAssign, ...prev.filter(r => !(r.employeeId === emp.id && r.date === assignDate))]);
    setIsAssignModalOpen(false);
    triggerToast(`Assigned ${emp.firstName} to ${shift.name} at ${post.name}`);
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
              Shift Scheduling & Roster Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Shifts & Roster Planner</h1>
          <p className="text-xs text-txt-secondary mt-1">Schedule guard shift assignments across Client → Site → Posts with live conflict detection</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Wand2 className="w-4 h-4 text-brand-teal" />} isLoading={isAutoFilling} onClick={handleAutoFill}>
            Auto-Fill Roster
          </Button>

          <Button
            variant="primary"
            isLoading={isPublishing}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            onClick={handlePublish}
          >
            {publishSuccess ? 'Roster Published!' : 'Publish Roster'}
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

      {/* Key Coverage & Roster KPI Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Shift Coverage Rate</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">94.2%</div>
            <span className="text-[11px] text-txt-secondary">32 of 34 Slots Filled</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Active Shift Templates</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{shifts.length} Shifts</div>
            <span className="text-[11px] text-txt-secondary">Morning, Evening, Night</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Understaffed Post Alerts</span>
            <div className="text-2xl font-extrabold text-status-late tracking-tight mt-0.5 tabular-nums">{conflicts.length} Warning</div>
            <span className="text-[11px] text-txt-secondary">Action required</span>
          </div>
          <div className="p-3 bg-status-late/10 text-status-late rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Scheduled Guards</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">{INITIAL_EMPLOYEES.length} Guards</div>
            <span className="text-[11px] text-txt-secondary">100% Deployed</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Conflict Alerts Banner */}
      {conflicts.length > 0 && (
        <div className="wt-card p-4 border-l-4 border-l-status-late space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-status-late uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <span>Roster Conflicts & Coverage Alerts ({conflicts.length})</span>
            </h4>
            <Button size="sm" variant="ghost" onClick={handleAutoFill}>Resolve All Automatically</Button>
          </div>

          <div className="space-y-2">
            {conflicts.map(c => (
              <div key={c.id} className="p-3 bg-status-late/10 border border-status-late/20 text-xs rounded-xl flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-txt-primary">{c.message}</div>
                  <div className="text-[11px] text-txt-secondary mt-0.5">Recommended Action: <strong>{c.recommendedAction}</strong></div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setIsAssignModalOpen(true)}>Fix Assignment</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode & Hierarchy Filter Bar */}
      <div className="wt-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-bg-surface-2 p-1 rounded-xl border border-border text-xs font-bold">
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'weekly' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            📅 Weekly Matrix View
          </button>
          <button
            onClick={() => setActiveView('daily_posts')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'daily_posts' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            🏢 Daily Post Station Duty
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'templates' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            ⚙️ Shift Templates
          </button>
        </div>

        {/* Client & Site Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
          >
            <option value="">All Corporate Clients</option>
            {INITIAL_CLIENTS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAssignModalOpen(true)}>
            Assign Guard Shift
          </Button>
        </div>
      </div>

      {/* VIEW 1: WEEKLY SHIFT MATRIX VIEW */}
      {activeView === 'weekly' && (
        <div className="wt-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-txt-primary">7-Day Weekly Roster Schedule (Aug 17 - Aug 23, 2026)</h3>
              <p className="text-xs text-txt-secondary mt-0.5">Click on any guard shift slot to assign, swap, or modify shift template</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Morning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-primary" /> Evening</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Night</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse wt-table">
              <thead>
                <tr>
                  <th className="min-w-[200px]">GUARD / EMPLOYEE</th>
                  {WEEK_DAYS.map(w => (
                    <th key={w.date} className={`text-center min-w-[120px] ${w.isToday ? 'bg-brand-primary-050/60 text-brand-primary font-bold' : ''}`}>
                      <div>{w.dayName}</div>
                      <div className="text-[10px] opacity-80">{w.date.slice(5)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INITIAL_EMPLOYEES.slice(0, 8).map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={emp.photoUrl} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                        <div>
                          <div className="font-bold text-xs text-txt-primary">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-txt-secondary font-mono">{emp.employeeCode}</div>
                        </div>
                      </div>
                    </td>

                    {WEEK_DAYS.map((w, idx) => {
                      const assignment = roster.find(r => r.employeeId === emp.id && r.date === w.date);
                      const isOff = idx === 6; // Sunday off for demonstration

                      return (
                        <td key={w.date} className="text-center p-2">
                          {assignment ? (
                            <button
                              onClick={() => {
                                setAssignEmpId(emp.id);
                                setAssignDate(w.date);
                                setIsAssignModalOpen(true);
                              }}
                              className={`w-full py-1.5 px-2 rounded-xl text-center border font-bold text-[11px] transition-all hover:scale-105 shadow-xs ${
                                assignment.shiftCode === 'MORN' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400' :
                                assignment.shiftCode === 'EVE' ? 'bg-brand-primary-050 text-brand-primary border-brand-primary/30 dark:bg-brand-primary/20' :
                                'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400'
                              }`}
                            >
                              <div className="font-bold">{assignment.shiftCode}</div>
                              <div className="text-[9px] opacity-80 truncate">{assignment.postName}</div>
                            </button>
                          ) : isOff ? (
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-bg-surface-2 text-txt-tertiary font-bold text-[11px] border border-border">
                              WEEK OFF
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setAssignEmpId(emp.id);
                                setAssignDate(w.date);
                                setIsAssignModalOpen(true);
                              }}
                              className="w-full py-1.5 rounded-xl border border-dashed border-border text-txt-tertiary hover:border-brand-primary hover:text-brand-primary text-[11px] font-semibold transition-all"
                            >
                              + Assign
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY POST STATION DUTY ROSTER */}
      {activeView === 'daily_posts' && (
        <div className="space-y-6">
          {INITIAL_SITES.map(site => (
            <div key={site.id} className="wt-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                    {site.clientName}
                  </span>
                  <h3 className="text-base font-bold text-txt-primary mt-1">{site.name}</h3>
                </div>
                <span className="text-xs font-bold text-brand-teal px-3 py-1 bg-brand-teal/10 rounded-full border border-brand-teal/20">
                  {site.postsCount} Posts Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.posts.map(post => {
                  const postAssignments = roster.filter(r => r.postId === post.id);
                  const isStaffed = postAssignments.length >= post.guardCountRequired;

                  return (
                    <div key={post.id} className="p-4 bg-bg-surface-2 border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-txt-primary">{post.name}</div>
                          <div className="text-[11px] text-txt-secondary">{post.shiftType}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isStaffed ? 'bg-brand-teal/10 text-brand-teal' : 'bg-status-late/10 text-status-late'
                        }`}>
                          {postAssignments.length} / {post.guardCountRequired} Guards
                        </span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border">
                        {postAssignments.map(asg => (
                          <div key={asg.id} className="p-2.5 bg-bg-surface border border-border rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img src={asg.photoUrl} alt={asg.employeeName} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <div className="font-bold text-txt-primary">{asg.employeeName}</div>
                                <div className="text-[10px] text-brand-primary font-semibold">{asg.shiftName}</div>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-txt-tertiary">{asg.employeeCode}</span>
                          </div>
                        ))}

                        {!isStaffed && (
                          <button
                            onClick={() => {
                              setAssignPostId(post.id);
                              setIsAssignModalOpen(true);
                            }}
                            className="w-full py-2 bg-status-late/10 border border-status-late/30 text-status-late font-bold rounded-lg text-xs hover:bg-status-late/20 transition-all text-center"
                          >
                            + Assign Guard to Unstaffed Slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: SHIFT TEMPLATES MASTER */}
      {activeView === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-txt-primary">Configured Shift Templates</h3>
              <p className="text-xs text-txt-secondary mt-0.5">Manage standard working shifts, start/end hours, and grace margins</p>
            </div>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsShiftModalOpen(true)}>
              Add Shift Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shifts.map(s => (
              <div key={s.id} className="wt-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${s.colorClass}`}>
                      {s.code}
                    </span>
                    {s.isNightShift && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500">
                        Night Shift
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-txt-primary mt-2">{s.name}</h4>
                  <div className="text-xs text-txt-secondary flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <Clock className="w-4 h-4 text-brand-primary" />
                    <span>{s.startTime} - {s.endTime}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between text-xs">
                  <span className="text-txt-tertiary">Grace Period:</span>
                  <span className="font-bold text-brand-teal">{s.graceMinutes} Minutes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer: Assign Guard Shift */}
      <Sheet isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Guard Shift Roster">
        <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Guard / Employee</label>
            <select
              value={assignEmpId}
              onChange={e => setAssignEmpId(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {INITIAL_EMPLOYEES.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Assignment Date</label>
            <input
              type="date"
              value={assignDate}
              onChange={e => setAssignDate(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Client Duty Post Station</label>
            <select
              value={assignPostId}
              onChange={e => setAssignPostId(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {INITIAL_SITES.flatMap(s => s.posts).map(p => (
                <option key={p.id} value={p.id}>{p.siteName} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Shift Template</label>
            <select
              value={assignShiftId}
              onChange={e => setAssignShiftId(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Shift Assignment</Button>
          </div>
        </form>
      </Sheet>

      {/* Modal: Add Shift Template */}
      <Dialog isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Create Shift Template">
        <form onSubmit={handleAddShiftTemplate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-txt-primary mb-1">Shift Name</label>
            <input
              type="text"
              required
              value={shiftName}
              onChange={e => setShiftName(e.target.value)}
              placeholder="e.g. Afternoon Relief Shift"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-txt-primary mb-1">Short Shift Code</label>
            <input
              type="text"
              value={shiftCode}
              onChange={e => setShiftCode(e.target.value.toUpperCase())}
              placeholder="RLF"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono uppercase text-txt-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-txt-primary mb-1">Start Time (HH:mm)</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-txt-primary mb-1">End Time (HH:mm)</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-txt-primary mb-1">Check-in Grace Margin (Minutes)</label>
            <input
              type="number"
              value={graceMinutes}
              onChange={e => setGraceMinutes(Number(e.target.value))}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-bg-surface-2 border border-border rounded-xl">
            <span className="font-bold text-txt-primary">Night Shift Allowance Eligible</span>
            <input
              type="checkbox"
              checked={isNight}
              onChange={e => setIsNight(e.target.checked)}
              className="w-5 h-5 accent-brand-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsShiftModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Shift Template</Button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  );
};
