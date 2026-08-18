import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Building2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { reportsApi } from '../../../services/reportsApi';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await reportsApi.getAttendanceSummary();
        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-brand-primary" /> REPORTS & COMPLIANCE ANALYTICS
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Site Compliance & Attendance Reports
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Generating compliance reports from database...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Site Location</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Required Guards</th>
                  <th className="px-4 py-3">Assigned Guards</th>
                  <th className="px-4 py-3">Attendance Rate</th>
                  <th className="px-4 py-3 text-right">Geofence Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-txt-primary">{r.siteName}</td>
                    <td className="px-4 py-3 text-txt-secondary">{r.clientName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-txt-primary">{r.totalGuardsRequired}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{r.totalAssignedGuards}</td>
                    <td className="px-4 py-3 font-mono text-txt-primary">{r.attendanceRate}%</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                      {r.geofenceCompliance}%
                    </td>
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
