import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Download, Filter, Search, CheckCircle2, XCircle, Shield, User, Settings, LogIn } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { INITIAL_AUDIT_LOGS, AuditLog, AuditEventType } from '../../../mockData/audit';

const EVENT_ICON: Record<string, React.ReactNode> = {
  EXCEPTION_APPROVED: <CheckCircle2 className="w-4 h-4 text-status-present" />,
  EXCEPTION_REJECTED: <XCircle className="w-4 h-4 text-status-absent" />,
  ATTENDANCE_OVERRIDE: <ClipboardList className="w-4 h-4 text-status-late" />,
  LEAVE_APPROVED: <CheckCircle2 className="w-4 h-4 text-brand-teal" />,
  LEAVE_REJECTED: <XCircle className="w-4 h-4 text-status-absent" />,
  EMPLOYEE_CREATED: <User className="w-4 h-4 text-brand-primary" />,
  EMPLOYEE_DEACTIVATED: <User className="w-4 h-4 text-status-absent" />,
  ROSTER_PUBLISHED: <CheckCircle2 className="w-4 h-4 text-brand-primary" />,
  ROLE_CREATED: <Shield className="w-4 h-4 text-status-leave" />,
  ROLE_UPDATED: <Shield className="w-4 h-4 text-status-late" />,
  SETTINGS_CHANGED: <Settings className="w-4 h-4 text-txt-secondary" />,
  LOGIN: <LogIn className="w-4 h-4 text-brand-teal" />,
  LOGOUT: <LogIn className="w-4 h-4 text-txt-tertiary" />,
  SITE_GEOFENCE_UPDATED: <Settings className="w-4 h-4 text-brand-primary" />,
};

const EVENT_BADGE: Record<string, string> = {
  EXCEPTION_APPROVED:  'bg-status-present/10 text-status-present border-status-present/20',
  EXCEPTION_REJECTED:  'bg-status-absent/10 text-status-absent border-status-absent/20',
  ATTENDANCE_OVERRIDE: 'bg-status-late/10 text-status-late border-status-late/20',
  LEAVE_APPROVED:      'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
  LEAVE_REJECTED:      'bg-status-absent/10 text-status-absent border-status-absent/20',
  EMPLOYEE_CREATED:    'bg-brand-primary-050 text-brand-primary border-brand-primary/20',
  EMPLOYEE_DEACTIVATED:'bg-status-absent/10 text-status-absent border-status-absent/20',
  ROSTER_PUBLISHED:    'bg-brand-primary-050 text-brand-primary border-brand-primary/20',
  ROLE_CREATED:        'bg-status-leave/10 text-status-leave border-status-leave/20',
  ROLE_UPDATED:        'bg-status-late/10 text-status-late border-status-late/20',
  SETTINGS_CHANGED:    'bg-bg-surface-2 text-txt-secondary border-border',
  LOGIN:               'bg-brand-teal-050 text-brand-teal border-brand-teal/20',
  LOGOUT:              'bg-bg-surface-2 text-txt-tertiary border-border',
  SITE_GEOFENCE_UPDATED:'bg-brand-primary-050 text-brand-primary border-brand-primary/20',
};

const MODULES = ['All Modules', 'Attendance', 'Exceptions', 'Employees', 'Sites & Posts', 'Roster', 'Leave', 'Roles & Access', 'Settings', 'Auth'];

export const AuditPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');

  const filtered = logs.filter(l => {
    const matchSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.eventType.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === 'All Modules' || l.module === moduleFilter;
    return matchSearch && matchModule;
  });

  const handleExport = () => {
    let csv = 'Timestamp,Actor,Role,Event Type,Module,Description,Status,IP Address\n';
    filtered.forEach(l => {
      csv += `"${l.timestamp}","${l.actor}","${l.actorRole}","${l.eventType}","${l.module}","${l.description}","${l.status}","${l.ipAddress}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watchtower_audit_log.csv';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-status-leave/10 text-status-leave border border-status-leave/20">
              Compliance & Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Audit Trail & Activity Log</h1>
          <p className="text-xs text-txt-secondary mt-1">Complete chronological record of all admin actions — immutable for compliance</p>
        </div>

        <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
          Export Audit CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: logs.length, color: 'text-txt-primary' },
          { label: 'Today', value: logs.filter(l => l.timestamp.startsWith('2026-08-18')).length, color: 'text-brand-primary' },
          { label: 'Approvals', value: logs.filter(l => l.eventType.includes('APPROVED')).length, color: 'text-status-present' },
          { label: 'Rejections', value: logs.filter(l => l.eventType.includes('REJECTED')).length, color: 'text-status-absent' },
        ].map(stat => (
          <div key={stat.label} className="wt-card p-4 text-center">
            <div className={`text-2xl font-extrabold tabular-nums ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-txt-secondary mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="wt-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search by actor, event type, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="py-2 px-3 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none"
        >
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="wt-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-txt-primary">Activity Timeline</h3>
          <span className="text-xs text-txt-tertiary">{filtered.length} events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTOR</th>
                <th>EVENT TYPE</th>
                <th>MODULE</th>
                <th>DESCRIPTION</th>
                <th>IP ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div className="font-mono text-[11px] text-txt-secondary tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      <br />
                      <span className="text-txt-tertiary">{new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <img src={log.actorAvatar} alt={log.actor} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-txt-primary">{log.actor}</div>
                        <div className="text-[11px] text-txt-tertiary">{log.actorRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge text-[11px] font-semibold border whitespace-nowrap ${EVENT_BADGE[log.eventType] || 'bg-bg-surface-2 text-txt-secondary border-border'}`}>
                      {EVENT_ICON[log.eventType]}
                      {log.eventType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-xs font-medium text-txt-secondary whitespace-nowrap">{log.module}</td>
                  <td className="text-xs text-txt-primary max-w-sm">{log.description}</td>
                  <td className="font-mono text-[11px] text-txt-tertiary whitespace-nowrap">{log.ipAddress}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-txt-tertiary text-sm">
              No audit events match your current filter.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
