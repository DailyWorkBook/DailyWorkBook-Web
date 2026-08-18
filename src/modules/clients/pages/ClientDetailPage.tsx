import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, MapPin, Users, Phone, Mail, DollarSign, Calendar, Save, CheckCircle2, ShieldCheck, ChevronRight, Camera, Edit3 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { INITIAL_CLIENTS, Client } from '../../../mockData/clients';
import { INITIAL_SITES, Site, Post } from '../../../mockData/sites';
import { INITIAL_EMPLOYEES, Employee } from '../../../mockData/employees';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialClient = INITIAL_CLIENTS.find(c => c.id === id) || INITIAL_CLIENTS[0];
  const [client, setClient] = useState<Client>(initialClient);
  const clientSites = INITIAL_SITES.filter(s => s.clientId === client.id);
  const clientGuards = INITIAL_EMPLOYEES.filter(e => e.clientId === client.id);

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'overview' | 'guards' | 'payroll'>('hierarchy');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(clientSites[0]?.id || '');
  const [isSaved, setIsSaved] = useState(false);

  // Logo Photo Edit State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [newLogoUrl, setNewLogoUrl] = useState(client.logoUrl);

  // Editable Payroll Config state
  const [payrollConfig, setPayrollConfig] = useState(client.payrollConfig);

  const activeSite = clientSites.find(s => s.id === selectedSiteId) || clientSites[0];

  const handleUpdateLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogoUrl) return;
    setClient(prev => ({ ...prev, logoUrl: newLogoUrl }));
    setIsLogoModalOpen(false);
  };

  const handleSavePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Breadcrumbs & Navigation Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
          <span className="text-txt-tertiary text-xs">/</span>
          <span className="text-xs font-bold text-txt-primary">{client.name}</span>
        </div>

        <Button variant="secondary" size="sm" leftIcon={<Camera className="w-4 h-4" />} onClick={() => setIsLogoModalOpen(true)}>
          Change Client Logo
        </Button>
      </div>

      {/* Header Banner Card with Logo Trigger */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/40">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setIsLogoModalOpen(true)}>
            <img src={client.logoUrl} alt={client.name} className="w-16 h-16 rounded-2xl object-cover border border-border shadow-md group-hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-brand-primary text-white rounded-full border border-white shadow">
              <Camera className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-txt-primary tracking-tight">{client.name}</h1>
              <Badge status={client.contractStatus} />
            </div>
            <p className="text-xs text-txt-secondary mt-1 flex items-center gap-3">
              <span>Code: <strong className="font-mono text-brand-primary">{client.code}</strong></span>
              <span>•</span>
              <span>{client.industry}</span>
              <span>•</span>
              <span>{client.city}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="text-right">
            <span className="text-txt-tertiary block">Active Sites</span>
            <span className="text-xl font-extrabold text-brand-primary tabular-nums">{clientSites.length} Sites</span>
          </div>
          <div className="text-right">
            <span className="text-txt-tertiary block">Deployed Guards</span>
            <span className="text-xl font-extrabold text-brand-teal tabular-nums">{clientGuards.length} Guards</span>
          </div>
          <div className="text-right">
            <span className="text-txt-tertiary block">Monthly Billing</span>
            <span className="text-xl font-extrabold text-txt-primary tabular-nums">₹{(client.monthlyBillingAmount / 100000).toFixed(2)}L</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border gap-6 text-xs">
        {(['hierarchy', 'overview', 'guards', 'payroll'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {tab === 'hierarchy' ? 'Sites & Posts Hierarchy' :
             tab === 'overview' ? 'Overview & Contract' :
             tab === 'guards' ? `Deployed Guards (${clientGuards.length})` :
             'Client Payroll Configuration'}
          </button>
        ))}
      </div>

      {/* TAB 1: SITES & POSTS HIERARCHY (Client -> Site -> Post Flow) */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Sites under Client */}
          <div className="wt-card p-4 space-y-3">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Associated Sites ({clientSites.length})</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/sites')}>+ Add Site</Button>
            </div>

            <div className="space-y-2">
              {clientSites.map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedSiteId === site.id
                      ? 'bg-brand-primary-050 border-brand-primary text-brand-primary shadow-sm'
                      : 'bg-bg-surface-2 border-border text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-3'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-txt-primary">{site.name}</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5">{site.addressLine}, {site.city}</div>
                    <div className="flex items-center gap-3 text-[11px] mt-2 font-medium">
                      <span className="text-brand-primary">{site.postsCount} Posts</span>
                      <span>•</span>
                      <span className="text-brand-teal">{site.guardsCount} Guards</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-txt-tertiary" />
                </button>
              ))}
            </div>
          </div>

          {/* Right 2 Columns: Selected Site Posts & Location Details */}
          <div className="lg:col-span-2 space-y-6">
            {activeSite && (
              <div className="wt-card p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary">
                        SELECTED SITE
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-txt-primary mt-1">{activeSite.name}</h2>
                    <p className="text-xs text-txt-secondary flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-txt-tertiary" />
                      <span>{activeSite.addressLine}, {activeSite.city}, {activeSite.state} ({activeSite.zipCode})</span>
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => navigate(`/sites/${activeSite.id}`)}>
                    Open Map & Geofence
                  </Button>
                </div>

                {/* Posts Nested Under Selected Site */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-txt-primary">Posts & Duty Stations ({activeSite.posts.length})</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left wt-table">
                      <thead>
                        <tr>
                          <th>POST NAME</th>
                          <th>REQUIRED GUARDS</th>
                          <th>SHIFT TYPE</th>
                          <th>LOCATION & GEOFENCE</th>
                          <th>QR CODE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSite.posts.map(post => (
                          <tr key={post.id}>
                            <td>
                              <div className="font-bold text-xs text-txt-primary">{post.name}</div>
                              <div className="text-[11px] text-txt-tertiary max-w-xs truncate">{post.postInstructions}</div>
                            </td>
                            <td className="font-bold text-brand-teal tabular-nums">{post.guardCountRequired} Guards</td>
                            <td className="text-xs font-semibold text-txt-secondary">{post.shiftType}</td>
                            <td>
                              <div className="text-xs text-txt-primary font-mono">{post.latitude.toFixed(4)}, {post.longitude.toFixed(4)}</div>
                              <div className="text-[11px] text-brand-primary font-semibold">{post.geofenceRadiusM}m Geofence</div>
                            </td>
                            <td className="font-mono text-xs text-txt-secondary">{post.qrCodeId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & CONTRACT DETAILS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="wt-card p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-txt-primary">Corporate Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-txt-tertiary block">Official Name</span>
                <span className="font-bold text-txt-primary text-sm">{client.name}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Industry Sector</span>
                <span className="font-semibold text-txt-primary">{client.industry}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Billing Address</span>
                <span className="text-txt-primary">{client.billingAddress}, {client.city}</span>
              </div>
            </div>
          </div>

          <div className="wt-card p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-txt-primary">Contract & Contact Person</h3>
            <div className="space-y-3">
              <div>
                <span className="text-txt-tertiary block">Key Contact Person</span>
                <span className="font-bold text-txt-primary">{client.contactPerson}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Contact Email & Phone</span>
                <span className="text-txt-primary">{client.contactEmail} • {client.contactPhone}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Contract Tenure</span>
                <span className="font-semibold text-brand-primary">{client.contractStartDate} to {client.contractEndDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOYED GUARD ROSTER */}
      {activeTab === 'guards' && (
        <div className="wt-card p-6 space-y-4">
          <h3 className="text-base font-bold text-txt-primary">Guards Deployed at {client.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th>EMPLOYEE CODE & NAME</th>
                  <th>POSITION / ROLE</th>
                  <th>ASSIGNED SITE & POST</th>
                  <th>JOINING DATE</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {clientGuards.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={g.photoUrl} alt={g.firstName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-xs text-txt-primary">{g.firstName} {g.lastName}</div>
                          <div className="text-[11px] text-txt-secondary">{g.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold text-brand-primary text-xs">{g.role.replace('_', ' ')}</td>
                    <td className="text-xs text-txt-primary">{g.currentSiteName} - <span className="text-txt-secondary">{g.currentPostName}</span></td>
                    <td className="text-xs text-txt-secondary tabular-nums">{g.dateOfJoining}</td>
                    <td><Badge status={g.status} /></td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/employees/${g.id}`)}>
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT PAYROLL CONFIGURATION */}
      {activeTab === 'payroll' && (
        <form onSubmit={handleSavePayroll} className="wt-card p-6 space-y-6 max-w-2xl text-xs">
          <div>
            <h3 className="text-base font-bold text-txt-primary">Configurable Client Payroll Rates</h3>
            <p className="text-txt-secondary mt-0.5">Customize daily wage rates, overtime, allowances, and statutory PF/ESI rates specific to {client.name}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Base Daily Wage (₹/day)</label>
                <input
                  type="number"
                  value={payrollConfig.baseDailyWage}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, baseDailyWage: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Overtime Hourly Rate (₹/hr)</label>
                <input
                  type="number"
                  value={payrollConfig.overtimeRatePerHour}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, overtimeRatePerHour: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Night Shift Allowance (₹/shift)</label>
                <input
                  type="number"
                  value={payrollConfig.nightShiftAllowancePerShift}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, nightShiftAllowancePerShift: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Monthly Bonus Allowance (₹)</label>
                <input
                  type="number"
                  value={payrollConfig.bonusAllowanceMonthly}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, bonusAllowanceMonthly: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Statutory PF Deduction (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={payrollConfig.pfDeductionPercentage}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, pfDeductionPercentage: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Statutory ESI Deduction (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={payrollConfig.esiDeductionPercentage}
                  onChange={e => setPayrollConfig(prev => ({ ...prev, esiDeductionPercentage: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-bold text-txt-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Client Payroll Settings
            </Button>
            {isSaved && <span className="text-xs font-bold text-brand-teal">Payroll rules saved successfully!</span>}
          </div>
        </form>
      )}

      {/* Change Client Logo Picture Modal */}
      <Dialog isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} title={`Change Logo: ${client.name}`}>
        <form onSubmit={handleUpdateLogo} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Client Logo Image URL / File</label>
            <input
              type="text"
              required
              value={newLogoUrl}
              onChange={e => setNewLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          {newLogoUrl && (
            <div className="flex items-center justify-center p-3 bg-bg-surface-2 rounded-xl border border-border">
              <img src={newLogoUrl} alt="Logo Preview" className="w-20 h-20 rounded-xl object-cover shadow-sm border border-border" />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsLogoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" leftIcon={<Camera className="w-4 h-4" />}>
              Update Client Logo
            </Button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  );
};
