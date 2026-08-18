import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, CheckSquare, Square, MapPin, Search, Filter, Camera, Radio, Eye, Check, X, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_EXCEPTIONS, ExceptionItem } from '../../../mockData/exceptions';
import confetti from 'canvas-confetti';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExceptionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDecision = (id: string, action: 'approve' | 'reject') => {
    const item = exceptions.find(e => e.id === id);
    setExceptions(prev => prev.filter(e => e.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (selectedItem?.id === id) setSelectedItem(null);

    const msg = action === 'approve' ? `Approved exception for ${item?.employeeName}` : `Rejected exception for ${item?.employeeName}`;
    setToastMessage(msg);
    if (action === 'approve') confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkDecision = (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    setExceptions(prev => prev.filter(e => !selectedIds.includes(e.id)));
    setToastMessage(`Bulk ${action === 'approve' ? 'Approved' : 'Rejected'} ${selectedIds.length} items`);
    setSelectedIds([]);
    if (action === 'approve') confetti({ particleCount: 75, spread: 80 });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredExceptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExceptions.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredExceptions = exceptions.filter(e => {
    const matchSearch =
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMethod = !methodFilter || e.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const geofenceBreachCount = exceptions.filter(e => !e.withinGeofence).length;
  const manualOverrideCount = exceptions.filter(e => e.method === 'MANUAL').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-brand-teal text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-bold"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Audit & Exception Review Queue
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Exceptions Approval Queue</h1>
          <p className="text-xs text-txt-secondary mt-1">Review out-of-geofence check-ins, missing face scans, and manual supervisor overrides</p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-brand-primary-050 p-2.5 px-4 rounded-xl border border-brand-primary/20">
            <span className="text-xs font-extrabold text-brand-primary">{selectedIds.length} Selected</span>
            <Button size="sm" variant="teal" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleBulkDecision('approve')}>
              Approve Selected
            </Button>
            <Button size="sm" variant="destructive" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleBulkDecision('reject')}>
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Pending Exceptions</span>
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight mt-0.5 tabular-nums">{exceptions.length} Items</div>
            <span className="text-[11px] text-txt-secondary">Requires Admin Action</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Geofence Breaches</span>
            <div className="text-2xl font-extrabold text-status-late tracking-tight mt-0.5 tabular-nums">{geofenceBreachCount} Breaches</div>
            <span className="text-[11px] text-txt-secondary">&gt; 50m Radius Outside</span>
          </div>
          <div className="p-3 bg-status-late/10 text-status-late rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Manual Overrides</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{manualOverrideCount} Overrides</div>
            <span className="text-[11px] text-txt-secondary">Supervisor Mobile Submissions</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Resolution Compliance</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">98.5%</div>
            <span className="text-[11px] text-txt-secondary">Audit Verified Rate</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Queue Data Table */}
      <div className="wt-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-3 text-xs">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
            >
              <option value="">All Check-in Methods</option>
              <option value="GPS">GPS Geofence Scan</option>
              <option value="MANUAL">Manual Supervisor Override</option>
              <option value="QR">QR Code Scan</option>
            </select>
          </div>
        </div>

        {filteredExceptions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-teal-050 text-brand-teal mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-txt-primary">All Exception Audits Resolved!</h3>
            <p className="text-xs text-txt-secondary max-w-sm mx-auto">There are no pending attendance exceptions requiring administrator decision.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <button onClick={toggleSelectAll} className="text-txt-secondary hover:text-txt-primary">
                      {selectedIds.length === filteredExceptions.length ? <CheckSquare className="w-4 h-4 text-brand-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th>GUARD CODE & NAME</th>
                  <th>SITE CAMPUS & POST</th>
                  <th>FLAG REASON</th>
                  <th>CHECK-IN DISTANCE</th>
                  <th>TIMESTAMP</th>
                  <th className="text-right font-bold">DECISION ACTION</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredExceptions.map(item => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, x: 100 }}
                      transition={{ duration: 0.25 }}
                    >
                      <td>
                        <button onClick={() => toggleSelect(item.id)}>
                          {selectedIds.includes(item.id) ? <CheckSquare className="w-4 h-4 text-brand-primary" /> : <Square className="w-4 h-4 text-txt-tertiary" />}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={item.photoUrl} alt={item.employeeName} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
                          <div>
                            <div className="font-bold text-xs text-txt-primary">{item.employeeName}</div>
                            <div className="text-[11px] text-txt-secondary font-mono">{item.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-xs text-txt-primary">{item.siteName}</div>
                        <div className="text-[11px] text-txt-secondary">{item.postName}</div>
                      </td>
                      <td className="max-w-xs">
                        <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{item.reason}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 font-mono font-bold text-xs text-txt-primary">
                          <MapPin className="w-3.5 h-3.5 text-status-late" />
                          <span>{item.distanceFromSiteM}m {item.withinGeofence ? 'Inside' : 'Outside'}</span>
                        </div>
                      </td>
                      <td className="text-xs text-txt-secondary font-mono tabular-nums">{item.capturedTime}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedItem(item)}>
                            Inspect
                          </Button>
                          <Button size="sm" variant="teal" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleDecision(item.id, 'approve')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleDecision(item.id, 'reject')}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Exception Inspection Detail Sheet */}
      <Sheet isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Exception Telemetry & Photo Audit">
        {selectedItem && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 bg-bg-surface-2 rounded-xl border border-border">
              <img src={selectedItem.photoUrl} alt={selectedItem.employeeName} className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500" />
              <div>
                <h4 className="font-bold text-txt-primary text-base">{selectedItem.employeeName}</h4>
                <p className="text-xs text-txt-secondary font-mono">{selectedItem.employeeCode} • {selectedItem.siteName}</p>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  {selectedItem.reason}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-txt-primary text-sm border-b border-border pb-1">Geofence GPS Coordinates</h5>
              <div className="p-3 bg-bg-surface-2 rounded-xl border border-border space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Site Campus:</span>
                  <span className="font-bold text-txt-primary">{selectedItem.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Station Post:</span>
                  <span className="font-bold text-brand-primary">{selectedItem.postName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Distance Status:</span>
                  <span className="font-bold text-status-late">{selectedItem.distanceFromSiteM} Meters ({selectedItem.withinGeofence ? 'Within Radius' : 'Outside Radius'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-tertiary">Check-in Method:</span>
                  <span className="font-bold text-txt-primary">{selectedItem.method}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <Button variant="destructive" leftIcon={<X className="w-4 h-4" />} onClick={() => handleDecision(selectedItem.id, 'reject')}>
                Reject Exception
              </Button>
              <Button variant="teal" leftIcon={<Check className="w-4 h-4" />} onClick={() => handleDecision(selectedItem.id, 'approve')}>
                Approve Exception
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </motion.div>
  );
};
