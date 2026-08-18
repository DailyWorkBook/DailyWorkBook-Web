import React, { useState, useEffect } from 'react';
import { ClipboardList, ShieldCheck, Loader2 } from 'lucide-react';
import { auditApi } from '../../../services/auditApi';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        setLoading(true);
        const data = await auditApi.getLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <ClipboardList className="w-4 h-4 text-brand-primary" /> IMMUTABLE SYSTEM AUDIT LOG
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            System Audit Trail ({logs.length})
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading audit logs from MySQL...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User / Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-txt-secondary">{log.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-txt-primary">{log.actorName}</td>
                    <td className="px-4 py-3 font-semibold text-brand-primary">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-txt-secondary">{log.entityType}</td>
                    <td className="px-4 py-3 text-right font-mono text-txt-secondary">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
