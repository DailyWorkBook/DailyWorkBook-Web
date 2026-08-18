import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { exceptionsApi } from '../../../services/exceptionsApi';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExceptions() {
      try {
        setLoading(true);
        const data = await exceptionsApi.getQueue();
        setExceptions(data || []);
      } catch (err) {
        console.error('Error fetching exceptions queue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExceptions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await exceptionsApi.approve(id);
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error approving exception:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await exceptionsApi.reject(id);
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error rejecting exception:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 font-mono text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> DUAL-CONTROL APPROVAL QUEUE
            </span>
            <span className="text-xs text-txt-secondary">&bull; Out-of-Geofence & Exception Punch Approvals</span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Exceptions Queue ({exceptions.length})
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Syncing exception queue from database...
        </div>
      )}

      {!loading && exceptions.length === 0 && (
        <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-txt-primary">Queue Completely Clean!</h3>
          <p className="text-xs text-txt-secondary max-w-sm mx-auto">
            All attendance punches conform to geofence radiuses and shift timings.
          </p>
        </div>
      )}

      {!loading && exceptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exceptions.map((exc) => (
            <div key={exc.id} className="bg-bg-surface border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={exc.photoUrl}
                    alt={exc.employeeName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-txt-primary">{exc.employeeName}</h4>
                    <span className="text-[11px] text-txt-secondary font-mono">{exc.employeeCode}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {exc.exceptionType}
                </span>
              </div>

              <div className="bg-bg-surface-2 p-3 rounded-xl space-y-1 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Site & Post:</span>
                  <span className="font-bold text-txt-primary">{exc.siteName} &bull; {exc.postName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Punch Time:</span>
                  <span className="font-mono text-txt-primary">{exc.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-secondary">Distance Violation:</span>
                  <span className="font-bold text-rose-500">{exc.distanceMeters}m outside geofence</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  onClick={() => handleReject(exc.id)}
                  variant="outline"
                  className="text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject Punch
                </Button>
                <Button
                  onClick={() => handleApprove(exc.id)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve Punch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
