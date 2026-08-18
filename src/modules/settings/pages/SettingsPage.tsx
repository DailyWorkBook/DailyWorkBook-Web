import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { settingsApi } from '../../../services/settingsApi';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [lateHalfDayMin, setLateHalfDayMin] = useState(60);
  const [workingDays, setWorkingDays] = useState(26);
  const [autoApprove, setAutoApprove] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const data = await settingsApi.getAttendanceConfig();
        if (data) {
          setGeofenceRadius(data.defaultGeofenceRadiusM || 100);
          setGraceMinutes(data.defaultGraceMinutes || 15);
          setLateHalfDayMin(data.lateHalfDayAfterMin || 60);
          setWorkingDays(data.workingDaysPerMonth || 26);
          setAutoApprove(data.autoApproveWithinGeofence !== false);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsApi.updateAttendanceConfig({
        defaultGeofenceRadiusM: Number(geofenceRadius),
        defaultGraceMinutes: Number(graceMinutes),
        lateHalfDayAfterMin: Number(lateHalfDayMin),
        workingDaysPerMonth: Number(workingDays),
        autoApproveWithinGeofence: autoApprove
      });
      setMsg('Settings updated successfully in database!');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-xs font-bold flex items-center gap-1">
              <Settings className="w-4 h-4 text-brand-primary" /> SYSTEM CONFIGURATION & PARAMETERS
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Attendance Engine Settings
          </h1>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-xs font-bold">
          {msg}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Loading configuration parameters from database...
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSave} className="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm max-w-xl space-y-4">
          <div>
            <label className="text-xs font-bold text-txt-primary">Default Geofence Radius (meters)</label>
            <input
              type="number"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
              required
            />
            <p className="text-[11px] text-txt-secondary mt-0.5">Maximum allowed GPS variance from site center coordinates.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-txt-primary">Grace Period (minutes)</label>
            <input
              type="number"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(Number(e.target.value))}
              className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
              required
            />
            <p className="text-[11px] text-txt-secondary mt-0.5">Minutes allowed after shift start time before punch is flagged as Late.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-txt-primary">Late Half-Day Threshold (minutes)</label>
            <input
              type="number"
              value={lateHalfDayMin}
              onChange={(e) => setLateHalfDayMin(Number(e.target.value))}
              className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-txt-primary">Standard Working Days / Month</label>
            <input
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className="w-full mt-1 p-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoApprove"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary"
            />
            <label htmlFor="autoApprove" className="text-xs font-bold text-txt-primary cursor-pointer">
              Auto-approve punches within valid geofence radius
            </label>
          </div>

          <div className="pt-3">
            <Button type="submit" disabled={saving} className="bg-brand-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save System Parameters
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
