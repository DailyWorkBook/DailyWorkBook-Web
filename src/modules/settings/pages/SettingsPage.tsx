import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Calendar, Building2, Sun, Moon, Save, Plus, Trash2, Shield, Bell, CheckCircle2, Clock, MapPin, Radio, ShieldCheck, Mail, Phone, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../core/theme';
import { INITIAL_CONFIG, INITIAL_HOLIDAYS, INITIAL_ORG_PROFILE, Holiday, OrgProfile, AttendanceConfig } from '../../../mockData/settings';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'rules' | 'holidays' | 'org' | 'alerts' | 'appearance'>('rules');

  const [config, setConfig] = useState<AttendanceConfig>(INITIAL_CONFIG);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [org, setOrg] = useState<OrgProfile>(INITIAL_ORG_PROFILE);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Alert Settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [geofenceBreachThresholdM, setGeofenceBreachThresholdM] = useState(30);

  // New Holiday State
  const [newHoliName, setNewHoliName] = useState('');
  const [newHoliDate, setNewHoliDate] = useState('2026-12-25');
  const [newHoliScope, setNewHoliScope] = useState<'NATIONAL' | 'STATE' | 'SITE'>('NATIONAL');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Attendance logic rules updated successfully!');
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Organization profile & PSARA license info saved!');
  };

  const handleSaveAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Notification & Exception alert routing saved!');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliName) return;
    setHolidays(prev => [...prev, { id: `hol-${Date.now()}`, date: newHoliDate, name: newHoliName, scope: newHoliScope }]);
    setNewHoliName('');
    triggerToast(`Added holiday "${newHoliName}"`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              System Administration & Global Controls
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">System Settings</h1>
          <p className="text-xs text-txt-secondary mt-1">Configure attendance algorithms, geofences, holiday master, PSARA licensing, and console preferences</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-txt-tertiary block">PSARA License</span>
            <span className="text-xs font-bold text-brand-teal flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Verified & Active
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border gap-6 text-xs overflow-x-auto scrollbar-none">
        {[
          { key: 'rules', label: 'Attendance Logic & Geofence', icon: Settings },
          { key: 'holidays', label: 'Holidays & Operational Calendar', icon: Calendar },
          { key: 'org', label: 'Organization & PSARA License', icon: Building2 },
          { key: 'alerts', label: 'Alerts & Exception Routing', icon: Bell },
          { key: 'appearance', label: 'Console Appearance & Theme', icon: Sun }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-txt-secondary hover:text-txt-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ATTENDANCE RULES & GEOFENCE LOGIC */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 wt-card p-6 space-y-6 text-xs">
            <h3 className="text-base font-bold text-txt-primary border-b border-border pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-primary" />
              <span>Attendance Algorithm & Geofence Parameters</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-txt-primary">Default Geofence Boundary Radius</label>
                  <span className="font-mono font-bold text-brand-primary">{config.defaultGeofenceRadiusM} Meters</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={500}
                  step={10}
                  value={config.defaultGeofenceRadiusM}
                  onChange={e => setConfig(prev => ({ ...prev, defaultGeofenceRadiusM: Number(e.target.value) }))}
                  className="w-full accent-brand-primary cursor-pointer"
                />
                <p className="text-[11px] text-txt-tertiary mt-1">Global radius applied to new sites when no custom geofence is defined.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-txt-primary mb-1">Check-in Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={config.defaultGraceMinutes}
                    onChange={e => setConfig(prev => ({ ...prev, defaultGraceMinutes: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                  />
                  <p className="text-[11px] text-txt-tertiary mt-1">Arrivals within grace time are marked ON TIME.</p>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Late Half-Day Threshold (Minutes)</label>
                  <input
                    type="number"
                    value={config.lateHalfDayAfterMin}
                    onChange={e => setConfig(prev => ({ ...prev, lateHalfDayAfterMin: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                  />
                  <p className="text-[11px] text-txt-tertiary mt-1">Arrivals late by &gt;60 min convert to Half-Day.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-txt-primary mb-1">GPS Telemetry Ping Interval (Seconds)</label>
                  <select
                    value={config.gpsTelemetryPingIntervalSec}
                    onChange={e => setConfig(prev => ({ ...prev, gpsTelemetryPingIntervalSec: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                  >
                    <option value={5}>5 Seconds (High Precision)</option>
                    <option value={10}>10 Seconds (Standard)</option>
                    <option value={30}>30 Seconds (Battery Saver)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Overtime Shift Threshold (Hours)</label>
                  <input
                    type="number"
                    value={config.overtimeThresholdHours}
                    onChange={e => setConfig(prev => ({ ...prev, overtimeThresholdHours: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg-surface-2 border border-border rounded-xl mt-4">
                <div>
                  <span className="font-bold text-txt-primary block">Auto-Approve In-Geofence QR Scans</span>
                  <span className="text-[11px] text-txt-secondary">Automatically verify check-ins scan inside authorized geofence radius.</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoApproveWithinGeofence}
                  onChange={e => setConfig(prev => ({ ...prev, autoApproveWithinGeofence: e.target.checked }))}
                  className="w-5 h-5 accent-brand-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                Save Rules Configuration
              </Button>
            </div>
          </div>

          <div className="wt-card p-6 space-y-4 text-xs h-fit">
            <h4 className="font-bold text-txt-primary text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              <span>Logic Rules Preview</span>
            </h4>

            <div className="p-3 bg-bg-surface-2 border border-border rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-txt-tertiary">Grace Margin:</span>
                <span className="font-bold text-brand-teal">+{config.defaultGraceMinutes} Mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-txt-tertiary">Geofence Radius:</span>
                <span className="font-bold text-brand-primary">{config.defaultGeofenceRadiusM}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-txt-tertiary">Telemetry Interval:</span>
                <span className="font-mono text-txt-primary">Every {config.gpsTelemetryPingIntervalSec}s</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: HOLIDAYS MASTER */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          <form onSubmit={handleAddHoliday} className="wt-card p-4 flex flex-col sm:flex-row items-center gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Holiday Name (e.g. Christmas Day)"
              value={newHoliName}
              onChange={e => setNewHoliName(e.target.value)}
              className="w-full sm:flex-1 p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
            <input
              type="date"
              value={newHoliDate}
              onChange={e => setNewHoliDate(e.target.value)}
              className="w-full sm:w-auto p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
            />
            <select
              value={newHoliScope}
              onChange={e => setNewHoliScope(e.target.value as any)}
              className="w-full sm:w-auto p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
            >
              <option value="NATIONAL">National Holiday</option>
              <option value="STATE">State Holiday</option>
              <option value="SITE">Site Specific</option>
            </select>
            <Button variant="primary" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
              Add Holiday
            </Button>
          </form>

          <div className="wt-card p-6 space-y-4">
            <h3 className="text-base font-bold text-txt-primary">Configured Operational Holidays ({holidays.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays.map(h => (
                <div key={h.id} className="p-4 bg-bg-surface-2 border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-txt-primary">{h.name}</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-brand-primary">{h.date}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary-050 text-brand-primary">
                        {h.scope}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setHolidays(prev => prev.filter(x => x.id !== h.id));
                      triggerToast(`Removed holiday "${h.name}"`);
                    }}
                    className="p-2 text-txt-tertiary hover:text-status-absent transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATION PROFILE & PSARA LICENSE */}
      {activeTab === 'org' && (
        <form onSubmit={handleSaveOrg} className="wt-card p-6 space-y-6 max-w-3xl text-xs">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-txt-primary">Organization Profile & PSARA Security License</h3>
              <p className="text-txt-secondary mt-0.5">Manage official corporate agency details and Private Security Agencies Regulation Act (PSARA) details</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PSARA Verified
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Registered Security Agency Name</label>
              <input
                type="text"
                required
                value={org.name}
                onChange={e => setOrg(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Corporate Registration No (CIN)</label>
                <input
                  type="text"
                  value={org.registrationNo}
                  onChange={e => setOrg(prev => ({ ...prev, registrationNo: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-txt-primary mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={org.gstin}
                  onChange={e => setOrg(prev => ({ ...prev, gstin: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-brand-primary-050/30 border border-brand-primary/20 rounded-xl">
              <div>
                <label className="block font-bold text-brand-primary mb-1">PSARA License Number</label>
                <input
                  type="text"
                  value={org.psaraLicenseNo}
                  onChange={e => setOrg(prev => ({ ...prev, psaraLicenseNo: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface border border-border rounded-btn font-mono font-bold text-txt-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-primary mb-1">PSARA License Expiry Date</label>
                <input
                  type="date"
                  value={org.psaraExpiryDate}
                  onChange={e => setOrg(prev => ({ ...prev, psaraExpiryDate: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface border border-border rounded-btn font-mono font-bold text-txt-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Chief Security Officer (CSO)</label>
                <input
                  type="text"
                  value={org.chiefSecurityOfficer}
                  onChange={e => setOrg(prev => ({ ...prev, chiefSecurityOfficer: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-txt-primary mb-1">Support Contact Phone</label>
                <input
                  type="text"
                  value={org.contactPhone}
                  onChange={e => setOrg(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-txt-primary mb-1">Registered Agency Headquarters Address</label>
              <input
                type="text"
                value={org.registeredAddress}
                onChange={e => setOrg(prev => ({ ...prev, registeredAddress: e.target.value }))}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Organization & License Info
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: ALERT & EXCEPTION ROUTING */}
      {activeTab === 'alerts' && (
        <form onSubmit={handleSaveAlerts} className="wt-card p-6 space-y-6 max-w-2xl text-xs">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-txt-primary">Notification Channels & Exception Routing</h3>
            <p className="text-txt-secondary mt-0.5">Configure automated alerts for geofence breaches, unattended posts, and late arrivals</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-surface-2 border border-border rounded-xl">
              <div>
                <span className="font-bold text-txt-primary block">Email Alerts to Control Room</span>
                <span className="text-[11px] text-txt-secondary">Send immediate email notifications on high severity breaches.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-brand-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-surface-2 border border-border rounded-xl">
              <div>
                <span className="font-bold text-txt-primary block">SMS & WhatsApp Alerts to Field Supervisors</span>
                <span className="text-[11px] text-txt-secondary">Dispatch SMS alerts when a duty post is unattended for &gt;15 min.</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={e => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-brand-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-surface-2 border border-border rounded-xl">
              <div>
                <span className="font-bold text-txt-primary block">Mobile App Push Notifications</span>
                <span className="text-[11px] text-txt-secondary">Send push alerts to field supervisor mobile app.</span>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={e => setPushAlerts(e.target.checked)}
                className="w-5 h-5 accent-brand-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Notification Routing
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: APPEARANCE & THEME */}
      {activeTab === 'appearance' && (
        <div className="wt-card p-6 space-y-4 max-w-md text-xs">
          <h3 className="text-base font-bold text-txt-primary">Console Appearance & Color Theme</h3>
          <p className="text-txt-secondary">Toggle dark/light mode for the WatchTower admin console.</p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={toggleTheme}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light' ? 'border-brand-primary bg-brand-primary-050 text-brand-primary' : 'border-border text-txt-secondary'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-bold">Light Mode</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border text-txt-secondary'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-bold">Dark Mode</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
