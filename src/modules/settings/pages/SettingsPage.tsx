import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Save, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog, PageHeader } from '../../../components/data';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/States';
import { useAuth } from '../../../core/auth';
import { queryKeys } from '../../../core/query';
import { settingsApi } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useToast } from '../../../hooks';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayIso = () => new Date().toISOString().slice(0, 10);

export const SettingsPage: React.FC = () => {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'rules' | 'leave' | 'holidays' | 'workspace'>('rules');

  const config = useQuery({ queryKey: queryKeys.settings, queryFn: () => settingsApi.getConfig() });
  const workspace = useQuery({ queryKey: queryKeys.workspace, queryFn: () => settingsApi.workspace() });

  const [form, setForm] = useState({
    defaultGeofenceRadiusM: 100,
    defaultGraceMinutes: 15,
    lateHalfDayAfterMin: 60,
    workingDaysPerMonth: 26,
    standardShiftHours: 8,
    autoApproveWithinGeofence: true,
    weeklyOffDays: [] as number[],
    annualCasualLeave: 0,
    annualEarnedLeave: 0,
    annualMedicalLeave: 0,
  });

  // React's "adjust state when a prop changes" pattern: when the server sends a
  // newer version of the config, the form re-seeds from it during render rather
  // than in an effect, which avoids a second render pass showing stale values.
  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  if (config.data && seededFrom !== config.data.updatedAt) {
    setSeededFrom(config.data.updatedAt);
    setForm({
      defaultGeofenceRadiusM: config.data.defaultGeofenceRadiusM,
      defaultGraceMinutes: config.data.defaultGraceMinutes,
      lateHalfDayAfterMin: config.data.lateHalfDayAfterMin,
      workingDaysPerMonth: config.data.workingDaysPerMonth,
      standardShiftHours: config.data.standardShiftHours,
      autoApproveWithinGeofence: config.data.autoApproveWithinGeofence,
      weeklyOffDays: config.data.weeklyOffDays,
      annualCasualLeave: config.data.annualCasualLeave,
      annualEarnedLeave: config.data.annualEarnedLeave,
      annualMedicalLeave: config.data.annualMedicalLeave,
    });
  }

  const save = useMutation({
    mutationFn: (body: Partial<typeof form>) => settingsApi.updateConfig(body),
    onSuccess: () => {
      toast.success('Settings saved', 'The attendance engine uses these values from the next check-in.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (error) => toast.error('Could not save settings', describeApiError(error)),
  });

  const canEdit = can('SETTINGS_UPDATE');
  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 disabled:opacity-60';

  if (config.isLoading) return <LoadingState label="Loading settings…" />;
  if (config.isError) return <ErrorState message={describeApiError(config.error)} onRetry={() => void config.refetch()} />;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Configuration"
        eyebrowIcon={<SettingsIcon className="w-3.5 h-3.5" aria-hidden />}
        title="Settings"
        description="The rules the attendance engine applies, and the policy new employees inherit."
      />

      <div className="flex gap-1 border-b border-border overflow-x-auto" role="tablist">
        {(
          [
            ['rules', 'Attendance rules'],
            ['leave', 'Leave policy'],
            ['holidays', 'Holidays'],
            ['workspace', 'Workspace'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors whitespace-nowrap min-h-[40px] ${
              tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate({
              defaultGeofenceRadiusM: Number(form.defaultGeofenceRadiusM),
              defaultGraceMinutes: Number(form.defaultGraceMinutes),
              lateHalfDayAfterMin: Number(form.lateHalfDayAfterMin),
              workingDaysPerMonth: Number(form.workingDaysPerMonth),
              standardShiftHours: Number(form.standardShiftHours),
              autoApproveWithinGeofence: form.autoApproveWithinGeofence,
              weeklyOffDays: form.weeklyOffDays,
            });
          }}
          className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 max-w-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Default geofence radius (m)</span>
              <input
                type="number"
                min={10}
                max={5000}
                disabled={!canEdit}
                value={form.defaultGeofenceRadiusM}
                onChange={(e) => setForm({ ...form, defaultGeofenceRadiusM: Number(e.target.value) })}
                className={fieldClass}
              />
              <span className="block text-[11px] text-txt-tertiary mt-1">Applied to new sites; each site can override it.</span>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Grace period (min)</span>
              <input
                type="number"
                min={0}
                max={240}
                disabled={!canEdit}
                value={form.defaultGraceMinutes}
                onChange={(e) => setForm({ ...form, defaultGraceMinutes: Number(e.target.value) })}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Half day after (min)</span>
              <input
                type="number"
                min={0}
                max={720}
                disabled={!canEdit}
                value={form.lateHalfDayAfterMin}
                onChange={(e) => setForm({ ...form, lateHalfDayAfterMin: Number(e.target.value) })}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Working days per month</span>
              <input
                type="number"
                min={1}
                max={31}
                disabled={!canEdit}
                value={form.workingDaysPerMonth}
                onChange={(e) => setForm({ ...form, workingDaysPerMonth: Number(e.target.value) })}
                className={fieldClass}
              />
              <span className="block text-[11px] text-txt-tertiary mt-1">Divides monthly salary into a per-day rate for payroll.</span>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-txt-secondary mb-1">Standard shift hours</span>
              <input
                type="number"
                min={1}
                max={24}
                disabled={!canEdit}
                value={form.standardShiftHours}
                onChange={(e) => setForm({ ...form, standardShiftHours: Number(e.target.value) })}
                className={fieldClass}
              />
              <span className="block text-[11px] text-txt-tertiary mt-1">Anything worked beyond this counts as overtime.</span>
            </label>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-bg-surface-2 border border-border">
            <input
              type="checkbox"
              disabled={!canEdit}
              checked={form.autoApproveWithinGeofence}
              onChange={(e) => setForm({ ...form, autoApproveWithinGeofence: e.target.checked })}
              className="mt-0.5"
            />
            <span>
              <span className="block text-xs font-bold text-txt-primary">Auto-approve clean check-ins</span>
              <span className="block text-[11px] text-txt-secondary mt-0.5 leading-relaxed">
                When on, an on-time check-in inside the geofence from an automated method is accepted without review.
                Turning this off sends every check-in to the exception queue.
              </span>
            </span>
          </label>

          <fieldset>
            <legend className="block text-xs font-bold text-txt-secondary mb-1.5">Weekly off days</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day, index) => {
                const isOff = form.weeklyOffDays.includes(index);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!canEdit}
                    aria-pressed={isOff}
                    onClick={() =>
                      setForm({
                        ...form,
                        weeklyOffDays: isOff
                          ? form.weeklyOffDays.filter((value) => value !== index)
                          : [...form.weeklyOffDays, index],
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors min-h-[34px] disabled:opacity-60 ${
                      isOff
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-border bg-bg-surface-2 text-txt-secondary'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {canEdit && (
            <div className="pt-3 border-t border-border">
              <Button type="submit" isLoading={save.isPending} leftIcon={<Save className="w-3.5 h-3.5" aria-hidden />}>
                Save attendance rules
              </Button>
            </div>
          )}
        </form>
      )}

      {tab === 'leave' && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate({
              annualCasualLeave: Number(form.annualCasualLeave),
              annualEarnedLeave: Number(form.annualEarnedLeave),
              annualMedicalLeave: Number(form.annualMedicalLeave),
            });
          }}
          className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 max-w-2xl"
        >
          <p className="text-xs text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-3 leading-relaxed">
            These are the balances a newly onboarded employee starts with. They are zero until you set your own policy —
            the platform does not assume an entitlement on your behalf. Existing employees keep the balance they already
            have; adjust an individual from their profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                ['annualCasualLeave', 'Casual leave'],
                ['annualEarnedLeave', 'Earned leave'],
                ['annualMedicalLeave', 'Medical leave'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="block text-xs font-bold text-txt-secondary mb-1">{label} (days/year)</span>
                <input
                  type="number"
                  min={0}
                  max={365}
                  step="0.5"
                  disabled={!canEdit}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                  className={fieldClass}
                />
              </label>
            ))}
          </div>

          {canEdit && (
            <div className="pt-3 border-t border-border">
              <Button type="submit" isLoading={save.isPending} leftIcon={<Save className="w-3.5 h-3.5" aria-hidden />}>
                Save leave policy
              </Button>
            </div>
          )}
        </form>
      )}

      {tab === 'holidays' && <HolidaysTab canEdit={canEdit} />}

      {tab === 'workspace' && (
        <div className="bg-bg-surface border border-border rounded-2xl p-5 space-y-4 max-w-2xl">
          {workspace.isLoading ? (
            <LoadingState label="Loading workspace details…" />
          ) : workspace.isError ? (
            <ErrorState message={describeApiError(workspace.error)} onRetry={() => void workspace.refetch()} />
          ) : (
            <>
              <h2 className="text-sm font-extrabold text-txt-primary">Organisation</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                {[
                  ['Name', workspace.data!.name],
                  ['Client code', workspace.data!.code],
                  ['Industry', workspace.data!.industry ?? '—'],
                  ['City', workspace.data!.city],
                  ['Contact', workspace.data!.contactPerson],
                  ['Contact email', workspace.data!.contactEmail],
                  ['Contact phone', workspace.data!.contactPhone],
                  ['Timezone', workspace.data!.timezone],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-txt-secondary">{label}</dt>
                    <dd className="font-semibold text-txt-primary mt-0.5 break-words">{value}</dd>
                  </div>
                ))}
              </dl>

              <h2 className="text-sm font-extrabold text-txt-primary pt-3 border-t border-border/60">
                Modules in your plan
              </h2>
              <div className="flex flex-wrap gap-2">
                {workspace.data!.modules.map((module) => (
                  <span
                    key={module.code}
                    title={module.description ?? undefined}
                    className="px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary text-[11px] font-bold"
                  >
                    {module.name}
                  </span>
                ))}
              </div>

              {workspace.data!.subscription && (
                <>
                  <h2 className="text-sm font-extrabold text-txt-primary pt-3 border-t border-border/60">Subscription</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    {[
                      ['Plan', workspace.data!.subscription.planName],
                      ['Pricing model', workspace.data!.subscription.pricingModel.replace('_', ' ')],
                      ['Billing cycle', workspace.data!.subscription.billingCycle.replace('_', ' ')],
                      ['User allowance', String(workspace.data!.subscription.maxUsers)],
                      ['Renews / expires', workspace.data!.subscription.expiryDate],
                      ['Status', workspace.data!.subscription.status],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-txt-secondary">{label}</dt>
                        <dd className="font-semibold text-txt-primary mt-0.5 capitalize">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-[11px] text-txt-tertiary leading-relaxed">
                    Modules and billing are managed by your platform administrator.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const HolidaysTab: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const year = new Date().getUTCFullYear();

  const [isAdding, setAdding] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [name, setName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const holidays = useQuery({
    queryKey: queryKeys.holidays(year),
    queryFn: () => settingsApi.holidays(year),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['settings'] });
    void queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const create = useMutation({
    mutationFn: () => settingsApi.createHoliday({ date, name, scope: 'NATIONAL' }),
    onSuccess: () => {
      toast.success('Holiday added', 'Recompute a day to see it reflected in the register.');
      setAdding(false);
      setName('');
      invalidate();
    },
    onError: (error) => toast.error('Could not add the holiday', describeApiError(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => settingsApi.deleteHoliday(id),
    onSuccess: () => {
      toast.success('Holiday removed');
      setPendingDelete(null);
      invalidate();
    },
    onError: (error) => toast.error('Could not remove the holiday', describeApiError(error)),
  });

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  return (
    <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden max-w-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border/70">
        <div>
          <h2 className="text-sm font-extrabold text-txt-primary">Holidays in {year}</h2>
          <p className="text-[11px] text-txt-secondary">A day marked as a holiday is not counted as an absence.</p>
        </div>
        {canEdit && !isAdding && (
          <Button size="sm" onClick={() => setAdding(true)} leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden />}>
            Add holiday
          </Button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
          className="p-4 border-b border-border/70 flex flex-col sm:flex-row gap-3 items-end bg-bg-surface-2"
        >
          <label className="flex-1">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Date</span>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
          </label>
          <label className="flex-1">
            <span className="block text-xs font-bold text-txt-secondary mb-1">Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Independence Day" className={fieldClass} />
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={create.isPending}>
              Add
            </Button>
          </div>
        </form>
      )}

      {holidays.isLoading ? (
        <LoadingState label="Loading holidays…" />
      ) : holidays.isError ? (
        <ErrorState message={describeApiError(holidays.error)} onRetry={() => void holidays.refetch()} />
      ) : holidays.data!.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No holidays recorded for ${year}`}
          description="Add the days your organisation observes so they are not counted as absences."
          action={canEdit ? { label: 'Add a holiday', onClick: () => setAdding(true), icon: <Plus className="w-3.5 h-3.5" /> } : undefined}
          className="border-0"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {holidays.data!.map((holiday) => (
            <li key={holiday.id} className="flex items-center justify-between px-4 py-3 text-xs">
              <div>
                <span className="font-bold text-txt-primary">{holiday.name}</span>
                <span className="ml-2 text-txt-secondary tabular-nums">{holiday.date}</span>
              </div>
              {canEdit && (
                <button
                  onClick={() => setPendingDelete({ id: holiday.id, name: holiday.name })}
                  aria-label={`Remove ${holiday.name}`}
                  className="text-status-absent p-1 rounded-md hover:bg-status-absent/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Remove ${pendingDelete?.name ?? 'this holiday'}?`}
        message="Days already resolved keep their state until they are recomputed."
        confirmLabel="Remove"
        tone="destructive"
        isBusy={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
