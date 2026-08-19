import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { rosterApi, type EmployeeSummary, type Shift } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

interface Props {
  shifts: Shift[];
  employees: EmployeeSummary[];
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * The site and post are read off the chosen shift rather than picked
 * separately — the hierarchy is already decided by which shift you select, and
 * offering the choice again would only create a way to get it wrong.
 */
export const RosterEntryDialog: React.FC<Props> = ({ shifts, employees, defaultDate, onClose, onSaved }) => {
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? '');
  const [employeeId, setEmployeeId] = useState('');
  const [rosterDate, setRosterDate] = useState(defaultDate);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedShift = shifts.find((shift) => shift.id === shiftId);

  const save = useMutation({
    mutationFn: () => {
      if (!selectedShift) throw new Error('Select a shift.');
      return rosterApi.createEntry({
        siteId: selectedShift.site.id,
        postId: selectedShift.post.id,
        shiftId: selectedShift.id,
        employeeId,
        rosterDate,
        notes: notes || undefined,
      });
    },
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Assign to a shift</h2>
          <p className="text-xs text-txt-secondary mt-0.5">The entry stays a draft until the day is published.</p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            if (!employeeId) {
              setError('Select the employee to roster.');
              return;
            }
            save.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Shift <span className="text-status-absent">*</span>
            </span>
            <select required value={shiftId} onChange={(e) => setShiftId(e.target.value)} className={fieldClass}>
              <option value="">Select a shift…</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.site.name} → {shift.post.name} · {shift.name} ({shift.startTime}–{shift.endTime})
                </option>
              ))}
            </select>
          </label>

          {selectedShift && (
            <p className="text-[11px] text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-2.5">
              Deploys to <span className="font-bold text-txt-primary">{selectedShift.site.name} → {selectedShift.post.name}</span>,
              working <span className="font-mono font-bold text-txt-primary">{selectedShift.startTime}–{selectedShift.endTime}</span>.
            </p>
          )}

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Employee <span className="text-status-absent">*</span>
            </span>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={fieldClass}>
              <option value="">Select an employee…</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeCode})
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <span className="block text-[11px] text-status-late mt-1">
                No active employees are available to roster.
              </span>
            )}
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Date <span className="text-status-absent">*</span>
            </span>
            <input required type="date" value={rosterDate} onChange={(e) => setRosterDate(e.target.value)} className={fieldClass} />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Notes</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              Add to roster
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
