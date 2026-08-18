import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Plus, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, Users, Calendar, ShieldCheck, UserCheck, Check, X, ArrowRightLeft, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_LEAVES, INITIAL_LEAVE_BALANCES, LeaveRequest, LeaveBalance } from '../../../mockData/leave';
import { INITIAL_EMPLOYEES } from '../../../mockData/employees';
import confetti from 'canvas-confetti';

export const LeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_LEAVE_BALANCES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [selectedEmp, setSelectedEmp] = useState(INITIAL_EMPLOYEES[0].id);
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('CASUAL');
  const [fromDate, setFromDate] = useState('2026-08-20');
  const [toDate, setToDate] = useState('2026-08-22');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDecision = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const targetReq = leaves.find(l => l.id === id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    if (newStatus === 'APPROVED' && targetReq) {
      confetti({ particleCount: 50, spread: 60 });
      triggerToast(`Approved leave request for ${targetReq.employeeName}. Roster updated.`);
    } else if (newStatus === 'REJECTED' && targetReq) {
      triggerToast(`Rejected leave request for ${targetReq.employeeName}.`);
    }
  };

  const handleFileLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = INITIAL_EMPLOYEES.find(e => e.id === selectedEmp) || INITIAL_EMPLOYEES[0];

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      photoUrl: emp.photoUrl,
      type: leaveType,
      fromDate,
      toDate,
      isHalfDay,
      reason: reason || 'Personal family work',
      status: 'PENDING',
      appliedOn: '2026-08-18'
    };

    setLeaves(prev => [newReq, ...prev]);
    setIsFileModalOpen(false);
    setReason('');
    triggerToast(`Filed leave request for ${emp.firstName} ${emp.lastName}`);
  };

  const filteredLeaves = leaves.filter(l => {
    const matchSearch =
      l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchType = !typeFilter || l.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;

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
              Absence & Replacement Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Leave Management & Approvals</h1>
          <p className="text-xs text-txt-secondary mt-1">Review guard leave applications, track annual leave balances, and auto-dispatch standby replacements</p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFileModalOpen(true)}>
          File Leave on Behalf
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Pending Approvals</span>
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight mt-0.5 tabular-nums">{pendingCount} Requests</div>
            <span className="text-[11px] text-txt-secondary">Requires Action</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Approved Leaves</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">{approvedCount} Approved</div>
            <span className="text-[11px] text-txt-secondary">Roster Updated</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">On Leave Today</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">2 Guards</div>
            <span className="text-[11px] text-txt-secondary">Standbys Deployed</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Annual Quota Status</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">12 CL / 15 EL</div>
            <span className="text-[11px] text-txt-secondary">Per Guard Quota</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Guard Leave Balances Summary */}
      <div className="wt-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <span>Guard Annual Leave Quota Balances</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD NAME & CODE</th>
                <th>CASUAL LEAVE (CL)</th>
                <th>EARNED LEAVE (EL)</th>
                <th>MEDICAL LEAVE (ML)</th>
                <th>TOTAL REMAINING</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(b => {
                const totalRem = b.casual + b.earned + b.medical;
                return (
                  <tr key={b.employeeId}>
                    <td className="font-bold text-xs text-txt-primary">{b.employeeName}</td>
                    <td className="font-semibold text-brand-primary text-xs tabular-nums">{b.casual} Days Remaining</td>
                    <td className="font-semibold text-brand-teal text-xs tabular-nums">{b.earned} Days Remaining</td>
                    <td className="font-semibold text-amber-600 text-xs tabular-nums">{b.medical} Days Remaining</td>
                    <td className="font-extrabold text-txt-primary text-xs tabular-nums">{totalRem} Days Total</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="wt-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search guard name, code, or reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Approvals ({pendingCount})</option>
            <option value="APPROVED">Approved Requests</option>
            <option value="REJECTED">Rejected Requests</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
          >
            <option value="">All Leave Types</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="EARNED">Earned Leave</option>
            <option value="MEDICAL">Medical Leave</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Queue Table */}
      <div className="wt-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-txt-primary">Leave Requests Queue ({filteredLeaves.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD CODE & NAME</th>
                <th>LEAVE TYPE</th>
                <th>DURATION & DATES</th>
                <th>REASON FOR ABSENCE</th>
                <th>STATUS</th>
                <th className="text-right">APPROVAL ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={l.photoUrl} alt={l.employeeName} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
                      <div>
                        <div className="font-bold text-xs text-txt-primary">{l.employeeName}</div>
                        <div className="text-[11px] text-txt-secondary font-mono">{l.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                      {l.type}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs font-bold text-txt-primary tabular-nums">{l.fromDate} to {l.toDate}</div>
                    <div className="text-[11px] text-txt-tertiary">Applied on {l.appliedOn}</div>
                  </td>
                  <td className="text-xs text-txt-primary max-w-xs">{l.reason}</td>
                  <td><Badge status={l.status} /></td>
                  <td className="text-right">
                    {l.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="teal" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleDecision(l.id, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleDecision(l.id, 'REJECTED')}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-txt-tertiary font-semibold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Leave Request Drawer */}
      <Sheet isOpen={isFileModalOpen} onClose={() => setIsFileModalOpen(false)} title="File Leave Request on Behalf">
        <form onSubmit={handleFileLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Select Guard / Employee</label>
            <select
              value={selectedEmp}
              onChange={e => setSelectedEmp(e.target.value)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              {INITIAL_EMPLOYEES.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Leave Type Category</label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as any)}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="EARNED">Earned Leave (EL)</option>
              <option value="MEDICAL">Medical Leave (ML)</option>
              <option value="COMP_OFF">Compensatory Off (Comp-Off)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-bg-surface-2 border border-border rounded-xl">
            <span className="font-bold text-txt-primary">Half-Day Leave Only</span>
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={e => setIsHalfDay(e.target.checked)}
              className="w-5 h-5 accent-brand-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Reason for Absence</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Medical emergency or family function"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsFileModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Leave Request</Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
