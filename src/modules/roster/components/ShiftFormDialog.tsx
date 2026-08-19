import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { rosterApi, type Shift, type Site } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  shift: Shift | null;
  sites: Site[];
  onClose: () => void;
  onSaved: () => void;
}

/**
 * A shift is created against a post, and the post's site comes with it. The
 * site select exists only to narrow the post list — the pair is submitted
 * together and the server rejects any mismatch.
 */
export const ShiftFormDialog: React.FC<Props> = ({ shift, sites, onClose, onSaved }) => {
  const isEditing = shift !== null;

  const [siteId, setSiteId] = useState(shift?.site.id ?? sites[0]?.id ?? '');
  const [postId, setPostId] = useState(shift?.post.id ?? '');
  const [name, setName] = useState(shift?.name ?? '');
  const [startTime, setStartTime] = useState(shift?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(shift?.endTime ?? '16:00');
  const [graceMinutes, setGrace] = useState(String(shift?.graceMinutes ?? 15));
  const [lateHalfDayAfterMin, setLateHalfDay] = useState(String(shift?.lateHalfDayAfterMin ?? 60));
  const [weeklyOff, setWeeklyOff] = useState<number[]>(shift?.weeklyOff ?? [0]);
  const [error, setError] = useState('');

  const posts = useMemo(() => {
    const site = sites.find((entry) => entry.id === siteId);
    return ((site?.posts ?? []) as { id: string; name: string; isActive?: boolean }[]).filter(
      (post) => post.isActive !== false,
    );
  }, [sites, siteId]);

  const crossesMidnight = endTime <= startTime;

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name,
        startTime,
        endTime,
        graceMinutes: Number(graceMinutes),
        lateHalfDayAfterMin: Number(lateHalfDayAfterMin),
        weeklyOff,
      };
      return isEditing ? rosterApi.updateShift(shift!.id, body) : rosterApi.createShift({ ...body, siteId, postId });
    },
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!isEditing && !postId) {
      setError('Select the post this shift is worked at.');
      return;
    }
    save.mutate();
  };

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">{isEditing ? `Edit ${shift!.name}` : 'Define a shift'}</h2>
          <p className="text-xs text-txt-secondary mt-0.5">A shift belongs to one post at one site.</p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-bold text-txt-secondary mb-1">
                  Site <span className="text-status-absent">*</span>
                </span>
                <select
                  required
                  value={siteId}
                  onChange={(event) => {
                    setSiteId(event.target.value);
                    setPostId('');
                  }}
                  className={fieldClass}
                >
                  <option value="">Select a site…</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-txt-secondary mb-1">
                  Post <span className="text-status-absent">*</span>
                </span>
                <select
                  required
                  value={postId}
                  onChange={(event) => setPostId(event.target.value)}
                  disabled={!siteId || posts.length === 0}
                  className={`${fieldClass} disabled:opacity-50`}
                >
                  <option value="">
                    {!siteId ? 'Select a site first' : posts.length === 0 ? 'This site has no posts yet' : 'Select a post…'}
                  </option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {isEditing && (
            <p className="text-[11px] text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-2.5">
              Deployed at <span className="font-bold text-txt-primary">{shift!.site.name} → {shift!.post.name}</span>. Move
              the shift by creating a new one on the other post.
            </p>
          )}

          <label className="block">
            <span className="block text-xs font-bold text-txt-secondary mb-1">
              Shift name <span className="text-status-absent">*</span>
            </span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="General day shift" className={fieldClass} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                Start <span className="text-status-absent">*</span>
              </span>
              <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">
                End <span className="text-status-absent">*</span>
              </span>
              <input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} />
            </label>
          </div>

          {crossesMidnight && (
            <p className="text-[11px] text-status-leave bg-status-leave/10 border border-status-leave/25 rounded-xl p-2.5 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" aria-hidden />
              This shift ends the following morning and will be recorded as a night shift.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Grace period (min)</span>
              <input type="number" min={0} max={240} value={graceMinutes} onChange={(e) => setGrace(e.target.value)} className={fieldClass} />
              <span className="block text-[11px] text-txt-tertiary mt-1">Arriving inside this window still counts as on time.</span>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Half day after (min)</span>
              <input
                type="number"
                min={0}
                max={720}
                value={lateHalfDayAfterMin}
                onChange={(e) => setLateHalfDay(e.target.value)}
                className={fieldClass}
              />
              <span className="block text-[11px] text-txt-tertiary mt-1">Beyond grace plus this, the day is a late half day.</span>
            </label>
          </div>

          <fieldset>
            <legend className="block text-xs font-bold text-txt-secondary mb-1.5">Weekly off</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day, index) => {
                const isOff = weeklyOff.includes(index);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setWeeklyOff((current) =>
                        current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
                      )
                    }
                    aria-pressed={isOff}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors min-h-[34px] ${
                      isOff
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-border bg-bg-surface-2 text-txt-secondary hover:text-txt-primary'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              {isEditing ? 'Save changes' : 'Define shift'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
