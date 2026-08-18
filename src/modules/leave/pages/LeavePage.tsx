import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { leaveApi } from '../../../services/leaveApi';
import { employeesApi } from '../../../services/employeesApi';

export const LeavePage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Leave Form
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('CASUAL');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function loadLeaveData() {
      try {
        setLoading(true);
        const [reqData, empData] = await Promise.all([
          leaveApi.getRequests(),
          employeesApi.getEmployees()
        ]);
        setRequests(reqData || []);
        setEmployees(empData || []);
        if (empData?.length > 0) setEmployeeId(empData[0].id);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaveData();
  }, []);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLeave = await leaveApi.createRequest({
        employeeId,
        type,
        fromDate,
        toDate,
        reason
      });
      setRequests((prev) => [newLeave, ...prev]);
      setIsModalOpen(false);
      setReason('');
    } catch (err) {
      console.error('Error submitting leave:', err);
    }
  };

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await leaveApi.updateStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Error updating leave status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-brand-primary" /> LEAVE MANAGEMENT ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Leave Requests & Balances ({requests.length})
          </h1>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Apply Leave Request
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading leave applications from database...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Guard Name</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Duration Window</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.photoUrl || `https://i.pravatar.cc/150?u=${r.employeeId}`}
                          alt={r.employeeName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                        />
                        <div>
                          <div className="font-bold text-txt-primary">{r.employeeName}</div>
                          <div className="text-[10px] text-txt-secondary font-mono">{r.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-txt-primary">{r.type}</td>
                    <td className="px-4 py-3 font-mono text-txt-secondary">
                      {r.fromDate} to {r.toDate}
                    </td>
                    <td className="px-4 py-3 text-txt-primary font-medium">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusChange(r.id, 'APPROVED')}
                            className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.id, 'REJECTED')}
                            className="p-1 text-rose-600 hover:bg-rose-500/10 rounded-lg"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Submit Leave Application</h3>
            <form onSubmit={handleCreateLeave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-txt-secondary">Select Guard</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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
                <label className="text-xs font-bold text-txt-secondary">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="EARNED">Earned Leave (EL)</option>
                  <option value="MEDICAL">Medical Leave (ML)</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-txt-secondary">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-txt-secondary">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-txt-secondary">Reason</label>
                <input
                  type="text"
                  placeholder="Medical check-up or personal reasons"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white">
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
